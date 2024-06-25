<template>
    <div class="documents page">
        <div class="documents--header">
            <MobileDocumentsHeader />
        </div>
        <div class="documents--content">
            <div ref="documentsContent" class="documents--content--documents">
                <VirtualCollection
                    v-if="documents.length"
                    :cell-size-and-position-getter="
                        cellSizeAndPositionGetterCards
                    "
                    :collection="documents"
                    :width="width"
                    :height="height"
                    class="documents--content--virtual"
                >
                    <div slot="cell" slot-scope="props">
                        <DocumentCard
                            :document="props.data"
                            :level="nextLevel"
                        />
                    </div>
                </VirtualCollection>
                <div v-else class="empty">
                    <p style="margin-bottom: 15px">You don't have any pages</p>
                    <p>
                        <nuxt-link
                            tag="button"
                            :to="`/mobile/documents/new?level=${nextLevel}`"
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
import isEmpty from 'lodash/isEmpty';
import { IDocument } from '~/components/document/model';
import DocumentCard from '~/components/mobile/card/DocumentCard.vue';
import MobileDocumentsHeader from '~/components/mobile/common/headers/MobileDocumentsHeader.vue';
import { transition } from '~/helpers/util';

@Component({
    name: 'DocumentsIndex',
    components: {
        MobileDocumentsHeader,
        PencilAltIcon,
        DocumentCard,
    },
    head() {
        return {
            title: `All Pages - acreom`,
        };
    },
    layout: 'mobile',
    transition,
})
export default class DocumentsIndex extends Vue {
    width: number = 0;
    height: number = 0;

    $refs!: {
        documentsContent: HTMLDivElement;
    };

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

    sort() {
        return (
            a: IDocument & Record<string, any>,
            b: IDocument & Record<string, any>,
        ) => {
            const aNum = new Date(a.updatedAt).getTime();
            const bNum = new Date(b.updatedAt).getTime();
            return bNum - aNum;
        };
    }

    get filteredDocs() {
        return this.$entities.page.getSortedPages().filter(
            (doc: IDocument) =>
                !isEmpty(doc) &&
                // eslint-disable-next-line no-prototype-builtins
                doc.hasOwnProperty('title') &&
                // eslint-disable-next-line no-prototype-builtins
                doc.hasOwnProperty('content'),
        );
    }

    sortDocuments(documents: IDocument[]) {
        return [...documents].sort(this.sort()).map(doc => ({ data: doc }));
    }

    get documents() {
        return this.sortDocuments(
            this.filteredDocs.filter((doc: IDocument) => !doc.archived),
        );
    }

    mounted() {
        if (!this.$refs.documentsContent) return;
        this.width = this.$refs.documentsContent?.offsetWidth;
        this.height = this.$refs.documentsContent?.offsetHeight;
    }
}
</script>

<style scoped lang="scss">
.documents {
    background: var(--app-mobile-bg-color);
    height: $pageHeight;

    &--content {
        position: relative;
        height: $contentHeight;

        &--virtual {
            @include scrollbar;
            padding: 20px 20px 20px;
            overflow-x: hidden;
        }

        &--documents {
            height: $contentHeight;
            width: 100%;

            @media (max-width: 769px) {
                //padding: 20px;
            }

            &--banner-wrapper {
                padding: 10px 20px 0;
            }
        }
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
</style>
