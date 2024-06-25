<template>
    <div class="template-banner">
        <p class="template-banner--text">
            You are editing a template. Not all Page functionality is available.
        </p>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'TemplateBanner',
    components: {},
})
export default class TemplateBanner extends Vue {}
</script>

<style lang="scss" scoped>
.template-banner {
    @include banner;
    max-width: 510px;
    margin: 20px auto 20px auto;
    display: flex;
    flex-direction: column;
    padding: 10px 50px;
    user-select: none;

    &--text {
        text-align: center;
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 155.2%;
        color: var(--banner-text-color);
    }
}
</style>
