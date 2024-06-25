<template>
    <div class="mobile-emoji-dropdown">
        <EmojiDropdown :is-mobile="true" @change="$emit('change', $event)" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import EmojiDropdown from '~/components/dropdown/EmojiDropdown.vue';

@Component({
    name: 'MobileEmojiDropdown',
    components: { EmojiDropdown },
})
export default class MobileEmojiDropdown extends Vue {}
</script>

<style lang="scss" scoped>
.mobile-emoji-dropdown {
    padding-top: 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    &--placeholder {
        width: 250px;
        height: 300px;
    }

    &--picker {
        &.is-mobile {
            width: 100%;
        }

        :deep(.category-title) {
            @include font-inter;
            @include font10-700;
            color: $blueGrey400;
        }
    }

    &--clear {
        @include font12-500;
        margin-top: 10px;
        padding: 5px 0;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: $white;
        }
    }
}
</style>
