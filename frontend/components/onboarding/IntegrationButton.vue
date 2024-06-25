<template>
    <div class="integration-button">
        <slot />
    </div>
</template>
<style lang="scss" scoped>
.integration-button {
    margin-bottom: 8px;
    min-width: 390px;
    width: 100%;

    &__button {
        outline: none;
        border-radius: 6px;
        padding: 14px 22px 10px;
        //display: flex;
        align-items: center;
        display: grid;
        grid-template-columns: 14px 1fr 14px;
        gap: 20px;
        width: 100%;
        background: var(--calendar-picker-bg-color);

        &:disabled:not(.connected) {
            opacity: 0.5;
        }

        &:not(:disabled):hover {
            background: var(--calendar-picker-bg-color__hover);
        }

        &:not(:last-of-type) {
            margin-bottom: 10px;
        }

        &__icon {
            color: var(--calendar-picker-icon-color);
            margin-right: 20px;
        }

        &__text {
            color: var(--calendar-picker-sub-text-color);
            text-align: left;

            &__title {
                color: var(--calendar-picker-text-color);
                font-weight: 500;
                font-size: 15px;
                line-height: 24px;
            }

            &__subtitle {
                font-weight: 500;
                font-size: 13px;
                line-height: 20px;
            }
        }

        &__connected {
            color: #70af80;
        }
    }
}
</style>
