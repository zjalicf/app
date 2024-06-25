<template>
    <div
        v-if="entity.id"
        class="jira-issue-properties"
        :class="[viewContext ?? 'panel']"
    >
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div
            class="jira-issue-properties--header"
            :class="{
                detached,
            }"
        >
            <div
                class="jira-issue-properties--header--title"
                :class="{ detached }"
            >
                <span><IssueType :entity="entity" />{{ entity.key }}</span>
            </div>
            <div class="jira-issue-properties--header__quick-actions">
                <button
                    class="quick-action-item has-tippy"
                    :data-tippy-content="`<div tabindex='-1' class='tooltip'>Open in Browser</div>`"
                    @click="openJiraIssue"
                >
                    <InterfaceLinkSquare />
                </button>
                <button
                    v-if="document && viewContext === 'modal'"
                    class="quick-action-item has-tippy"
                    :data-tippy-content="`<div tabindex='-1' class='tooltip'>Unlink Issue from Page</div>`"
                    @click="unclipJira"
                >
                    <InterfaceUnlink />
                </button>
                <button
                    v-if="viewContext === 'panel'"
                    class="quick-action-item has-tippy"
                    :data-tippy-content="`<div tabindex='-1' class='tooltip'>Expand</div>`"
                    @click="expand"
                >
                    <InterfaceArrowsExpand3Alternate />
                </button>
                <IssueClipTrigger
                    v-if="detached"
                    :entity="entity"
                    :highlighted="true"
                    :source="TrackingActionSource.JIRA_MODAL"
                    class="quick-action-item has-tippy"
                    @click="$emit('close')"
                />
            </div>
        </div>
        <div class="jira-issue-properties--properties" :class="{ detached }">
            <div
                class="jira-issue-properties--issue-text"
                :class="{ detached }"
            >
                {{ entity.text }}
            </div>
            <div class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">status</div>
                <div class="jira-issue-properties--property__value">
                    <JiraStatusPicker
                        :entity="entity"
                        @change="
                            changeStatus(
                                $event,
                                TrackingActionSource.JIRA_MODAL,
                            )
                        "
                    />
                </div>
            </div>
            <div class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">
                    priority
                </div>
                <div class="jira-issue-properties--property__value">
                    <JiraPriorityPicker
                        :entity="entity"
                        @change="
                            changePriority(
                                $event,
                                TrackingActionSource.JIRA_MODAL,
                            )
                        "
                    />
                </div>
            </div>
            <div class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">
                    assignee
                </div>
                <div class="jira-issue-properties--property__value">
                    <JiraAssigneePicker
                        :entity="entity"
                        @change="
                            changeAssignee(
                                $event,
                                TrackingActionSource.JIRA_MODAL,
                            )
                        "
                    />
                </div>
            </div>
            <div class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">Labels</div>
                <div class="jira-issue-properties--property__value">
                    <JiraLabelPicker
                        :entity="entity"
                        @change="handleLabelsChange"
                        @close="showLabelsNotification"
                    />
                </div>
            </div>
            <div
                v-if="timetracking && timetracking.remainingEstimate"
                class="jira-issue-properties--property"
            >
                <div class="jira-issue-properties--property__label">
                    Time tracking
                </div>
                <div class="jira-issue-properties--property__value">
                    {{ timetracking.timeSpent }} logged,
                    {{ timetracking.remainingEstimate }} remaining
                </div>
            </div>
            <div v-if="sprints.length" class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">Sprint</div>
                <div class="jira-issue-properties--property__value">
                    {{ sprints.map(s => s.name).join(', ') }}
                </div>
            </div>
            <div class="jira-issue-properties--property">
                <div class="jira-issue-properties--property__label">
                    Reporter
                </div>
                <div class="jira-issue-properties--property__value">
                    <JiraReporter :entity="entity" />
                </div>
            </div>
        </div>
        <div
            v-if="entity.properties.description"
            class="jira-issue-properties--description"
            :class="{ detached }"
        >
            <div class="jira-issue-properties--description--title">
                description
            </div>
            <div
                ref="issueDescription"
                class="jira-issue-properties--description--content"
                v-html="issueDescription"
            ></div>
        </div>
        <div
            v-if="entity.properties.attachment.length"
            class="jira-issue-properties--attachment"
            :class="{ detached }"
        >
            <div class="jira-issue-properties--attachment--title">
                attachments
            </div>
            <div
                ref="issueAttachments"
                class="jira-issue-properties--attachment--content"
            >
                <div
                    v-for="attachment in entity.properties.attachment"
                    :key="attachment.id"
                    class="jira-issue-properties--attachment--content--wrapper"
                    @click="handleAttachmentPreviewClick(attachment)"
                >
                    <img
                        class="
                            jira-issue-properties--attachment--content--wrapper--image
                        "
                        :src="getJiraAttachmentUrl(attachment.id)"
                    />
                    <div
                        class="
                            jira-issue-properties--attachment--content--wrapper--text
                        "
                    >
                        {{ attachment.filename }}
                    </div>
                </div>
            </div>
        </div>
        <div v-if="parentIssue" class="divider"></div>
        <div
            v-if="parentIssue"
            class="jira-issue-properties--linked"
            :class="{ detached }"
        >
            <div class="jira-issue-properties--linked--title">Parent issue</div>
            <div class="jira-issue-properties--linked--content">
                <JiraIssue
                    v-if="parentIssue"
                    :key="parentIssue.key"
                    :minimal="true"
                    :issue="parentIssue"
                    :is-in-panel="true"
                />
            </div>
        </div>
        <div v-if="subIssues.length" class="divider"></div>
        <div
            v-if="subIssues.length"
            class="jira-issue-properties--linked"
            :class="{ detached }"
        >
            <div class="jira-issue-properties--linked--title">Child issues</div>
            <div class="jira-issue-properties--linked--content">
                <JiraIssue
                    v-for="issue in subIssues"
                    :key="issue.key"
                    :minimal="true"
                    :issue="issue"
                    :is-in-panel="true"
                />
            </div>
        </div>
        <div
            v-if="links"
            class="jira-issue-properties--linked"
            :class="{ detached }"
        >
            <div class="jira-issue-properties--linked--title">
                Linked issues
            </div>
            <div
                v-for="[key, issues] in Object.entries(links)"
                :key="key"
                class="jira-issue-properties--linked--content"
            >
                <div class="jira-issue-properties--linked--sub-title">
                    {{ key }}
                </div>
                <JiraIssue
                    v-for="issue in issues"
                    :key="issue.id"
                    :minimal="true"
                    :issue="issue"
                    :is-in-panel="true"
                />
            </div>
        </div>
        <div class="divider"></div>
        <div class="jira-issue-properties--activity" :class="{ detached }">
            <div class="jira-issue-properties--activity--label">activity</div>
            <JiraActivityFeed :entity="entity" :entity-comments="comments" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    Component,
    Inject,
    Prop,
    Provide,
    Watch,
} from 'vue-property-decorator';
import differenceWith from 'lodash/differenceWith';
import { DynamicModalOptions } from 'vue-final-modal';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceBookmarkTag from '~/components/streamline/InterfaceBookmarkTag.vue';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import JiraLabelPicker from '~/components/integrations/jira/JiraLabelPicker.vue';
import JiraStatusPicker from '~/components/integrations/jira/JiraStatusPicker.vue';
import InterfaceUnlink from '~/components/streamline/InterfaceUnlink.vue';
import JiraPriorityPicker from '~/components/integrations/jira/JiraPriorityPicker.vue';
import JiraAssigneePicker from '~/components/integrations/jira/JiraAssigneePicker.vue';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import { JiraActions } from '~/constants';
import { TabSymbols } from '~/constants/symbols';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import JiraIssue from '~/components/integrations/jira/issue/JiraIssue.vue';
import IssueClipTrigger from '~/components/integrations/jira/issue/IssueClipTrigger.vue';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import { localizedRelativeFormat } from '~/helpers/date';
import JiraActivityFeed from '~/components/integrations/jira/activity-feed/JiraActivityFeed.vue';
import JiraReporter from '~/components/integrations/jira/JiraReporter.vue';
import { IDocument } from '~/components/document/model';
import InterfaceArrowsExpand3Alternate from '~/components/streamline/InterfaceArrowsExpand3Alternate.vue';
import { GithubSymbols } from '~/components/github/github';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'JiraPanel',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: {
        InterfaceArrowsExpand3Alternate,
        JiraReporter,
        JiraActivityFeed,
        IssueType,
        IssueClipTrigger,
        JiraIssue,
        JiraIcon,
        DocumentIcon,
        JiraAssigneePicker,
        JiraPriorityPicker,
        InterfaceUnlink,
        JiraStatusPicker,
        JiraLabelPicker,
        InterfaceLinkSquare,
        InterfaceBookmarkTag,
        InterfaceCalendar,
        InterfaceContentFileAlternate,
        InterfaceDelete1,
    },
})
export default class JiraPanel extends JiraEntityMixin {
    @Inject({ from: TabSymbols.ENTITY_ID, default: null })
    entityId!: string;

