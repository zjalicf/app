<template>
    <nuxt-link
        v-if="document && private"
        :to="`/sharing/${document.sharingUuid}`"
        class="inline-document-link enabled"
    >
        <span v-if="document.icon" class="custom-icon"
            ><span>{{ document.icon }}</span></span
        >
        <InterfaceContentFileAlternate v-else size="16" class="icon" />
        <span class="inline-document-link--name">{{
            document.title || 'Untitled'
        }}</span>
    </nuxt-link>
    <span
        v-else-if="document && !private && document.archived"
        class="inline-document-link archived"
    >
        <span v-if="document && document.icon" class="custom-icon"
            ><span>{{ document.icon }}</span></span
        ><InterfaceContentFileAlternate v-else size="16" class="icon" />
        <span class="inline-document-link--name">{{
            document.title || 'Untitled'
        }}</span>
    </span>
    <span
        v-else-if="document && !private && !document.archived"
        :class="[`document-link-${document.id}`]"
        class="inline-document-link"
    >
        <span v-if="document && document.icon" class="custom-icon"
            ><span>{{ document.icon }}</span></span
        ><InterfaceContentFileAlternate v-else size="16" class="icon" />
        <span class="inline-document-link--name">{{
            document.title || 'Untitled'
        }}</span>
    </span>
    <span v-else class="inline-document-link">
        <DocumentIcon size="20" class="icon" />
        <span class="inline-document-link--name">{{
            !private ? 'Untitled' : 'Private document'
        }}</span></span
    >
</template>

<script>
import { DocumentIcon } from '@vue-hero-icons/solid';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';

export default {
    name: 'InlineDocumentLink',
    components: { InterfaceContentFileAlternate, DocumentIcon },
    data() {
        return {
            document: null,
            private: false,
        };
    },
    mounted() {
        const { id } = this.$attrs;
        this.private = this.$route.name === 'sharing-id';

        if (this.private) {
            this.document = this.$store.getters['anonymousDocument/byId'](id);
            return;
        }
        this.document = this.$store.getters['document/byId'](id);
    },
};
</script>

<style lang="scss" scoped>
.inline-document-link {
    position: relative;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 3px 4px 3px 2px;
    cursor: default;
    text-decoration: none;
    color: var(--editor-text-color);
    white-space: normal;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;

    &.archived {
        text-decoration: line-through;
    }

    .custom-icon {
        width: 16px;
        height: 16px;
        font-size: 14px;
        margin-right: 4px;
        display: inline-block;
        line-height: 20px;

        span {
            font-size: 14px;
            line-height: 20px;
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
                'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
                EmojiSymbols, serif;
        }
    }

    &.enabled {
        &:hover {
            text-decoration: none;
            background: var(--editor-extension-document-link-bg-color__hover);
            border: 2px solid var(--accent-color);
            padding: 1px 2px 1px 0px;

            .icon {
                color: var(--editor-extension-document-link-icon-color__hover);
            }
        }
    }

    .icon {
        color: var(--editor-extension-document-link-icon-color);
        position: relative;
        top: -2px;
        display: inline;
        width: 20px;
        height: 20px;
        margin-right: 2px;
    }

    a {
        color: var(--editor-extension-document-link-icon-color__hover);
        text-decoration: none;

        &:hover {
            text-decoration: none;
        }
    }

    &--shadow {
        position: absolute;
        visibility: hidden;
        white-space: pre;
        overflow: visible;
    }
}
</style>
