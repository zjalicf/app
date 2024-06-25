<template>
    <div class="document-dropdown">
        <div class="document-dropdown__title">
            <DocumentIcon
                :document="page"
                :size="16"
                :font-size="14"
                class="document-dropdown__title__icon"
            />
            <span>{{ page.title || 'Untitled' }}</span>
        </div>
        <div v-if="pageBacklinks.length" class="document-dropdown__options">
            <div class="document-dropdown__group-title">Backlinks</div>
            <button
                v-for="doc in pageBacklinks"
                :key="doc.id"
                class="document-dropdown__options__option"
                @click="navigate(doc.id)"
            >
                <div class="document-dropdown__options__option__icon">
                    <DocumentIcon size="16" class="icon" :document="doc" />
                </div>
                <div class="document-dropdown__options__option__title">
                    {{ getTitle(doc.id) }}
                </div>
            </button>
        </div>

        <div v-if="pageLinks.length" class="document-dropdown__options">
            <div class="document-dropdown__group-title">Linked Pages</div>
            <button
                v-for="doc in pageLinks"
                :key="doc.id"
                class="document-dropdown__options__option"
                @click="navigate(doc.id)"
            >
                <div class="document-dropdown__options__option__icon">
                    <DocumentIcon size="16" class="icon" :document="doc" />
                </div>
                <div class="document-dropdown__options__option__title">
                    {{ getTitle(doc.id) }}
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'BacklinksPane',
    components: {
        DocumentIcon,
    },
})
export default class DocumentDropdown extends Vue {
    @Prop({ required: true })
    page!: IDocument;

    get currentLevel() {
        return +this.$route.query.level!;
    }

    get pageLinks() {
        if (!this.page?.id) return [];

        return this.$store.getters['document/links'](this.page.id) || [];
    }

    get pageBacklinks() {
        if (!this.page?.id) return [];

        return this.$store.getters['document/backlinks'](this.page.id) || [];
    }

    getTitle(pageId: string) {
        return this.$entities.page.displayTitle(pageId);
    }

    @TrackEvent(TrackingType.PAGE, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.BACKLINK_DROPDOWN,
        sourceMeta: TrackingActionSourceMeta.MOBILE,
    })
    async navigate(id: string) {
        await this.$pane.hideAll();
        this.$router.push({
            path: `/mobile/documents/${id}`,
            query: {
                level: `${this.currentLevel + 1}`,
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.document-dropdown {
    @include mobileDropdown;

    &__group-title {
        font-weight: 500;
        font-size: 14px;
        color: $blueGrey400;
    }
}
</style>
