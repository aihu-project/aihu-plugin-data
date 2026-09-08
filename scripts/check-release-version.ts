import { readFileSync } from 'node:fs'

const tag = process.argv[2]
if (!tag) {
  console.error('Usage: bun scripts/check-release-version.ts v<package-version>')
  process.exit(1)
}

const { name, version } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  name: string
  version: string
}
const expected = `v${version}`
if (tag !== expected) {
  console.error(`Release tag ${tag} does not match ${name}@${version}; expected ${expected}`)
  process.exit(1)
}

console.log(`Release tag ${tag} matches ${name}@${version}`)
