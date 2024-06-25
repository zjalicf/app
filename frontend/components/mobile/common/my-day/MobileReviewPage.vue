<template>
    <button @click="openDocument">
        <div class="document-link">
            <DocumentIcon
                :document="document"
                size="16"
                icon-size="16"
                font-size="14"
                class="icon"
            />
            <div class="document-link__text">
                <span class="document-link__text__title">
                    {{ $entities.page.displayTitle(document) }}
                </span>
                <span class="document-link__text__date">{{
                    formattedDate
                }}</span>
            </div>
        </div>
    </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import { formatRelativeToDate } from '~/helpers';

@Component({
    name: 'MobileReviewPage',
    components: { DocumentIcon },
})
export default class MobileReviewPage extends Vue {
    @Prop()
    document!: IDocument;

    get formattedDate() {
        return (
            formatRelativeToDate(
                this.document,
                new Date(),
                false,
                this.$store.getters['appSettings/dateTimeOptions'],
            ) || 'Set date'
        );
    }

    get currentLevel() {
        return +this.$route.query.level!;
    }

    async openDocument() {
        await this.$pane.hideAll();
        this.$router.push({
            path: `/mobile/documents/${this.document.id}`,
            query: {
                level: `${this.currentLevel + 1}`,
            },
        });
    }
}
</script>

<style lang="scss" scoped>
button {
    outline: none;
    padding: 8px 8px 4px;
    width: 100%;
}

.document-link {
    border-radius: 6px;
    padding: 6px 10px 6px 2px;
    display: flex;
    align-items: center;
    width: 100%;

    &__text {
        font-size: 18px;
        line-height: 24px;
        color: $white;
        width: 100%;
        overflow: hidden;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &__title {
            @include ellipsis;
        }

        &__date {
            font-size: 16px;
            color: var(--accent-color);
            margin-left: 4px;
            flex-shrink: 0;
        }
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
        margin-right: 6px;
        padding: 5px;
        flex-shrink: 0;
    }
}
</style>
