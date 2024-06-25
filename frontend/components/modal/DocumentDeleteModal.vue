<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '367px',
            width: '100%',
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
        <div
            v-shortkey="['shift', 'enter']"
            class="recurring-modal"
            @shortkey="modalAccept(close)"
        >
            <div class="recurring-modal__header">
                <div class="recurring-modal__header__title">
                    Delete {{ document.template ? 'Template' : 'Page' }}
                </div>
            </div>
            <div class="recurring-modal__body">
                <div
                    v-if="backlinks.length > 0"
                    class="recurring-modal__body__title"
                >
                    This page is linked in:
                </div>
                <DocumentLink
                    v-for="doc in backlinks"
                    :key="doc.id"
                    :document="doc"
                    :source="TrackingActionSource.BACKLINK_PAGE_DELETE_MODAL"
                    @click.native="close"
                />

                <div class="recurring-modal__body__title">
                    Are you sure you want to delete
                    <span>{{
                        document.title
                            ? document.title
                            : document.template
                            ? 'Untitled template'
                            : 'Untitled document'
                    }}</span
                    >?
                </div>
                <div v-if="isLocal" class="recurring-modal__body__title">
                    Document will be moved to system trash.
                </div>
            </div>
            <div class="recurring-modal__footer">
                <div class="recurring-modal__footer__info"></div>
                <div class="recurring-modal__footer__actions">
                    <div>
                        <tippy
                            :content="`<div class='tooltip'>Delete <span class='tooltip-divider'>•</span><span class='tooltip-button'>Shift</span>+<span class='tooltip-button'>Enter</span></span></div>`"
                            placement="bottom-start"
                            :delay="[400, 20]"
                            theme="tooltip"
                            :touch="false"
                        >
                            <CButton
                                type="primary"
                                tabindex="0"
                                @click="modalAccept(close)"
                                >Delete
                            </CButton>
                        </tippy>
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DocumentIcon, TrashIcon } from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';
import { IDocument } from '~/components/document/model';
import { TabType } from '~/constants';
import DocumentLink from '~/components/document/DocumentLink.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'DeleteDocumentModal',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        DocumentLink,
        CButton,
        TrashIcon,
        DocumentIcon,
    },
})
export default class DeleteDocumentModal extends Vue {
    @Prop()
    document!: IDocument;

    @Prop()
    backlinks!: IDocument[];

    get isLocal() {
        return this.$store.getters['vault/isActiveLocal'];
    }

    getDocumentTitle(docId: string) {
        return this.$store.getters['document/byId'](docId).title || 'Untitled';
    }

    async navigateToDocument(close: any, docId: string) {
        await close();
        const tab = this.$tabs.createNewTabObject(docId, TabType.DOCUMENT);
        this.$tabs.openTab(tab);
    }

    async modalAccept(close: any) {
        await close();
        this.$tabs.closeTabsByEntityId(this.document.id);
        this.$entities.page.deletePage(this.document.id);
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.recurring-modal {
    @include modal;
    user-select: none;

    &__header {
        padding: 16px 16px 0px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
        }
    }

    &__body {
        padding: 0px 16px 8px;

        &__title {
            @include font12-500;
            margin-bottom: 4px;
            margin-top: 4px;
        }
    }

    &__footer {
        padding: 0px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
