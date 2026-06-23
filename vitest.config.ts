import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Lightweight vitest setup for the pure-TS engine + content + i18n.
// We alias $lib manually so we do not need to boot the full SvelteKit plugin.
export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
