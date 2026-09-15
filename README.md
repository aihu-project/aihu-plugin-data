# @aihu-plugin/data

> **Aihu** — agentic discovery and interaction, for human purpose.

Reactive data loaders and resource primitives for aihu.

Part of the **meta-framework** layer of Aihu. Provides reactive data loading,
resource caching, and SSR dehydration helpers for Aihu applications. See the
[data-fetching guide](https://aihu.dev/guides/data-fetching) for the framework
contract.

<!-- BEGIN_HANDWRITTEN: prose -->
A signal-native, backend-agnostic data-fetching primitive.

## API

**Primary API**

- `createResource(key, fetcher, options?)` — creates a reactive `Resource<T>`.
  `key` is a `Signal<string | null | undefined>` whose current value is the
  cache key (a `null`/`undefined` key keeps the resource idle); `fetcher` is
  any `(key: string) => Promise<T>`. The returned `Resource<T>` has a
  `state: Signal<DataState<T>>` (a discriminated union over `idle`, `loading`,
  `ready`, `error`, and a reserved `streaming` case for future adapters),
  plus `refetch()` and `invalidate()` controls.

**Cache**

- `createResourceStore()` — creates a `ResourceStoreWithMeta` cache instance.
- `ResourceStoreToken` — `@aihu/context` injection token for supplying a
  store to `createResource` without threading it through every call.

**SSR dehydration**

- `createResourceSerializer(store)` — returns a `() => Record<string, unknown>`
  that serializes resources created with `{ dehydrate: true }` for SSR.

**Plugin registration**

- `data()` — plugin factory; registers `@aihu-plugin/data` via
  `defineAihuConfig({ plugins: [data()] })` (Plugin Contract Spec §3, §7.1).

```ts
// aihu.config.ts
import { data } from '@aihu-plugin/data'
import { defineAihuConfig } from '@aihu/server'

export default defineAihuConfig({
  plugins: [data()],
})
```

Runtime dependencies are `@aihu/signals` and `@aihu/context` only; `@aihu/plugin`
is build/dev-time only and is not bundled into the runtime output.
<!-- END_HANDWRITTEN: prose -->

## Install

<!-- BEGIN_AUTOGEN: install -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

```bash
npm install @aihu-plugin/data
# or
bun add @aihu-plugin/data
```

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: install -->

## Package facts

<!-- BEGIN_AUTOGEN: stats -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| | |
|---|---|
| **Version** | `2.0.6` |
| **Tier** | B — Meta-framework — reactive resources + loader protocol |
| **Bundle size** | 769 B (gz) — limit 800 B |
| **Published files** | 3 entries |
| **License** | MIT |

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: stats -->

## Exports

<!-- BEGIN_AUTOGEN: exports -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| Subpath | ESM | CJS |
|---|---|---|
| `.` | `./dist/index.js` | `—` |

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: exports -->

## Dependencies

<!-- BEGIN_AUTOGEN: deps -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

**Dependencies:**

- `@aihu/signals` — `^0.5.1`
- `@aihu/context` — `^0.2.0`

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: deps -->

## See also

<!-- BEGIN_AUTOGEN: see-also -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

- [Data-fetching guide](https://aihu.dev/guides/data-fetching)
- [@aihu/context](https://www.npmjs.com/package/@aihu/context)
- [Aihu framework](https://aihu.dev)

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: see-also -->

## License

<!-- BEGIN_AUTOGEN: license -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

MIT — see [LICENSE](./LICENSE).

<sub><i>Auto-generated against `@aihu-plugin/data@2.0.6`.</i></sub>

<!-- END_AUTOGEN: license -->
