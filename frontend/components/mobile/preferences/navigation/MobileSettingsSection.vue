<template>
    <div class="mobile-settings-section">
        <div class="mobile-settings-section__title">
            <slot name="title" />
        </div>
        <div class="mobile-settings-section__buttons">
            <slot name="buttons" />
        </div>
    </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
.mobile-settings-section {
    user-select: none;
    margin-top: 28px;

    &__title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: -0.24px;
        color: $blueGrey400;
        margin-bottom: 12px;
    }

    &__buttons {
        border-radius: 12px;
        margin-bottom: 16px;
    }
}
</style>
