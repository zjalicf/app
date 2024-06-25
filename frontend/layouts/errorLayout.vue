<template>
    <div id="error">
        <Nuxt />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
    head() {
        return {
            htmlAttrs: {
                class: [
                    'error',
                    this.$config.platform,
                    `theme-${this.$store.getters[
                        'appSettings/theme'
                    ].toLowerCase()}`,
                ],
            },
            bodyAttrs: {
                class: 'error',
            },
        };
    },
})
export default class HomepageLayout extends Vue {}
</script>
