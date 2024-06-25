<template>
    <div
        class="mobile-documents-header"
        :class="{ 'editor-focused': keyboardOpen }"
    >
        <div class="mobile-documents-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div v-if="!keyboardOpen" class="mobile-documents-header__options">
            <button
                class="mobile-documents-header__options__more"
                @click="openDropdown"
            >
                <DotsHorizontalIcon class="icon" size="24" />
            </button>
        </div>
        <button
            v-else
            class="mobile-documents-header__options__done"
            @click.stop
        >
            Done
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import { DotsHorizontalIcon } from '@vue-hero-icons/solid';
import PageDropdown from '~/components/mobile/common/dropdown/PageDropdown.vue';

@Component({
    name: 'MobileHeader',
    components: {
        ChevronLeftIcon,
        DotsHorizontalIcon,
    },
})
export default class MobileHeader extends Vue {
    @Prop({
        required: true,
    })
    document!: any;

    get keyboardOpen() {
        return this.$utils.mobile.keyboardOpen;
    }

    async back() {
        await this.$utils.mobile.closeKeyboard();
        this.$router.back();
    }

    async openDropdown() {
        await this.$utils.mobile.closeKeyboard();
        await this.$pane.show({
            component: PageDropdown,
            bind: {
                document: this.document,
            },
            type: 'dropdown',
        });
    }
}
</script>
<style lang="scss" scoped>
.mobile-documents-header {
    padding: 10px 16px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.editor-focused {
        padding: 8px 16px 8px;
    }

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
        @include font14-600;
        color: var(--mobile-app-title-color);
        overflow: hidden;

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        &__more {
            @include animateBackgroundColor;
            outline: none;
            display: block;
            padding: 4px;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }

        &__done {
            @include font12-500;
            color: var(--mobile-app-keyborad-button-text-color);
            border-radius: 12px;
            background: var(--mobile-app-keyborad-button-bg-color);
            padding: 9px 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            outline: none;
        }
    }
}
</style>
