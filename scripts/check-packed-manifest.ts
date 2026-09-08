import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const

type DependencySection = (typeof dependencySections)[number]
type DependencyMap = Record<string, string>

type PackageManifest = {
  name?: string
  version?: string
  main?: string
  module?: string
  types?: string
  exports?: unknown
  files?: string[]
} & Partial<Record<DependencySection, DependencyMap>>

function readJson(path: string): PackageManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageManifest
}

function stableDependencies(manifest: PackageManifest, section: DependencySection): string {
  return JSON.stringify(
    Object.entries(manifest[section] ?? {}).sort(([left], [right]) => left.localeCompare(right)),
  )
}

function collectExportTargets(value: unknown): string[] {
  if (typeof value === 'string') return value.startsWith('./') ? [value] : []
  if (Array.isArray(value)) return value.flatMap(collectExportTargets)
  if (!value || typeof value !== 'object') return []
  return Object.values(value).flatMap(collectExportTargets)
}

function tarPath(target: string): string {
  const relativeTarget = target.startsWith('./') ? target.slice(2) : target
  if (!relativeTarget || relativeTarget.startsWith('../') || relativeTarget.includes('/../')) {
    throw new Error(`Unsupported package target: ${target}`)
  }
  return `package/${relativeTarget}`
}

function assertPackedFiles(
  archive: string,
  source: PackageManifest,
  packed: PackageManifest,
): void {
  const entries = new Set(
    execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' })
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean),
  )

  const requiredFiles = new Set(['package.json', ...(source.files ?? [])])
  for (const target of [
    source.main,
    source.module,
    source.types,
    ...collectExportTargets(source.exports),
  ]) {
    if (target) requiredFiles.add(target)
  }

  for (const declared of requiredFiles) {
    const path = tarPath(declared)
    const present = entries.has(path) || [...entries].some((entry) => entry.startsWith(`${path}/`))
    if (!present) throw new Error(`Packed tarball is missing required path ${path}`)
  }

  if (JSON.stringify(source.exports) !== JSON.stringify(packed.exports)) {
    throw new Error('Packed manifest exports do not match source package.json')
  }
}

function runIsolatedConsumer(archive: string): void {
  const consumerDir = mkdtempSync(join(tmpdir(), 'aihu-plugin-data-consumer-'))
  try {
    execFileSync(
      'npm',
      ['install', '--ignore-scripts', '--no-package-lock', '--prefix', consumerDir, archive],
      { stdio: 'inherit' },
    )
    execFileSync(
      'node',
      [
        '--input-type=module',
        '-e',
        `import { createResourceSerializer, createResourceStore } from '@aihu-plugin/data'
const store = createResourceStore()
store.set('consumer-check', { status: 'ready', data: { ok: true } })
store.markDehydratable('consumer-check')
const payload = createResourceSerializer(store)()
if (payload.resources['consumer-check']?.data?.ok !== true) {
  throw new Error('isolated consumer serialization check failed')
}
console.log('isolated consumer import and serialization verified')`,
      ],
      { cwd: consumerDir, stdio: 'inherit' },
    )
  } finally {
    rmSync(consumerDir, { recursive: true, force: true })
  }
}

function readJsonFromArchive(archive: string): PackageManifest {
  return JSON.parse(
    execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }),
  ) as PackageManifest
}

const requestedArchive = process.argv[2] || process.env.RELEASE_TARBALL
const tempDir = mkdtempSync(join(tmpdir(), 'aihu-plugin-data-pack-'))
const source = readJson('package.json')
try {
  if (requestedArchive) {
    mkdirSync(dirname(requestedArchive), { recursive: true })
    rmSync(requestedArchive, { force: true })
  }
  const raw = execFileSync('npm', ['pack', '--json', '--pack-destination', tempDir], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  const [entry] = JSON.parse(raw) as Array<{ filename?: string }>
  if (!entry?.filename) throw new Error('npm pack did not return an artifact filename')

  const generatedArchive = join(tempDir, entry.filename)
  const archive = requestedArchive ?? generatedArchive
  if (requestedArchive) {
    copyFileSync(generatedArchive, requestedArchive)
    rmSync(generatedArchive)
  }
  const packed = readJsonFromArchive(archive)
  if (packed.name !== source.name || packed.version !== source.version) {
    throw new Error(
      `Packed manifest ${packed.name}@${packed.version} does not match ${source.name}@${source.version}`,
    )
  }
  for (const section of dependencySections) {
    if (stableDependencies(packed, section) !== stableDependencies(source, section)) {
      throw new Error(`Packed ${section} do not match source package.json`)
    }
    const workspaceDeps = Object.entries(packed[section] ?? {}).filter(([, range]) =>
      range.startsWith('workspace:'),
    )
    if (workspaceDeps.length > 0) {
      throw new Error(
        `Packed manifest contains workspace dependencies in ${section}: ${workspaceDeps
          .map(([name]) => name)
          .join(', ')}`,
      )
    }
  }
  assertPackedFiles(archive, source, packed)
  runIsolatedConsumer(archive)
  console.log(`Packed manifest and isolated consumer verified for ${packed.name}@${packed.version}`)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
