<template>
    <div class="project page">
        <div class="project--header">
            <MobileFolderHeader :folder="folder" />
        </div>
        <div class="project--content">
            <div ref="projectPanel" class="project--content--documents">
                <VirtualCollection
                    v-if="documents.length > 0 || childFolders.length > 0"
                    :cell-size-and-position-getter="
                        cellSizeAndPositionGetterCards
                    "
                    :collection="documents"
                    :width="width"
                    :height="height"
                    :header-slot-height="headerHeight"
                    class="project--content--virtual"
                >
                    <template #header>
                        <div
                            ref="projectHeader"
                            class="project--content--documents--header"
                        >
                            <div
                                v-if="childFolders.length"
                                class="project--content--folders"
                            >
                                <div class="project--content--folders--header">
                                    Folders
                                </div>
                                <div class="project--content--folders--grid">
                                    <FolderCard
                                        v-for="data in childFolders"
                                        :key="data.id"
                                        :folder="data"
                                        :level="nextLevel"
                                    />
                                </div>
                            </div>
                            <div
                                v-if="documents.length && childFolders.length"
                                class="project--content--header"
                            >
                                Pages
                            </div>
                        </div>
                    </template>
                    <div slot="cell" slot-scope="props">
                        <DocumentCard
                            :document="props.data"
                            :level="nextLevel"
                        />
                    </div>
                </VirtualCollection>
                <div v-else class="empty">
                    <p style="margin-bottom: 15px">This folder is empty</p>
                    <p>
                        <nuxt-link
                            tag="button"
                            class="empty-link"
                            :to="`/mobile/documents/new?project=${folder.id}&level=${nextLevel}`"
                        >
                            <PencilAltIcon size="20" class="icon" />
                            New Page
                        </nuxt-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { PencilAltIcon } from '@vue-hero-icons/solid';
import { IDocument } from '~/components/document/model';
import { IFolder } from '~/@types';
import DocumentCard from '~/components/mobile/card/DocumentCard.vue';
import FolderCard from '~/components/mobile/card/FolderCard.vue';
import MobileFolderHeader from '~/components/mobile/common/headers/MobileFolderHeader.vue';
import { transition } from '~/helpers/util';

@Component({
    name: 'Views',
    layout: 'mobile',
    components: {
        FolderCard,
        PencilAltIcon,
        DocumentCard,
        MobileFolderHeader,
    },
    transition,
    async asyncData({ store, redirect, params, $entities }) {
        const { id: folderId } = params;
        const folder = $entities.folder.byId(folderId);

        if (!folder) {
            redirect(301, '/mobile', { level: '0' });
            return;
        }

        const panelTab = store.getters['panel/panelTab'];
        const isOpen = store.getters['panel/open'];

        if (isOpen && ['xray', 'integrations'].includes(panelTab)) {
            await store.dispatch('panel/close');
        }

        if (isOpen && panelTab === 'apps') {
            await store.dispatch('panel/setPanelTab', 'apps');
        }

        if (!isOpen) {
            await store.dispatch('panel/close');
        }

        return { folderId };
    },
})
export default class Folder extends Vue {
    width: number = 0;
    height: number = 0;
    headerHeight: number = 200;

    $refs!: {
        projectPanel: HTMLDivElement;
        projectHeader: HTMLDivElement;
    };

    folderId!: string;

    get folder() {
        return this.$entities.folder.byId(this.folderId);
    }

    get nextLevel() {
        if (!this.$route.query.level) return null;
        return +this.$route.query.level + 1;
    }

    cellSizeAndPositionGetterCards(_: any, index: number) {
        return {
            width: this.width - 40,
            height: 57,
            x: 0,
            y: index * (57 + 16),
        };
    }

    get childFolders() {
        if (!this.folderId) return [];

        const sortBy = 'updatedAt' as any;

        const sort = (
            a: IFolder & Record<string, any>,
            b: IFolder & Record<string, any>,
        ) => {
            const aNum = new Date(a[sortBy]).getTime();
            const bNum = new Date(b[sortBy]).getTime();
            return bNum - aNum;
        };

        return [...this.$entities.folder.byParentId(this.folderId)].sort(sort);
    }

    get documents() {
        // might not be set
        const sortBy = 'updatedAt';

        const sort = (
            a: IDocument & Record<string, any>,
            b: IDocument & Record<string, any>,
        ) => {
            const aNum = new Date(a[sortBy]).getTime();
            const bNum = new Date(b[sortBy]).getTime();
            return bNum - aNum;
        };
        const documents = this.viewData;

        return [...documents].sort(sort).map(doc => ({ data: doc }));
    }

    mounted() {
        if (this.$refs.projectPanel) {
            this.width = this.$refs.projectPanel.offsetWidth;
            this.height = this.$refs.projectPanel.offsetHeight;
        }

        if (this.$refs.projectHeader) {
            this.headerHeight = this.$refs.projectHeader.offsetHeight;
        }
    }

    get viewData(): any[] {
        if (!this.folder) return [];

        return this.$entities.page
            .getSortedPages()
            .filter(
                ({ archived, projectId, status }: IDocument): boolean =>
                    projectId === this.folder!.id &&
                    status !== 'new' &&
                    !archived,
            );
    }
}
</script>

<style lang="scss" scoped>
.project {
    height: $pageHeight;
    background: var(--app-mobile-bg-color);

    &--content {
        position: relative;
        height: $contentHeight;

        &--virtual {
            @include scrollbar;
            padding: 20px 20px 20px;
            overflow-x: hidden;
        }

        &--header {
            user-select: none;
            font-weight: 700;
            font-size: 16px;
            line-height: 175.2%;
            color: var(--mobile-pages-header-color);
            margin-bottom: 7px;
            margin-top: 18px;
        }

        &--folders {
            &--header {
                user-select: none;
                font-weight: 700;
                font-size: 16px;
                line-height: 175.2%;
                color: var(--mobile-pages-header-color);
                margin-bottom: 7px;
            }

            &--grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, 192px);
                gap: 16px 16px;

                @media (max-width: 435px) {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
            }
        }

        &--view {
            &.cards {
                padding: 0 20px;
            }

            &.list {
                padding: 0 20px;
            }
        }

        &--documents {
            @include scrollbar;
            overflow-y: auto;
            height: $contentHeight;
            width: 100%;
            overflow-x: hidden;

            &--filters {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                padding-top: 20px;
                margin-bottom: 10px;
            }

            @media (max-width: 769px) {
                //padding: 20px;
            }

            .empty {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                text-align: center;

                p {
                    font-size: 15px;
                    color: var(--mobile-empty-color);
                    line-height: 20px;
                    user-select: none;
                    font-weight: 500;
                    margin-bottom: 15px;

                    button {
                        @include animateBackgroundColor;
                        outline: none;
                        color: var(--accent-color);
                        cursor: default;
                        display: inline-flex;
                        align-items: center;

                        .icon {
                            flex-shrink: 0;
                            margin-right: 5px;

                            path[stroke] {
                                stroke: var(--mobile-app-bg-color);
                            }
                        }

                        &:hover {
                            color: darken($turquoise, 15%);
                        }
                    }
                }
            }
        }

        &--panel {
            position: absolute;
            height: calc(var(--viewport-height) - 73px);
            right: 10px;
            top: 10px;
            transform: translateX(calc(100% + 30px));
            transition: transform 0.3s;
            width: calc(50% - 10px);
            user-select: none;

            @media (max-width: 769px) {
                width: calc(100% - 20px);
            }
        }
    }
}
</style>
