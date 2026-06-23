import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Dev port 5400 / preview 5401: a free port outside the 51xx/52xx range
// (and clear of 5432/5433 Postgres) already in use by other local apps here.
export default defineConfig({
	plugins: [sveltekit()],
	server: { port: 5400 },
	preview: { port: 5401 }
});
