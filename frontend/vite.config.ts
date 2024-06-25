import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~/': `${process.cwd()}/`,
            '@/': `${process.cwd()}/`,
        },
    },
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
        },
    },
});