    @Prop({ default: null })
    @Provide(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ default: null })
    entityIdProp!: string;

    @Prop({ default: false })
    detached!: boolean;

    @Inject({ from: GithubSymbols.VIEW_CONTEXT, default: 'panel' })
    viewContext!: string;

    labelsUpdated: boolean = false;

    @Prop({ default: null })
    entityData!: any;

    clip: string | null = null;

    $refs!: {
        issueDescription: HTMLDivElement;
    };

    get document() {
        return this.$store.getters['document/byClip'](this.entityIdProp);
    }

    @Watch('document')
    onDocumentChanged(newValue: IDocument) {
        if (!newValue) {
            return this.$emit('close');
        }
        if (newValue.clip !== this.clip) {
            this.clip = newValue.clip!;
        }
    }

    format(date: string) {
        return localizedRelativeFormat(
            new Date(date),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        );
    }

    openJiraIssue() {
        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.OPEN_JIRA_ISSUE_IN_BROWSER,
            source: TrackingActionSource.JIRA_MODAL,
        });
        this.$utils.navigation.openExternalLink(this.entity.url);
    }

    unclipJira() {
        if (!this.detached) {
            this.$emit('close');
        }
        this.$nextTick(() => {
            this.$entities.page.removeClip(this.document.id);
        });
    }

    expand() {
        this.$entities.jira.openModal(
            this.entity,
            TrackingActionSource.JIRA_MODAL,
        );
    }

    handleAttachmentPreviewClick(attachment: any) {
        const isImage = attachment.mimeType.startsWith('image/');
        const src = this.getJiraAttachmentUrl(attachment.id, false);
        if (isImage) {
            this.$vfm.show({
                component: () => import('@/components/modal/ImageModal.vue'),
                bind: {
                    src,
                },
            } as DynamicModalOptions);
            return;
        }
        this.$utils.navigation.openExternalLink(src);
    }

    handleLabelsChange(props: any) {
        const labelsChanged =
            differenceWith(props.labels, this.entity.properties.labels).length >
                0 ||
            differenceWith(this.entity.properties.labels, props.labels).length >
                0;
        if (!labelsChanged) return;
        this.changeLabels(props, TrackingActionSource.JIRA_MODAL);
        this.labelsUpdated = true;
    }

    showLabelsNotification() {
        if (this.labelsUpdated) {
            this.labelsUpdated = false;
            this.$notification.show({
                component: () =>
                    import(
                        '~/components/integrations/jira/JiraNotification.vue'
                    ),
                bind: {
                    entityId: this.entity.id,
                    action: JiraActions.UPDATE,
                    property: 'Labels',
                },
            });
        }
    }

    get integrationData() {
        const id = this.entityIdProp || this.entityId;
        return (
            this.$store.getters['integrationData/byId'](id) ??
            this.$store.getters['integrationData/byId'](this.clip) ?? {
                properties: {},
            }
        );
    }

    // @ts-ignore
    get entity() {
        if (this.entityData) return this.setProperties(this.entityData);
        return this.setProperties(this.integrationData);
    }

    comments = [];

    get issueDescription() {
        return this.$entities.jira.normalizeIssueDescription(
            this.entity.description,
        );
    }

    async fetchComments() {
        this.comments = await this.$entities.jira.getIssueComments(
            this.entity.key,
        );
    }

    getJiraAttachmentUrl(attachmentId: string, thumbnail: boolean = true) {
        return this.$entities.jira.getJiraAttachmentUrl(
            attachmentId,
            thumbnail,
        );
    }

    beforeDestroy() {
        if (this.entity.notification) {
            this.$entities.jira.dismissNotification(this.entity);
        }
    }

    mounted() {
        this.clip = this.document?.clip ?? null;
        this.$entities.jira.fetchIssue(
            this.$entities.jira.getIntegration(),
            this.issueProject,
            this.entity.key,
            false,
        );

        this.fetchIssueLinks();
        this.fetchComments();
        this.registerImageHandlers();

        setTimeout(() => {
            this.preloadAttachments();
        }, 250);
    }

    fetchIssueLinks() {
        const links = this.entity.properties?.issuelinks;
        if (!links?.length) return;
        links.forEach((link: any) => {
            const key = link.inwardIssue?.key || link.outwardIssue?.key;
            const project = this.$entities.jira.getByKey(key.split('-')[0]);

            this.$entities.jira.fetchIssue(
                this.$entities.jira.getIntegration(),
                project,
                key,
                false,
            );
        });
    }

    preloadAttachments() {
        if (!this.entity.properties?.attachment?.length) {
            return;
        }

        this.entity.properties.attachment.forEach((attachment: any) => {
            if (!attachment.mimeType.startsWith('image/')) return;
            const img = new Image();
            img.src = this.getJiraAttachmentUrl(attachment.id, false);
        });
    }

    registerImageHandlers() {
        this.$refs?.issueDescription
            ?.querySelectorAll('img')
            ?.forEach(image => {
                image.addEventListener('click', e => {
                    e.preventDefault();

                    const src = image.getAttribute('src') as string;
                    const parsedUri = src.replace('&thumbnail=true', '');
                    const attachmentType = image.getAttribute(
                        'data-attachment-type',
                    );
                    if (attachmentType === 'file') {
                        this.$utils.navigation.openExternalLink(parsedUri);
                        return;
                    }

                    this.$vfm.show({
                        component: () =>
                            import('@/components/modal/ImageModal.vue'),
                        bind: {
                            src: parsedUri,
                        },
                    } as DynamicModalOptions);
                });
            });
    }
}
</script>
<style lang="scss">
.jira-issue-properties--description--content {
    @include editorStyling;
    //font-size: 13px;

    .preformatted.panel {
        border-radius: 6px;
        border: 0px;
    }
}
</style>

