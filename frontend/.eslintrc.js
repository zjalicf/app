module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: [
        '@nuxtjs',
        '@nuxtjs/eslint-config-typescript',
        'prettier',
        'plugin:prettier/recommended',
        'plugin:nuxt/recommended',
    ],
    plugins: ['prettier'],
    // add your custom rules here
    settings: {
        'import/ignore': ['node_modules'],
    },
    rules: {
        camelcase: 'off',
    },
};
