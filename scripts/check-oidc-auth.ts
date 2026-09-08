import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export function inspectOidcAuth(
  environment: Record<string, string | undefined>,
  npmrcContents: readonly string[],
): string | null {
  if (environment.NPM_TOKEN) return 'NPM_TOKEN must be unset for OIDC publishing'
  if (environment.NODE_AUTH_TOKEN) return 'NODE_AUTH_TOKEN must be unset for OIDC publishing'

  for (const contents of npmrcContents) {
    for (const rawLine of contents.split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || line.startsWith(';')) continue

      for (const key of ['_authToken', '_auth']) {
        if (line.includes(key)) {
          return `npmrc contains an ${key} value; refusing token-authenticated publish`
        }
      }
    }
  }

  return null
}

function npmConfigPath(name: string): string | undefined {
  try {
    const path = execFileSync('npm', ['config', 'get', name], { encoding: 'utf8' }).trim()
    return path && path !== 'undefined' ? path : undefined
  } catch {
    return undefined
  }
}

function knownNpmrcContents(): string[] {
  const paths = new Set<string>(['.npmrc'])
  for (const path of [
    process.env.NPM_CONFIG_USERCONFIG,
    npmConfigPath('userconfig'),
    process.env.HOME ? join(process.env.HOME, '.npmrc') : undefined,
    npmConfigPath('globalconfig'),
  ]) {
    if (path) paths.add(path)
  }
  return [...paths].filter((path) => existsSync(path)).map((path) => readFileSync(path, 'utf8'))
}

if (process.argv[1]?.endsWith('/check-oidc-auth.ts')) {
  const failure = inspectOidcAuth(process.env, knownNpmrcContents())
  if (failure) {
    console.error(failure)
    process.exit(1)
  }
  console.log('OIDC publish authentication inspection passed')
}
