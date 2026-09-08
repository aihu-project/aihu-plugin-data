import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@aihu-plugin/data': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
})
