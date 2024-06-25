<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :styles="{
            paddingTop: `30px`,
            paddingBottom: `30px`,
        }"
        :content-style="{
            maxWidth: '750px',
            width: '100%',
            maxHeight: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="page-preview-modal">
            <div class="page-preview-modal__fullscreen">
                <button @click="openFullscreen">
                    <InterfaceArrowsExpand3Alternate class="icon" />
                </button>
            </div>
            <div class="page-preview-modal__icon">
                <EntityIcon />
            </div>
            <div class="page-preview-modal__title">
                <EntityTitle />
            </div>
            <div class="page-preview-modal__controls">
                <EntityControls />
            </div>
            <div class="page-preview-modal__editor">
                <EditorWrapper
                    ref="editorWrapper"
                    placeholder="Type / for commands"
                />
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import EntityControls from '~/components/entities/EntityControls.vue';
import EditorWrapper from '~/components/entities/EditorWrapper.vue';
import EntityTitle from '~/components/entities/EntityTitle.vue';
import EntityIcon from '~/components/entities/EntityIcon.vue';
import { TabSymbols } from '~/constants/symbols';
import InterfaceArrowsExpand3Alternate from '~/components/streamline/InterfaceArrowsExpand3Alternate.vue';
import { TabType } from '~/constants';

@Component({
    name: 'PagePreviewModal',
    components: {
        InterfaceArrowsExpand3Alternate,
        EntityIcon,
        EntityTitle,
        EditorWrapper,
        EntityControls,
    },
})
export default class PagePreviewModal extends Vue {
    @Provide(TabSymbols.ENTITY_ID)
    @Prop({ required: true })
    entityId!: string;

    @Provide(TabSymbols.TAB_ID)
    @Prop({ required: true })
    tabId!: string;

    @Provide(TabSymbols.TAB_GROUP_ID)
    @Prop({ required: true })
    groupId!: string;

    @Provide(TabSymbols.GET_SCROLL_POSITION)
    getScrollPosition() {}

    @Provide(TabSymbols.SET_SCROLL_POSITION)
    setScrollPosition() {}

    get page() {
        return this.$entities.page.byId(this.entityId);
    }

    openFullscreen() {
        const tab = this.$tabs.createNewTabObject(
            this.entityId,
            TabType.DOCUMENT,
        );
        this.$tabs.openTab(tab);
    }
}
</script>

<style scoped lang="scss">
.page-preview-modal {
    @include modal;
    max-height: calc(100vh - 60px);

    display: flex;
    flex-direction: column;
    height: $desktopContentHeight;
    width: 100%;
    position: relative;
    overflow-x: hidden;

    padding: 32px 0 0;

    &__fullscreen {
        width: 100%;
        padding: 0 25px;
        display: flex;
        justify-content: flex-end;

        button {
            color: var(--jira-panel-header-icon-color);
            padding: 7px;
            flex-shrink: 0;
            border-radius: 4px;

            &:hover {
                color: var(--jira-panel-header-icon-color__hover);
            }
        }
    }

    &__icon {
        padding: 0 16px;
    }

    &__title {
        padding: 0 16px;
    }

    &__controls {
        padding: 0 46px;
    }

    &__editor {
        padding: 0 16px;
        @include scrollbar(0px, 12px);
        overflow-y: overlay;
        height: 100%;
    }
}
</style>
