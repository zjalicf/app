<template>
    <div
        v-longpress.prevent.hapticend="handleContextMenu"
        class="mobile-page-row"
        :class="{ active: clicked }"
        @click="onDocumentItemClick"
    >
        <div class="mobile-page-row__title">
            <DocumentIcon
                :document="page"
                :size="16"
                :icon-size="16"
                font-size="14"
                class="doc-icon"
            />
            <span class="title">{{ pageTitle }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import PageDropdown from '~/components/mobile/common/dropdown/PageDropdown.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'MobilePageRow',
    components: {
        DocumentIcon,
    },
})
export default class MobilePageRow extends Vue {
    @Prop({ required: true })
    page!: any;

    @Prop({
        required: true,
    })
    level!: number;

    @Prop({ required: true })
    trackingType!: any;

    clicked: boolean = false;

    get pageTitle() {
        return this.page?.title && this.page?.title.length
            ? this.page.title
            : 'Untitled';
    }

    get breadcrumbs() {
        return this.$store.getters['document/breadcrumbsById'](this.page.id);
    }

    async onDocumentItemClick() {
        this.clicked = true;
        await this.$pane.hideAll();
        await this.$router.push({
            path: `/mobile/documents/${this.page.id}`,
            query: {
                level: `${this.level + 1}`,
            },
        });
        if (!this.trackingType) return;
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.OPEN,
            source: this.trackingType,
        });
    }

    handleContextMenu() {
        this.$pane.show({
            component: PageDropdown,
            bind: {
                document: this.page,
            },
            type: 'dropdown',
        });
    }
}
</script>
<style lang="scss" scoped>
.mobile-page-row {
    overflow: hidden;
    position: relative;
    user-select: none;
    cursor: default;
    padding: 12px 12px;
    border-radius: 6px;
    gap: 10px;

    &.active {
        .doc-icon {
            color: var(--sidebar-icon-color__hover);
        }

        background: var(--document-card-bg-color_hover);

        .document-row__title {
            color: var(--document-card-title-text-color__hover);

            &.archived {
                color: var(--document-card-title-text-color__archived__hover);
            }
        }
    }

    &__title {
        display: flex;
        align-items: center;
        overflow: hidden;
        gap: 12px;

        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;

        .doc-icon {
            flex-shrink: 0;
            color: var(--sidebar-icon-color);
        }

        .title {
            @include ellipsis;
            color: $white;
        }
    }
}
</style>
