<template>
    <div v-html="expression"></div>
</template>

<script>
import 'katex/dist/katex.css';

export default {
    name: 'BlockKaTeX',
    data() {
        return {
            expression: '<p></p>',
        };
    },
    async mounted() {
        const { expression } = this.$attrs;
        const katex = await import('katex');

        this.expression = katex.renderToString(String.raw`${expression}`, {
            output: 'html',
            throwOnError: false,
            displayMode: true,
        });
    },
};
</script>
