<template>
    <div class="mobile-dropdown">
        <div class="mobile-dropdown__title">
            <slot name="title"></slot>
        </div>
        <slot name="default"></slot>
    </div>
</template>
<style lang="scss">
.mobile-dropdown {
    padding: 0 16px 30px;
    overflow-x: hidden;

    &__title {
        @include mobileDropdownTitle;
    }

    &__section {
        border-radius: 12px;
        margin-bottom: 16px;
    }

    &__control {
        @include paneButtons;
        outline: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: left;
        width: 100%;
        padding: 7px 16px;

        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        letter-spacing: -0.24px;

        .dropdown & {
            display: grid;
            grid-template-columns: 16px minmax(0, 1fr);
        }

        &:first-child {
            border-top-right-radius: 12px;
            border-top-left-radius: 12px;
        }

        &:last-child {
            border-bottom-right-radius: 12px;
            border-bottom-left-radius: 12px;
        }

        .title {
            @include ellipsis;
            color: $white;
            padding: 10px 0;
        }

        .value {
            background: $blueGrey500-16;
            width: min-content;
            padding: 10px 14px;
            border-radius: 12px;
        }

        .icon {
            color: $blueGrey300;
        }

        &.danger {
            p {
                padding: 10px 0;
            }
        }
    }
}
</style>
