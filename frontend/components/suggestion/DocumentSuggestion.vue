<template>
    <div
        class="suggestion"
        :class="{
            active,
            small,
            redirect: isNew && isTemplate,
            mobile: $utils.isMobile,
        }"
    >
        <div class="suggestion__title">
            <div class="suggestion__title__icon">
                <InterfaceFavoriteStar v-if="isDailyDoc" class="icon" />
                <InterfaceFileAddAlt
                    v-else-if="isNew && !isTemplate"
                    class="icon"
                />
                <ColorSwatchIcon
                    v-else-if="!isNew && isTemplate"
                    class="icon"
                    size="20"
                />
                <DocumentIcon
                    v-else-if="!isNew && !isTemplate"
                    :document="page"
                    class="icon"
                />
            </div>
            <p>{{ text }}</p>
            <component
                :is="statusIcon.icon"
                v-if="page.pageStatus"
                :style="{ color: statusIcon.color }"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
    DocumentAddIcon,
    ColorSwatchIcon,
    CogIcon,
} from '@vue-hero-icons/solid';
import { formatRelativeToDate } from '~/helpers';
import { IDocument } from '~/components/document/model';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceFileAddAlt from '~/components/streamline/InterfaceFileAddAlt.vue';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';

@Component({
    components: {
        InterfaceFavoriteStar,
        InterfaceFileAddAlt,
        DocumentIcon,
        DocumentAddIcon,
        ColorSwatchIcon,
        CogIcon,
    },
})
export default class DocumentSuggestion extends Vue {
    @Prop({ default: '' })
    text!: string;

    @Prop({ default: false })
    active!: boolean;

    @Prop({ default: '' })
    labels!: string;

    @Prop({ default: '' })
    date!: any;

    @Prop({ default: false })
    isNew!: boolean;

    @Prop({ default: false })
    isTemplate!: boolean;

    @Prop({ default: false })
    isDailyDoc!: boolean;

    @Prop({ default: false })
    small!: boolean;

    @Prop({ default: null })
    document!: IDocument;

    get dateString() {
        const now = new Date();
        return formatRelativeToDate(
            this.date,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    get statusIcon() {
        return this.$utils.page.getWorkflowIcon(this.page?.pageStatus);
    }

    get page() {
        return (
            this.$store.getters['document/byId'](this.document.id) ??
            this.document
        );
    }
}
</script>

<style scoped lang="scss">
.suggestion {
    padding: 5px 14px;
    border-radius: 6px;

    &__title {
        display: flex;
        align-items: center;

        &__icon {
            display: flex;
            align-items: center;
            padding-left: 0;
            margin-right: 8px;

            .icon {
                color: var(--document-suggestion-icon-color);

                .active & {
                    color: var(--document-suggestion-icon-color__active);
                }
            }
        }

        p {
            @include ellipsis;
            white-space: pre;
            font-weight: 500;
            font-size: 12px;
            line-height: 20px;
            padding: 0;
            color: var(--document-suggestion-text-color);
            margin-right: 8px;

            .active & {
                color: var(--document-suggestion-text-color__active);
            }
        }
    }

    &.active {
        padding: 3px 12px;
        border: 2px solid var(--accent-color);
        background: var(--document-suggestion-bg-color__active);
        color: var(--document-suggestion-text-color__active);
    }

    &.redirect {
        padding: 5px 2px;

        &.active {
            padding: 3px 0;
        }
    }

    &.mobile {
        padding: 10px 19px;
    }
}
</style>
