# Release contract

This document is the source of truth for publishing `@aihu-plugin/data`.

- The package version and a release tag must match exactly (`2.0.6` and `v2.0.6`).
- Every dependency section in the published manifest must match `package.json`, and no published dependency range may use `workspace:`.
- Every `main`, `module`, `types`, and export-map target must exist in the packed tarball, along with each entry declared by `files`.
- CI must pass the typecheck, test, build, packed-manifest, and isolated-consumer checks before release.
- Publishing uses npm trusted publishing through GitHub OIDC with provenance. A configured npm token, a literal npmrc auth value, registry authentication error, or already-published version fails closed; setup-node's literal `${NODE_AUTH_TOKEN}` placeholder is the only npmrc auth value allowed.

The release workflow and `scripts/check-packed-manifest.ts` enforce these checks. The package is not removed from the framework monorepo until its replacement version is published and consumers can resolve the registry package.