<style lang="scss" scoped>
@mixin label {
    @include font10-700;
    text-transform: uppercase;
    min-width: 130px;
    color: var(--jira-panel-label-color);
}

@mixin content {
    @include font12-500;
    color: var(--jira-panel-text-color);
}

.divider {
    height: 1px;
    margin: 15px 32px 15px 48px;

    background: var(--tab-divider-color);
}

.jira-issue-properties {
    &.panel {
        @include scrollbar(10px, 10px, 0px);
        overflow-y: auto;
        background: var(--panel-background);
        border-radius: 12px;
        max-height: calc(100% - 6px);
    }

    width: 100%;
    user-select: none;
    cursor: default;
    position: relative;

    &--attachment {
        padding: 0 16px 0 24px;

        &.detached {
            padding: 12px 30px 0 30px;
        }

        &--title {
            @include label;
            margin-bottom: 8px;
        }

        &--content {
            @include content;
            word-break: break-all;

            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-wrap: wrap;

            &--wrapper {
                margin: 0 8px 8px 0;
                width: 156px;
                height: 125px;
                border-radius: 6px;
                border: 1px solid var(--tab-divider-color);
                position: relative;
                overflow: hidden;

                &:hover {
                    background: var(--jira-panel-wrapper-bg__hover);

                    .jira-issue-properties--attachment--content--wrapper--text {
                        background: var(
                            --jira-panel-wrapper-text-bg-color__hover
                        );
                    }
                }

                &--text {
                    @include ellipsis;
                    padding: 4px 8px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: var(--jira-panel-wrapper-text-bg-color);
                }

                &--image {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    height: 100%;
                    width: 100%;
                    object-fit: cover;
                }
            }
        }
    }

    &--header {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 0 16px 16px 24px;
        background: var(--jira-panel-header-bg-color);
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */
        border-bottom: 1px solid var(--tab-divider-color);

        .panel & {
            background: var(--panel-header-background);
            padding: 14px 15px 14px 15px;
        }

        &.detached {
            padding: 24px 30px 16px 30px;
        }

        &--title {
            @include inputMetaStyles;
            display: flex;
            align-items: center;
            user-select: text;

            span {
                @include font12-600;
                color: var(--jira-panel-header-text-color);
                display: flex;
                align-items: center;
                gap: 8px;
            }
        }

        &__quick-actions {
            display: flex;
            align-items: center;

            button {
                color: var(--jira-panel-header-icon-color);
                padding: 7px;
                flex-shrink: 0;
                border-radius: 4px;

                &:hover {
                    color: var(--jira-panel-header-icon-color__hover);
                }
            }

            .quick-action-item {
                &:not(:last-child) {
                    margin-right: 8px;
                }

                &:last-child {
                    margin-left: 8px;
                }
            }
        }
    }

    &--issue-text {
        @include inputMetaStyles;
        font-weight: 700;
        font-size: 22px;
        line-height: 155.2%;
        color: var(--jira-panel-title-color);
        user-select: text;
        margin-bottom: 20px;

        .panel & {
            font-size: 18px;
        }
    }

    &--properties {
        padding: 12px 16px 0 24px;

        &.detached {
            padding: 12px 30px 0 30px;
        }

        .panel & {
            padding: 0px 15px;
        }
    }

    &--property {
        display: grid;
        grid-template-columns: 130px 1fr;
        justify-items: start;
        justify-content: start;
        align-items: center;
        margin-bottom: 18px;

        .panel & {
            :deep(.jira-issue-properties--property__value) {
                width: 100%;
            }

            :deep(.a-select__button) {
                width: 100% !important;
            }
        }

        &__label {
            @include label;
        }

        &__value {
            @include content;
        }
    }

    &--description {
        padding: 0 16px 0 24px;

        &.detached {
            padding: 0 30px 0 30px;
        }

        &--title {
            @include label;
            margin-bottom: 8px;
        }

        &--content {
            @include content;
            word-break: break-all;
            user-select: text;

            :deep(.panel) {
                border: none;
            }
        }
    }

    &--linked {
        padding: 0 16px 0 19px;
        margin-bottom: 15px;

        &.detached {
            padding: 0;

            .jira-issue-properties--linked--title {
                padding: 0 30px 0 30px;
            }

            .jira-issue-properties--linked--content {
                padding: 0 32px 0 18px;
            }
        }

        &--title {
            @include label;
            padding-left: 5px;
        }

        &--sub-title {
            @include label;
            padding-left: 20px;
            margin: 10px 0 4px;
        }

        &--content {
        }
    }

    &--activity {
        &.detached {
            padding: 0 30px 30px 30px;
        }

        .panel & {
            padding: 0px 15px 15px;
        }

        &--label {
            @include label;
            margin-bottom: 8px;
        }
    }
}
</style>
