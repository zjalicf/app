import path from 'path';

export default {
    ssr: false,
    router: {
        mode: 'hash',
    },
    server: { port: 3002 },
    target: 'static',
    head: {
        title: 'quick-capture',
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' },
        ],
    },
    css: ['@/assets/css/reset.css', '@/assets/scss/global.scss'],
    components: true,
    buildModules: ['@nuxt/typescript-build', '@nuxtjs/style-resources'],
    modules: ['@nuxtjs/axios'],
    axios: {
        baseURL: '/',
    },
    publicRuntimeConfig: {
        os: process.env.ACR_OS || 'web', // web, desktop, mobile
        platform: process.env.ACR_PLATFORM || 'web', // windows, macos, linux, web, android, ios
    },
    build: {
        extend(config, { isClient }) {
            if (isClient) {
                config.module?.rules.push(
                    {
                        test: /\.js$/,
                        include: [
                            path.resolve(
                                __dirname,
                                'node_modules/chrono-node/dist/',
                            ),
                        ],
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: [
                                    '@babel/plugin-proposal-nullish-coalescing-operator',
                                ],
                            },
                        },
                    },
                    {
                        test: /index\.js$/,
                        include: [
                            path.resolve(
                                __dirname,
                                'node_modules/zeed-dom/dist/',
                            ),
                            path.resolve(
                                __dirname,
                                'node_modules/chrono-node/dist/',
                            ),
                        ],
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: [
                                    '@babel/plugin-proposal-nullish-coalescing-operator',
                                ],
                            },
                        },
                    },
                );
            }
            return config;
        },
    },
    styleResources: {
        scss: ['./assets/scss/colors.scss', './assets/scss/mixins.scss'],
    },
};
