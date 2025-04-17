import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.ts',
            name: 'noonjs-client',
            fileName: (format) => `noonjs-client.${format}.js`,
        },
        rollupOptions: {
            external: ['axios', 'socket.io-client'],
            output: {
                globals: {
                    axios: 'axios',
                    'socket.io-client': 'io',
                },
            },
        },
    },
});