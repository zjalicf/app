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
            maxWidth: '432px',
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
        @opened="focusInput"
    >
        <div class="entity-clip-modal">
            <component
                :is="modalContentComponent"
                ref="modalContent"
                @accept="modalAccept(close, $event)"
                @cancel="modalCancel(close)"
            />
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import CButton from '~/components/CButton.vue';
import { IntegrationType } from '~/constants';
import ASelect from '~/components/ASelect.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import CInput from '~/components/CInput.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import GithubClipModalContent from '~/components/integrations/clip/modal/content/GithubClipModalContent.vue';
import JiraClipModalContent from '~/components/integrations/clip/modal/content/JiraClipModalContent.vue';
import UrlClipModalContent from '~/components/integrations/clip/modal/content/UrlClipModalContent.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import LinearClipModalContent from '~/components/integrations/clip/modal/content/LinearClipModalContent.vue';

@Component({
    name: 'EntityClipModal',
    components: { LoadingIcon, CInput, ASelect, CButton },
})
export default class EntityClipModal extends Vue {
    @Prop({ required: true })
    page!: IDocument;

    @Prop({ required: true })
    type!: any;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    $refs!: {
        modalContent: any;
    };

    get modalContentComponent() {
        if (this.type === IntegrationType.GITHUB) {
            return GithubClipModalContent;
        }
        if (this.type === IntegrationType.JIRA) {
            return JiraClipModalContent;
        }
        if (this.type === IntegrationType.LINEAR) {
            return LinearClipModalContent;
        }
        if (this.type === 'url') {
            return UrlClipModalContent;
        }
    }

    showConflictModal(existing: IDocument, newValue: string) {
        const issue = this.$store.getters['integrationData/byId'](newValue);
        const issueName =
            issue.type === JiraIntegrationDataType.ISSUE
                ? `${issue.key} ${issue.text}`
                : `#${issue.number} ${issue.title}`;
        this.$vfm.show({
            component: () =>
                import(
                    '~/components/integrations/clip/modal/ClipConflictModal.vue'
                ),
            bind: {
                type: 'page',
                oldIssue: issueName,
                oldPage: existing.title,
                newPage: this.page.title,
            },
            on: {
                old: (close: any) => {
                    close();
                },
                new: (close: any) => {
                    this.$entities.page.replaceClip(
                        existing.id,
                        this.page.id,
                        newValue,
                    );
                    let sourceMeta = TrackingActionSourceMeta.URL;
                    if (newValue.startsWith('jira'))
                        sourceMeta = TrackingActionSourceMeta.JIRA;
                    if (newValue.startsWith('github'))
                        sourceMeta = TrackingActionSourceMeta.GITHUB;
                    if (newValue.startsWith('linear'))
                        sourceMeta = TrackingActionSourceMeta.LINEAR;

                    this.$tracking.trackEventV2(TrackingType.PAGE, {
                        action: TrackingAction.REPLACE_CLIP,
                        source: this.source,
                        sourceMeta,
                        entityId: this.page.id,
                    });
                    close();
                },
            },
        });
    }

    async handleClipChange(newValue: string) {
        const existingDoc = this.$store.getters['document/byClip'](newValue);
        if (this.type !== 'url' && existingDoc) {
            this.showConflictModal(existingDoc, newValue);
            return;
        }
        await this.$entities.page.clipPage(this.page.id, newValue);
        let sourceMeta = TrackingActionSourceMeta.URL;
        if (newValue.startsWith('jira'))
            sourceMeta = TrackingActionSourceMeta.JIRA;
        if (newValue.startsWith('github'))
            sourceMeta = TrackingActionSourceMeta.GITHUB;
        if (newValue.startsWith('linear'))
            sourceMeta = TrackingActionSourceMeta.LINEAR;

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.ADD_CLIP,
            source: this.source,
            sourceMeta,
            entityId: this.page.id,
        });

        this.$emit('close');
    }

    focusInput() {
        if (this.type === 'url') {
            this.$refs.modalContent.focusInput();
        }
    }

    async modalAccept(close: any, selected: string) {
        await close();
        if (!selected) return;
        await this.handleClipChange(selected);
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.entity-clip-modal {
    @include modal;
    user-select: none;
    overflow-y: auto;
    height: 100%;

    :deep {
        .entity-clip-modal-content {
            &__header {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                margin-bottom: 4px;
                padding: 16px 16px 0px;

                &__title {
                    @include font14-600;
                    color: var(--modal-title-text-color);
                }
            }
        }
    }
}
</style>
