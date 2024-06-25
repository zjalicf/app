<template>
    <div class="emoji-dropdown" :class="{ 'is-mobile': isMobile }">
        <VEmojiPicker
            class="emoji-dropdown--picker"
            :dark="true"
            :continuous-list="true"
            :emojis-by-row="emojisByRow"
            @select="selectEmoji"
        />
        <button
            v-if="!isMobile"
            class="emoji-dropdown--clear"
            @click="selectEmoji({ data: '' })"
        >
            Clear
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { VEmojiPicker } from 'v-emoji-picker';

@Component({
    name: 'EmojiDropdown',
    components: { VEmojiPicker },
})
export default class EmojiDropdown extends Vue {
    @Prop({ default: false })
    isMobile!: boolean;

    get emojisByRow() {
        return this.isMobile ? 12 : 8;
    }

    selectEmoji(detail: any) {
        this.$emit('close');
        this.$emit('change', detail);
    }
}
</script>

<style lang="scss" scoped>
.emoji-dropdown:not(.is-mobile) {
    @include frostedGlassBackground;
}

.emoji-dropdown {
    padding: 5px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    &--placeholder {
        width: 250px;
        height: 300px;
    }

    &--picker {
        .is-mobile & {
            width: 100%;
        }

        :deep(.emoji) {
            color: var(--context-menu-button-icon-color);
            &:hover {
                color: var(--context-menu-button-icon-color__hover);
                border-radius: 6px;
                @include frostedGlassButton;
            }
        }

        :deep(#Emojis) {
            border-bottom: 1px solid var(--context-menu-divider-color);
            border-radius: 0;
            padding-bottom: 5px;
        }

        :deep(.container-search) {
            margin: 10px 0 5px;
        }

        :deep(.category-title) {
            @include font-inter;
            @include font10-700;
            color: var(--dropdown-emoji-title-color);
        }

        :deep(.container-search input) {
            @include inputMetaStyles;
            background: var(--c-input-bg-color);
            color: var(--c-input-text-color);
            box-shadow: none;
            backdrop-filter: none;
            border: 1px solid var(--context-menu-divider-color);
        }

        :deep(#Categories) {
            border-bottom: 1px solid var(--context-menu-divider-color);
        }

        :deep(.category) {
            padding: 2px 2px 8px 2px;

            &:hover {
                filter: brightness(120%);
            }
        }

        :deep(.category svg) {
            fill: var(--page-header-controls);
        }

        :deep(.category.active svg) {
            filter: brightness(120%);
        }

        :deep(.category.active) {
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 6px;
        }

        :deep(.category:first-of-type) {
            display: none;
        }
    }

    &--clear {
        @include font12-500;
        margin-top: 5px;
        padding: 5px 0;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--dropdown-emoji-clear-color_hover);
        }
    }
}
</style>
