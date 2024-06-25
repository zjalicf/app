<template>
    <div ref="dragInfo" :style="{ width: itemWidth }" class="view-drag-ghost">
        <div>
            <div
                :ref="`page-row-${document.id}`"
                class="document-row"
                :title="$entities.page.displayTitle(document)"
            >
                <div class="document-row__title">
                    <PageStatusComponent
                        v-if="shouldShowProperty('status')"
                        ref="pageStatus"
                        :tiny="true"
                        :entity-id="document.id"
                    />
                    <DocumentIcon
                        v-if="shouldShowProperty('icon')"
                        :document="document"
                        :size="14"
                        :icon-size="20"
                        font-size="14"
                        class="doc-icon"
                    />
                    <span class="title">{{ pageTitle }}</span
                    ><span
                        v-if="breadcrumbs && shouldShowProperty('breadcrumbs')"
                        class="breadcrumbs"
                        >{{ breadcrumbs }}</span
                    >
                    <PageRowTasks
                        v-if="
                            tasksOnPage.length > 0 &&
                            shouldShowProperty('tasks')
                        "
                        ref="pageTasks"
                        :page-id="document.id"
                    />
                    <div v-if="showClipPill" class="document-row__clips">
                        <component
                            :is="$utils.integrations.getClipComponent(document)"
                            :clip="document.clip"
                        />
                    </div>
                    <EntityLinksPill
                        v-if="$entities.page.hasLinks(document.id)"
                        :links="$entities.page.getLinks(document.id)"
                        :backlinks="$entities.page.getBacklinks(document.id)"
                        :jira-links="$entities.page.getJiraLinks(document.id)"
                        :github-links="
                            $entities.page.getGithubLinks(document.id)
                        "
                        :linear-links="
                            $entities.page.getLinearLinks(document.id)
                        "
                    />
                    <PageRowDate
                        v-if="hasDate && shouldShowProperty('date')"
                        :page-id="document.id"
                    />
                </div>
                <div class="document-row__date-properties">
                    <span
                        v-if="shouldShowProperty('updated')"
                        class="has-tippy"
                        :data-tippy-content="longUpdatedAt"
                    >
                        {{ formatUpdatedAt }}
                    </span>
                    <span
                        v-if="shouldShowProperty('created')"
                        class="has-tippy"
                        :data-tippy-content="longCreatedAt"
                    >
                        {{ formatCreatedAt }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { format } from 'date-fns-tz';
import { TabType } from '~/constants';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import PageRowTasks from '~/components/page-list/list/page-row/PageRowTasks.vue';
import PageStatusComponent from '~/components/entities/page/PageStatusComponent.vue';
import GithubClipPill from '~/components/github/GithubClipPill.vue';
import JiraClipPill from '~/components/jira/JiraClipPill.vue';
import PageRowDate from '~/components/page-list/list/page-row/PageRowDate.vue';
import EntityLinksPill from '~/components/entities/EntityLinksPill.vue';
import { currentTimezone, localizedRelativeFormat } from '~/helpers/date';
import { isGithubEntity } from '~/plugins/entities/github';

@Component({
    name: 'PageListDraggingInfo',
    methods: { isGithubEntity },
    computed: {
        TabType() {
            return TabType;
        },
    },
    filters: {
        capitalize(value: string) {
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
    },
    components: {
        EntityLinksPill,
        PageRowDate,
        JiraClipPill,
        GithubClipPill,
        PageStatusComponent,
        PageRowTasks,
        DocumentIcon,
    },
})
export default class PageListDraggingInfo extends Vue {
    $refs!: {
        dragInfo: HTMLElement;
    };

    offsetTop: number = 0;

    offsetLeft: number = 0;

    get itemWidth() {
        return this.dragItem?.data?.width ?? 200;
    }

    get dragItem() {
        return this.$utils.pageList.getDragData();
    }

    get document() {
        return this.$entities.page.byId(this.dragItem?.data.pageId)!;
    }

    get showClipPill() {
        return (
            this.$entities.page.hasClip(this.document) &&
            !!this.$utils.integrations.getClipComponent(this.document)
        );
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.dragItem?.data.tabId)
            ?.data;
    }

    get breadcrumbs() {
        return this.$store.getters['document/breadcrumbsById'](
            this.document.id,
        );
    }

    get selectedDisplayProperties() {
        return this.tabData?.viewOptions?.selectedDisplayProperties;
    }

    get entity() {
        return this.$store.getters['integrationData/byId'](this.document?.clip);
    }

    get hasDate() {
        return this.document.start;
    }

    get pageTitle() {
        return this.document?.title ?? 'Untitled';
    }

    get propertiesMap() {
        return this.$entities.page.getPostprocessingMap(this.document.id);
    }

    get tasksOnPage() {
        return this.propertiesMap?.tasks ?? [];
    }

    get formatUpdatedAt(): string {
        return format(
            new Date(this.document.updatedAt || new Date()),
            `d MMM`,
            {
                timeZone: currentTimezone(),
            },
        );
    }

    get formatCreatedAt(): string {
        return format(
            new Date(this.document.createdAt || new Date()),
            `d MMM`,
            {
                timeZone: currentTimezone(),
            },
        );
    }

    get longCreatedAt() {
        return `<span class='tooltip'>Created ${localizedRelativeFormat(
            new Date(this.document.createdAt || new Date()),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        )}</span>`;
    }

    get longUpdatedAt() {
        return `<span class='tooltip'>Updated ${localizedRelativeFormat(
            new Date(this.document.updatedAt || new Date()),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        )}</span>`;
    }

    shouldShowProperty(propertyName: string) {
        return this.selectedDisplayProperties?.includes(propertyName);
    }

    beforeDestroy() {
        this.$nuxt.$off('view:dragPosition');
    }

    mounted() {
        this.$nuxt.$on('view:dragPosition', (event: any) => {
            this.offsetLeft = event.left;
            this.offsetTop = event.top;

            const $dragInfo = this.$refs.dragInfo as any;

            $dragInfo.style.top = `${
                event.top - (this.dragItem?.data?.offsetY || 0)
            }px`;
            $dragInfo.style.left = `${
                event.left - (this.dragItem?.data?.offsetX || 0)
            }px`;
        });
    }
}
</script>
<style lang="scss" scoped>
.view-drag-ghost {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 4px 6px 4px calc(((var(--depth) - 1) * 26px) + 21px);
    border-radius: 6px;
    font-weight: 500;
    line-height: 20px;
    color: var(--dragging-info-text-color);
    background: var(--dragging-info-bg-color);
    opacity: 0.83;

    p {
        @include ellipsis;
        width: 100%;
    }

    .icon-wrapper {
        padding: 1px;
        flex-shrink: 0;
    }

    .icon {
        color: var(--dragging-info-icon-color);
        margin-right: 10px;
    }

    .custom-icon {
        width: 16px;
        height: 16px;
        font-size: 20px;
        border-radius: 4px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        flex-shrink: 0;

        span {
            font-size: 14px;
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
                'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
                EmojiSymbols, serif;
        }
    }

    .document-row {
        overflow: hidden;
        position: relative;
        user-select: none;
        cursor: default;
        display: grid;
        grid-template-columns: minmax(215px, max-content) min-content;
        justify-content: space-between;
        align-items: center;
        padding: 4px 10px 4px 12px;
        border-radius: 6px;
        gap: 10px;

        &__clips {
            flex-shrink: 0;
        }

        .document-drag-node {
            bottom: -200px;
            position: absolute;

            .untitled {
                color: var(--document-card-untitled-text-color);
            }
        }

        &:hover,
        &.active {
            .doc-icon {
                color: var(--sidebar-icon-color__hover);
            }

            background: var(--document-card-bg-color_hover);

            .document-row__title {
                color: var(--document-card-title-text-color__hover);

                &.archived {
                    color: var(
                        --document-card-title-text-color__archived__hover
                    );
                }
            }
        }

        &__title {
            display: flex;
            align-items: center;
            overflow: hidden;
            gap: 8px;

            .clip-key {
                color: var(--document-card-title-icon-color);
                margin-right: 4px;
                margin-left: 2px;
                font-size: 14px;
            }

            .doc-icon {
                flex-shrink: 0;
                color: var(--sidebar-icon-color);
            }

            .title {
                @include ellipsis;
            }

            .breadcrumbs {
                color: var(--document-row-breadcrumbs-color);
                flex-shrink: 0;
            }

            font-weight: 500;
            font-size: 13px;
            line-height: 24px;
            color: var(--jira-issue-text-color); // TODO: theme not same as card
        }

        &__content {
            @include ellipsis;
            @media (max-width: 595px) {
                display: none;
            }

            font-weight: normal;
            font-size: 13px;
            line-height: 23px;
            color: var(--document-card-meta-text-color);
        }

        &__date-properties {
            display: grid;
            grid-template-columns: repeat(2, min-content);
            align-items: center;
            gap: 4px;

            span {
                @include ellipsis;
                @media (max-width: 595px) {
                    display: none;
                }
                text-align: right;
                font-weight: normal;
                font-size: 13px;
                line-height: 17px;
                color: var(--document-card-meta-text-color);
                white-space: nowrap;
            }
        }
    }
}
</style>
