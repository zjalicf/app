<template>
    <div class="mobile-info-wrapper page">
        <PageInfoHeader :title="document.title" />
        <div class="mobile-info">
            <div class="mobile-info--tab">
                <XRayTab v-if="links.length || backlinks.length">
                    <h3>Links</h3>
                    <XRayLinks
                        :parent-document="document"
                        :links="links"
                        :backlinks="backlinks"
                        :jira-links="$entities.page.getJiraLinks(document.id)"
                        :github-links="
                            $entities.page.getGithubLinks(document.id)
                        "
                        :linear-links="
                            $entities.page.getLinearLinks(document.id)
                        "
                        @navigate="goToBacklink"
                    />
                </XRayTab>
                <XRayTab v-if="headings.length">
                    <h3>Outline</h3>
                    <XRayStructure :headings="headings" :is-mobile="true" />
                </XRayTab>
                <XRayTab v-if="images.length">
                    <h3>Media</h3>
                    <XRayMedia :media="images" :is-mobile="true" />
                </XRayTab>
                <XRayTab>
                    <h3>Properties</h3>
                    <XRayProperties :properties="properties" />
                </XRayTab>
                <XRayTab>
                    <h3>Location</h3>
                    <XRayLocation
                        :page="document"
                        :labels="labels"
                        :is-mobile="true"
                        @link:navigate="goToLocation"
                    />
                </XRayTab>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { generateJSON } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { IDocument } from '~/components/document/model';
import { UniqueID } from '~/components/editor/extensions/unique-id';
import XRayTab from '~/components/x-ray/XRayTab.vue';
import XRayLinks from '~/components/x-ray/XRayLinks.vue';
import XRayStructure from '~/components/x-ray/XRayStructure.vue';
import XRayMedia from '~/components/x-ray/XRayMedia.vue';
import XRayProperties from '~/components/x-ray/XRayProperties.vue';
import XRayLocation from '~/components/x-ray/XRayLocation.vue';
import PageInfoHeader from '~/components/mobile/common/headers/PageInfoHeader.vue';
import { transition } from '~/helpers/util';
import { ITask } from '~/components/task/model';
import { ViewType } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'MobileInfo',
    components: {
        XRayLocation,
        XRayProperties,
        XRayMedia,
        XRayStructure,
        XRayLinks,
        XRayTab,
        PageInfoHeader,
    },
    async asyncData({ route, store }): Promise<object | void> {
        const document = await store.getters['document/byId'](route.params.id);
        return { document };
    },
    transition,
    layout: 'mobile',
})
export default class MobileInfo extends Vue {
    document!: IDocument;

    get isDailyDoc() {
        if (!this.document) return false;
        return !!this.document?.dailyDoc;
    }

    get nextLevel() {
        if (!this.$route.query.level) return null;
        return +this.$route.query.level + 1;
    }

    get properties() {
        if (!this.document)
            return {
                createdAt: new Date(),
                updatedAt: new Date(),
            };

        return {
            createdAt: this.document.createdAt || new Date(),
            updatedAt: this.document.updatedAt || new Date(),
        };
    }

    get project() {
        if (!this.document) return null;
        if (!this.document.projectId) return null;

        return this.$entities.folder.byId(this.document.projectId);
    }

    get labels() {
        if (!this.document) return [];

        return this.documentEntitiesMap.labels;
    }

    get links() {
        if (!this.documentEntitiesMap?.links) return [];

        return this.documentEntitiesMap.links
            .map((link: string) => {
                return this.$store.getters['document/byId'](link);
            })
            .filter((doc: IDocument | null) => doc !== null);
    }

    get backlinks() {
        if (!this.document) return [];

        return this.$store.getters['document/backlinks'](this.document.id);
    }

    get documentEntitiesMap() {
        return this.$entities.page.getPostprocessingMap(this.document.id);
    }

    get tasks() {
        if (!this.documentEntitiesMap?.tasks) return [];

        const tasks = this.documentEntitiesMap.tasks
            .map((id: string) => {
                return this.$store.getters['tasks/byId'](id);
            })
            .filter((task: ITask | null) => task !== null);

        return tasks;
    }

    get events() {
        // TODO: maybe show events that MENTION that document? Similarly tasks
        if (!this.documentEntitiesMap?.events) return [];

        const events = this.documentEntitiesMap.events
            .map((id: any) => {
                return this.$store.getters['event/byId'](id);
            })
            .filter((event: any) => event !== null);

        return events;
    }

    get images() {
        return this.documentEntitiesMap?.images ?? [];
    }

    get headings() {
        if (!this.document?.content) return [];

        const headings = generateJSON(this.document.content, [
            StarterKit as any,
            UniqueID.configure({
                types: ['heading'],
            }),
        ])
            .content.filter(
                ({ type, ...h }: any) => type === 'heading' && h.content,
            )
            .map((h: any) => {
                return {
                    level: h.attrs.level,
                    id: h.attrs.id,
                    textContent: h.content.reduce(
                        (accumulator: string, curr: any) => {
                            return accumulator + curr.text;
                        },
                        '',
                    ),
                };
            }) as any[];

        if (this.document.title) {
            headings.unshift({
                level: 'title',
                id: 'title',
                textContent: this.document.title,
            });
        }

        return headings;
    }

    @TrackEvent(TrackingType.INFO_PANEL, {
        action: TrackingAction.CLICK_LOCATION,
        source: TrackingActionSource.MOBILE,
    })
    goToLocation(id: string) {
        this.goToPage(id);
    }

    @TrackEvent(TrackingType.PAGE, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.MOBILE_BACKLINK_INFO_PANEL,
    })
    goToBacklink(id: string) {
        this.goToPage(id);
    }

    goToPage(id: string) {
        if (id) {
            this.$router.push({
                path: `/mobile/documents/${id}`,
                query: {
                    level: `${this.nextLevel}`,
                },
            });
            return;
        }
        if (this.isDailyDoc) {
            this.$router.push({
                path: `/mobile/overview`,
                query: {
                    level: `${this.nextLevel}`,
                },
            });
            return;
        }
        if (this.project) {
            this.$router.push({
                path: `/mobile/folder/${this.project.id}`,
                query: {
                    level: `${this.nextLevel}`,
                },
            });
            return;
        }
        const allPagesView = this.$entities.view.getViewByType(
            ViewType.ALL_PAGES,
        );
        this.$router.push({
            path: `/mobile/view/${allPagesView.id}`,
            query: {
                level: `${this.nextLevel}`,
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.mobile-info-wrapper {
    height: $pageHeight;
}

.mobile-info {
    padding: 8px;
    overflow: overlay;
    height: $contentHeight;

    &--tab {
        @include scrollbar;
        height: 100%;
    }
}
</style>
