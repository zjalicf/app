import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import path from 'path';

export default defineConfig({
    main: {
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, './'),
                }
            ]
        },
        plugins: [
            externalizeDepsPlugin({
                exclude: [
                    'execa',
                    'wdio-electron-service/main',
                    'wdio-electron-service',
                    'trash',
                ],
            }),
        ],
        build: {
            outDir: './out',
            rollupOptions: {
                input: './main.ts',
                output: {
                    manualChunks(id): string | void {
                        if (id.includes('execa')) {
                            return 'execa';
                        }

                        if (id.includes('wdio-electron-service/main')) {
                            return 'wdio-electron-service/main';
                        }

                        if (id.includes('wdio-electron-service')) {
                            return 'wdio-electron-service';
                        }
                    },
                },
            },
        },
    },
    preload: {
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, './'),
                }
            ]
        },
        plugins: [
            externalizeDepsPlugin({
                exclude: [
                    'execa',
                    'wdio-electron-service/main',
                    'wdio-electron-service',
                    'trash',
                ],
            }),
        ],
        build: {
            outDir: './preload',
            rollupOptions: {
                input: {
                    preload: './preload.ts',
                    'quick-capture-preload': './quick-capture-preload.ts',
                },
                output: {
                    manualChunks(id): string | void {
                        if (id.includes('execa')) {
                            return 'execa';
                        }

                        if (id.includes('wdio-electron-service/main')) {
                            return 'wdio-electron-service/main';
                        }

                        if (id.includes('wdio-electron-service')) {
                            return 'wdio-electron-service';
                        }
                    },
                },
            },
        },
    },
});
