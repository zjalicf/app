<template>
    <button
        :class="{
            active: activeHighlight || previewOpen,
            'document-link': styled,
        }"
        @click="openDocument"
        @mouseup.middle.stop.prevent="openDocument"
        @mouseover="handleMouseOver"
        @mouseleave.self="handleMouseLeave"
        @mousemove="handleMouseMove"
    >
        <DocumentIcon
            :document="document"
            size="14"
            icon-size="14"
            font-size="14"
            class="icon"
        />
        <div class="document-link__text">
            {{ $entities.page.displayTitle(document) }}
        </div>
        <component
            :is="statusIcon.icon"
            v-if="documentExists && document.pageStatus"
            :style="{ color: statusIcon.color, marginLeft: '4px' }"
        />
    </button>
</template>

<script lang="ts">
import { Component, Inject, Prop } from 'vue-property-decorator';
import { parse } from 'date-fns';
import { IDocument } from '~/components/document/model';
import DocumentLinkPreviewMixin from '~/mixins/DocumentLinkPreviewMixin.vue';
import { TabType } from '~/constants';
import { TabSymbols } from '~/constants/symbols';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import PageStatusComponent from '~/components/entities/page/PageStatusComponent.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'DocumentLink',
    components: { PageStatusComponent, DocumentIcon },
})
export default class DocumentLink extends DocumentLinkPreviewMixin {
    @Prop({ required: true })
    source!: TrackingActionSource;

    @Prop()
    document!: IDocument;

    @Prop()
    parentDocument!: IDocument;

    @Prop({ default: true })
    openPanelOnNavigate!: boolean;

    @Prop({ default: true })
    styled!: boolean;

    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Prop({ default: undefined })
    sourceMeta!: TrackingActionSourceMeta | undefined;

    activeHighlight: boolean = false;

    get documentExists() {
        return !!this.document;
    }

    get statusIcon() {
        return this.$utils.page.getWorkflowIcon(
            this.document?.pageStatus || null,
        );
    }

    get documentId() {
        return this.document?.id;
    }

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get parentDocumentId() {
        return this.parentDocument?.id;
    }

    get breadcrumbs() {
        return (
            this.$store.getters['document/breadcrumbsById'](this.document.id) ??
            null
        );
    }

    openDocument(event: MouseEvent) {
        if (this.$utils.isMobile) {
            this.$emit('link:navigate');
            return;
        }

        this.$dropdown.hideAll();
        this.$vfm.hideAll();

        let tabData = {};

        if (!event.altKey) {
            tabData = {
                panelOpen: this.openPanelOnNavigate,
                panelType: 'page',
                activeTab: this.tabData?.activeTab,
            };
        }

        const tab = this.$tabs.createNewTabObject(
            this.documentId,
            TabType.DOCUMENT,
            tabData,
        );

        if (this.document.dailyDoc) {
            this.$tracking.trackEventV2(TrackingType.MY_DAY, {
                source: this.source,
                sourceMeta: this.sourceMeta,
                action: TrackingAction.OPEN,
            });
            return this.$entities.myDay.open({
                event,
                data: {
                    date: parse(
                        this.document.dailyDoc,
                        'yyyy-MM-dd',
                        new Date(),
                    ),
                },
            });
        }

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            source: this.source,
            sourceMeta: this.sourceMeta,
            action: TrackingAction.OPEN,
        });

        this.$tabs.openTabWithEvent(tab, event);
    }
}
</script>

<style lang="scss" scoped>
button {
    max-width: 100%;

    .icon {
        margin-right: 10px;
        color: var(--context-menu-button-icon-color);

        path[stroke] {
            stroke: var(--context-menu-button-icon-color__path);
        }
    }

    &:hover {
        .icon {
            color: var(--context-menu-button-icon-color__hover);
        }
    }
    .status {
        margin-left: 8px;
    }
}

.document-link {
    @include ellipsis;
    @include font12-500;
    padding: 4px 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    color: var(--document-link-text-color);

    &__text {
        @include ellipsis;
    }

    &:hover,
    &.active {
        color: var(--document-link-text-color_hover);
        background: var(--document-link-bg-color_hover);

        .icon {
            color: var(--document-link-text-color_hover);
        }
    }

    .icon {
        color: var(--document-link-icon-color);
        margin-right: 8px;
        flex-shrink: 0;
    }

    &__title-wrapper {
        display: flex;
        align-items: center;
        overflow: hidden;
    }

    &__title {
        @include ellipsis;
    }

    &__breadcrumbs {
        @include font12-400;
        color: var(--document-link-breadcrumbs-color);
        margin-left: 4px;
    }

    &__status-icon {
        pointer-events: none;
    }
}
</style>
