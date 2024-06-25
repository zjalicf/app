<template>
    <div class="mobile-settings-header">
        <div class="mobile-settings-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-settings-header__title">
            {{ name }}
        </div>
        <div class="mobile-settings-header__options"></div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';

@Component({
    name: 'MobileSettingsHeader',
    components: {
        ChevronLeftIcon,
    },
})
export default class MobileSettingsHeader extends Vue {
    @Prop({
        required: true,
    })
    name!: string;

    back() {
        this.$router.back();
    }
}
</script>
<style lang="scss" scoped>
.mobile-settings-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 10px 16px 10px;
    display: grid;
    align-items: center;
    grid-template-columns: 32px 1fr 32px;
    user-select: none;

    &__back {
        button {
            outline: none;
            display: block;
            padding: 4px;

            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        @include ellipsis;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);
        justify-content: center;

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        button {
            outline: none;
            display: block;
            padding: 4px;

            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }
}
</style>
