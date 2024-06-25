<template>
    <div id="homepage">
        <Nuxt />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
    head() {
        return {
            htmlAttrs: {
                class: [this.$config.platform, 'theme-dark'],
            },
            bodyAttrs: {
                class: 'homepage',
            },
        };
    },
})
export default class HomepageLayout extends Vue {}
</script>

<style scoped lang="scss">
#homepage {
    background: var(--app-homepage-layoyt-bg-color);
}
</style>
