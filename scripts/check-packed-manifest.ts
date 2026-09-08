import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tempDir = mkdtempSync(join(tmpdir(), 'aihu-plugin-data-pack-'))
try {
  const raw = execFileSync('npm', ['pack', '--json', '--pack-destination', tempDir], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  const [entry] = JSON.parse(raw) as Array<{ filename?: string }>
  if (!entry?.filename) throw new Error('npm pack did not return an artifact filename')

  const archive = join(tempDir, entry.filename)
  const manifest = JSON.parse(
    execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }),
  ) as {
    name?: string
    version?: string
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    files?: string[]
  }
  const source = JSON.parse(readFileSync('package.json', 'utf8')) as {
    name: string
    version: string
  }
  if (manifest.name !== source.name || manifest.version !== source.version) {
    throw new Error(
      `Packed manifest ${manifest.name}@${manifest.version} does not match ${source.name}@${source.version}`,
    )
  }
  const allDeps = { ...manifest.dependencies, ...manifest.devDependencies }
  const workspaceDeps = Object.entries(allDeps).filter(([, range]) =>
    range.startsWith('workspace:'),
  )
  if (workspaceDeps.length > 0) {
    throw new Error(
      `Packed manifest contains workspace dependencies: ${workspaceDeps.map(([name]) => name).join(', ')}`,
    )
  }
  if (!manifest.files?.includes('dist')) throw new Error('Packed manifest must include dist')
  console.log(`Packed manifest verified for ${manifest.name}@${manifest.version}`)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
