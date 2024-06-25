<template>
    <div class="page-detail page">
        <MobileHeader :document="document" />
        <MobileEditor :page-id="document.id">
            <template #page-properties>
                <div ref="heading" class="page-detail__heading">
                    <MobileTitleEditor
                        :key="document.id"
                        ref="title"
                        :value="title"
                        :document="document"
                        @change="title = $event"
                        @focus="onTitleFocused"
                        @click="onTitleClicked"
                        @blur="onTitleBlurred"
                        @keyDown="focusEditor('start')"
                    />
                    <MobilePageProperties :page="document" />
                </div>
            </template>
        </MobileEditor>
    </div>
</template>

<script lang="ts">
import { Component, ProvideReactive, Vue, Watch } from 'vue-property-decorator';
import { v4 } from 'uuid';
import { FocusPosition } from '@tiptap/core';
import { IDocument } from '~/components/document/model';
import MobileHeader from '~/components/mobile/common/headers/MobileHeader.vue';
import { transition } from '~/helpers/util';
import { TabSymbols } from '~/constants/symbols';
import MobileTitleEditor from '~/components/mobile/common/page/MobileTitleEditor.vue';
import MobilePageProperties from '~/components/mobile/common/page/MobilePageProperties.vue';
import MobileEditor from '~/components/mobile/common/MobileEditor.vue';

@Component({
    name: 'DocumentDetail',
    components: {
        MobileEditor,
        MobilePageProperties,
        MobileTitleEditor,
        MobileHeader,
    },
    transition,
    layout: 'mobile',
    async asyncData({ route, store, redirect }): Promise<object | void> {
        const id =
            route.params.id === 'new_template'
                ? 'new_template'
                : route.params.id === 'new'
                ? 'new'
                : route.params.id;
        let projectId = route.query.project ? route.query.project : null;
        const pageStatus = route.query.pageStatus
            ? route.query.pageStatus
            : null;
        if (!id || id === 'new') {
            return redirect(301, `/mobile/documents/${v4()}`, route.query);
        }

        if (!id || id === 'new_template') {
            return redirect(301, `/mobile/documents/${v4()}`, {
                ...route.query,
                template: 'true',
            });
        }

        let focusTask = null;
        if (route.query.focus) {
            focusTask = route.query.focus;
        }

        const document = store.getters['document/byId'](id);
        let sharingUuid = null;

        if (projectId) {
            const project = store.getters['folder/byId'](projectId);
            if (project && project.sharingUuid) {
                sharingUuid = v4();
            }
        }

        if (!document) {
            await store.dispatch('document/new', {
                id,
                projectId,
                sharingUuid,
                pageStatus,
                title: '',
                content: '<p></p>',
                status: 'new',
                updatedAt: new Date(),
                createdAt: new Date(),
                template: route.query.template === 'true',
            });
            return { id, title: '' };
        } else {
            projectId = document.projectId || null;
        }

        if (document.dailyDoc) {
            store.commit('dailyDoc/setFromString', document.dailyDoc);
            return redirect('/');
        }

        const title = document.title || '';

        return { id, title, focusTask };
    },
})
export default class DocumentDetail extends Vue {
    projectId: string | null = null;
    id!: string;
    title!: string;
    focusTask: string | null = null;

    $refs!: {
        title: any;
        heading: HTMLDivElement;
        editor: any;
        document: HTMLElement;
    };

    @ProvideReactive(TabSymbols.IS_ACTIVE)
    get active() {
        return true;
    }

    focusEditor(pos: FocusPosition) {
        this.$nuxt.$emit('editor:focus-mobile', null, pos);
    }

    get document(): IDocument | null | any {
        const id = this.id || this.$route.params.id;
        const document = this.$store.getters['document/byId'](id);
        if (!document) {
            return {};
        }
        return document;
    }

    @Watch('document.title')
    handleDocumentTitleChange(val: string) {
        this.title = val;
    }

    onTitleFocused() {}

    onTitleClicked(event: MouseEvent) {
        this.$nuxt.$emit('editor:scroll-mobile', event);
    }

    onTitleBlurred() {
        if (
            (this.title === '' && this.document.status === 'new') ||
            this.title === this.document.title
        ) {
            return;
        }

        const id = this.id || this.$route.params.id;
        this.$store.dispatch('document/update', {
            id,
            title: this.title,
            updatedAt: new Date(),
        });
    }

    focusTitle() {
        this.$nextTick(() => {
            this.$refs.title?.setFocusEnd();
        });
    }

    beforeDestroy() {
        this.$nuxt.$off('heading:click');
        this.$nuxt.$off('mobile-keyboard-open');
    }

    mounted() {
        this.$nuxt.$on('heading:click', ({ id }: any) => {
            if (!id || id !== 'title') {
                return;
            }
            this.focusTitle();
        });

        if (this.title === '' && this.document.content === '<p></p>') {
            this.focusTitle();
        }

        if (this.focusTask) {
            setTimeout(() => {
                this.$nuxt.$emit(`focus-task:${this.focusTask}`);
            }, 200);
        }
    }
}
</script>
<style>
.ProseMirror {
    outline: none;
}
</style>
<style lang="scss" scoped>
.page-detail {
    background: var(--app-mobile-bg-color);
    height: 100%;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 56px calc(100% - 56px);

    &__heading {
        user-select: none;
    }
}
</style>
