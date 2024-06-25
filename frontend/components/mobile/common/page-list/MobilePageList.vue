<template>
    <div ref="pageListContent" class="page-list">
        <VirtualCollection
            ref="virtualCollection"
            :cell-size-and-position-getter="cellSizeAndPositionGetterList"
            :collection="flatPageListData"
            :width="listWidth"
            :height="retrieveHeight"
            :header-slot-height="0"
            class="page-list__wrapper tab-content-gutter"
        >
            <template #cell="{ data }">
                <MobilePageSectionHeader
                    v-if="data.type === PageListEntityType.SECTION_HEADER"
                    :section-id="data.id"
                    :section-name="data.name"
                    :count="data.count"
                    :group-by="groupBy"
                />
                <MobilePageAdder
                    v-else-if="data.type === PageListEntityType.PAGE_ADDER"
                    :group-id="data.groupId"
                    :group-by="groupBy"
                    :level="level"
                    :tracking-type="trackingType"
                />
                <MobilePageListSpacer v-else-if="data.spacer" />
                <MobilePageRow
                    v-else
                    :page="data.page"
                    :level="level"
                    :tracking-type="trackingType"
                />
            </template>
        </VirtualCollection>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import { VirtualPageHeight } from '~/components/view/constants';
import { throttle } from '~/helpers';
import MobilePageSectionHeader from '~/components/mobile/common/page-list/MobilePageSectionHeader.vue';
import MobilePageAdder from '~/components/mobile/common/page-list/MobilePageAdder.vue';
import MobilePageRow from '~/components/mobile/common/page-list/MobilePageRow.vue';
import MobilePageListSpacer from '~/components/mobile/common/page-list/MobilePageListSpacer.vue';
import { FolderType, PageListEntityType, ViewType } from '~/constants';

@Component({
    name: 'MobilePageList',
    computed: {
        PageListEntityType() {
            return PageListEntityType;
        },
    },
    components: {
        MobilePageListSpacer,
        MobilePageRow,
        MobilePageAdder,
        MobilePageSectionHeader,
    },
})
export default class MobilePageList extends Vue {
    @Prop({ required: true })
    pages!: IDocument[];

    @Prop({ required: true })
    viewOptions!: any;

    @Prop({ required: true })
    pageListType!: ViewType | FolderType;

    @Prop({ required: true })
    level!: number;

    @Prop({ required: true })
    trackingType!: any;

    $refs!: {
        pageListContent: HTMLElement;
    };

    width: number = 0;
    listWidth: number = 0;
    height: number = 0;

    throttledByFps: any = throttle(requestAnimationFrame);
    pageListResizeObserver: any;

    get groupBy() {
        return this.viewOptions.groupBy;
    }

    get retrieveHeight() {
        return this.height;
    }

    get flatPageListData() {
        const data = this.flattenedPageList ?? [];
        return data.map((data: any, index: number) => {
            data.index = index;
            return { data };
        });
    }

    get flattenedPageList() {
        return this.$entities.view.getFlattenedPagesMobile(
            this.pages,
            this.viewOptions,
            this.pageListType,
        );
    }

    cellSizeAndPositionGetterList(item: any, index: number) {
        const itemHeight = VirtualPageHeight.MOBILE_PAGE;
        const width = this.width;

        const gutter = 16;

        return {
            width: width - gutter,
            height: item.data.height ?? itemHeight,
            x: 0,
            y: item.data.y ?? index * itemHeight,
            style: {
                'z-index': 0,
            },
        };
    }

    resizeListener() {
        return new Promise<void>((resolve, _reject) => {
            this.throttledByFps(() => {
                if (!this.$refs.pageListContent) return;
                const pageListWidth = this.$refs.pageListContent.offsetWidth;
                this.width = pageListWidth;
                this.listWidth = pageListWidth;
                this.height = this.$refs.pageListContent.offsetHeight;
                resolve();
            });
        });
    }

    beforeDestroy() {
        if (this.pageListResizeObserver) {
            this.pageListResizeObserver.disconnect();
        }
    }

    mounted() {
        this.resizeListener();
        this.pageListResizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.pageListContent) {
            this.pageListResizeObserver.observe(this.$refs.pageListContent);
        }
    }
}
</script>

<style scoped lang="scss">
.page-list {
    height: $contentHeight;
    width: 100%;

    :deep(.vue-virtual-collection-container) {
        position: relative;
    }

    :deep(.cell-container) {
        position: absolute;
        top: 0;
        left: 0;

        &:has(> .cell) {
            z-index: 1;
        }
    }

    &__header-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__wrapper {
        @include scrollbar;
        overflow-x: hidden;
        position: relative;

        :deep(.vue-virtual-collection-container) {
            margin: 0 auto;
        }
    }
}
</style>
