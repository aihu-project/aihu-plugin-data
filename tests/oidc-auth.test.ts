import { describe, expect, it } from 'vitest'
import { inspectOidcAuth } from '../scripts/check-oidc-auth.ts'

describe('OIDC publish authentication inspection', () => {
  it('rejects a real environment token without exposing it', () => {
    const secret = 'fixture-secret-do-not-print'
    const message = inspectOidcAuth({ NPM_TOKEN: secret }, [])

    expect(message).toContain('NPM_TOKEN')
    expect(message).not.toContain(secret)
  })

  it('rejects NODE_AUTH_TOKEN without exposing it', () => {
    const secret = 'fixture-node-auth-secret-do-not-print'
    const message = inspectOidcAuth({ NODE_AUTH_TOKEN: secret }, [])

    expect(message).toContain('NODE_AUTH_TOKEN')
    expect(message).not.toContain(secret)
  })

  it('rejects a literal npmrc token without exposing it', () => {
    const secret = 'fixture-npmrc-secret-do-not-print'
    const message = inspectOidcAuth({}, [`//registry.npmjs.org/:_authToken=${secret}`])

    expect(message).toContain('npmrc')
    expect(message).not.toContain(secret)
  })

  it('rejects setup-node placeholder auth because registry wiring is disabled', () => {
    const placeholder = '${' + 'NODE_AUTH_TOKEN}'
    const message = inspectOidcAuth({}, [`//registry.npmjs.org/:_authToken=${placeholder}`])

    expect(message).toContain('npmrc')
  })
})
