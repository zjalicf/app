<template>
    <div
        class="issue-clip-trigger"
        :class="{ 'has-doc': document, highlighted }"
    >
        <button
            class="issue-clip-trigger--redirect has-tippy"
            :data-tippy-content="
                document
                    ? `<div tabindex='-1' class='tooltip'>Go to ${document.title}</div>`
                    : `<div tabindex='-1' class='tooltip'>Add Page</div>`
            "
            @click.prevent.stop="redirect($event, document)"
        >
            <div v-if="document" class="issue-clip-trigger--page">
                <div class="issue-clip-trigger--wrapper">
                    <DocumentIcon :document="document" />
                    <div class="issue-clip-trigger--bg">
                        <DocumentIcon :document="document" />
                    </div>
                </div>
                <AcreomChevronRight class="icon redirect-icon" />
            </div>
            <InterfaceAdd1 v-else class="icon plus" size="12" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';
import PhoneSignalOff from '~/components/streamline/PhoneSignalOff.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import { TabType } from '~/constants';
import { TabSymbols } from '~/constants/symbols';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'IssueClipTrigger',
    components: {
        AcreomChevronRight,
        InterfaceAdd1,
        DocumentIcon,
        PhoneSignalOff,
        InterfaceRemove1,
        InterfaceUserCircle,
    },
})
export default class IssueClipTrigger extends JiraEntityMixin {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ required: true })
    entity!: any;

    @Prop()
    selected!: any;

    @Prop({ default: false })
    highlighted!: any;

    @Prop({ default: null })
    source!: TrackingActionSource | null;

    get jiraIssueId() {
        return this.entity.id;
    }

    get document() {
        return this.$store.getters['document/byClip'](this.jiraIssueId);
    }

    get tasks() {
        return this.$store.getters['tasks/byDocumentId'](this.document.id);
    }

    @Watch('selected', { immediate: true })
    handleSelected(value: boolean) {
        if (value) {
            this.$nextTick(() => {
                this.$nuxt.$on(
                    `${this.tabId}-issue-page`,
                    this.shortcutRedirect,
                );
            });
        } else {
            this.$nuxt.$off(`${this.tabId}-issue-page`, this.shortcutRedirect);
        }
    }

    async shortcutRedirect() {
        const docId = this.document
            ? this.document.id
            : await this.createDocumentContent();

        const tab = this.$tabs.createNewTabObject(docId, TabType.DOCUMENT);
        await this.$tabs.openTab(tab);
    }
}
</script>
<style lang="scss" scoped>
.issue-clip-trigger {
    width: 64px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 30px;
    background: var(--issue-clip-trigger-bg-color);
    overflow: hidden;

    &.has-doc {
        background: var(--issue-clip-trigger-bg-color__has-doc);
    }

    &.highlighted:not(.has-doc) {
        .plus {
            color: var(--issue-clip-trigger-icon-color__highlight);
        }

        background: var(--issue-clip-trigger-bg-color__highlight);

        &:hover {
            background: var(--issue-clip-trigger-bg-color__highlight__hover);
        }
    }

    .redirect-icon {
        display: none;
    }

    &--redirect {
        width: 100%;
        height: 100%;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &--wrapper {
        display: flex;
        align-items: center;
        gap: 7px;
        position: relative;
    }

    &--bg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(2);
        filter: blur(10px) brightness(120%);
    }

    .plus {
        color: var(--issue-clip-trigger-icon-color);
    }

    &--tasks {
        @include font10-700;
        @include ellipsis;
        width: 100%;
        color: var(--issue-clip-trigger-tasks-color);
    }

    &:hover {
        background: var(--issue-clip-trigger-bg-color__hover);

        .issue-clip-trigger--wrapper {
            display: none;
        }

        .redirect-icon {
            display: block;
        }

        .icon {
            color: var(--issue-clip-trigger-icon-color__hover);
        }
    }
}
</style>
