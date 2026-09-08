import { describe, expect, it } from 'vitest'
import { inspectOidcAuth } from '../scripts/check-oidc-auth.ts'

describe('OIDC publish authentication inspection', () => {
  it('rejects a real environment token without exposing it', () => {
    const secret = 'fixture-secret-do-not-print'
    const message = inspectOidcAuth({ NPM_TOKEN: secret }, [])

    expect(message).toContain('NPM_TOKEN')
    expect(message).not.toContain(secret)
  })

  it('rejects a literal npmrc token without exposing it', () => {
    const secret = 'fixture-npmrc-secret-do-not-print'
    const message = inspectOidcAuth({}, [`//registry.npmjs.org/:_authToken=${secret}`])

    expect(message).toContain('npmrc')
    expect(message).not.toContain(secret)
  })

  it('allows setup-node placeholder auth', () => {
    expect(inspectOidcAuth({}, ['//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}'])).toBeNull()
  })
})
