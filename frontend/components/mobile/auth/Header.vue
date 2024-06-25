<template>
    <div class="mobile-auth__header">
        <button @click="$emit('back')">
            <AcreomChevronLeft size="16" class="icon" /> Back
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AcreomChevronLeft from '~/components/icons/AcreomChevronLeft.vue';

@Component({
    name: 'MobileAuthHeader',
    components: { AcreomChevronLeft },
})
export default class MobileAuthHeader extends Vue {}
</script>
<style lang="scss" scoped>
.mobile-auth__header {
    padding-top: calc(30px + var(--ion-safe-area-top));
    padding-left: 8px;
    margin-bottom: 22px;

    button {
        outline: none;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        color: var(--mobile-header-button-text-color);
        display: flex;
        align-items: center;

        .icon {
            color: var(--mobile-header-button-icon-color);
            margin-right: 6px;
        }
    }
}
</style>
