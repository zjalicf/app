<template>
    <div class="page-scroll-header">
        <button
            ref="emojiPicker"
            class="page-scroll-header--left"
            @click="openEmojiDropdown"
        >
            <DocumentIcon
                :document="document"
                class="page-scroll-header--icon"
                :class="{ disabled: isDisabled }"
                :size="28"
                :icon-size="28"
                :font-size="28"
            />
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import EmojiDropdown from '~/components/dropdown/EmojiDropdown.vue';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'PageHeaderControls',
    components: {
        DocumentIcon,
        InterfaceSettingMenuHorizontal,
        InterfaceAlertInformationCircle,
    },
})
export default class PageHeaderControls extends Vue {
    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    $refs!: {
        emojiPicker: any;
    };

    get document() {
        return (
            this.$store.getters['document/byId'](this.entityId) ??
            this.$store.getters['document/byClip'](this.entityId) ??
            {}
        );
    }

    get isDisabled() {
        return this.document.template;
    }

    openEmojiDropdown() {
        if (this.isDisabled) return;
        this.$dropdown.show({
            parent: this.$refs.emojiPicker,
            component: EmojiDropdown,
            animate: false,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                ],
            },
            bind: {},
            on: {
                change: (emoji: any) => {
                    this.$entities.page.updateIcon(
                        this.document.id,
                        emoji.data,
                    );
                },
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.page-scroll-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    user-select: none;

    &--left {
        margin-right: 12px;
        color: var(--page-header-controls);
    }

    &--icon {
        line-height: 26px;

        &:hover:not(.disabled) {
            filter: brightness(120%);
        }
    }
}
</style>
