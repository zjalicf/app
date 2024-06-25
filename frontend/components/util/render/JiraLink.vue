<template>
    <span class="jira-link">
        <img :src="imageLink" />
        <span class="jira-link__title">
            <span class="jira-link__key">{{ key }}</span>
            <span class="jira-link__text">{{ text }}</span>
        </span>
    </span>
</template>
<script>
export default {
    data() {
        return {
            id: null,
        };
    },
    computed: {
        entity() {
            return this.$entities.jira.getById(this.id);
        },
        imageLink() {
            if (this.issueType) {
                return this.issueType.iconUrl;
            }

            return '';
        },
        key() {
            return this.entity?.key ?? '';
        },
        text() {
            return this.entity?.text ?? '';
        },
        issueType() {
            return this.entity?.properties?.issuetype ?? null;
        },
    },
    mounted() {
        const { id } = this.$attrs;
        this.id = id;
    },
};
</script>
<style lang="scss" scoped>
.jira-link {
    text-decoration: none !important;
    text-decoration-thickness: 0px !important;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 2px 4px;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;
    position: relative;

    img {
        position: relative;
        top: -2px;
        margin-right: 4px;
        height: 16px;
        width: 16px;
        display: inline;
    }

    &__title {
    }

    &__key {
        color: var(--editor-extension-github-link-color);
    }
}
</style>
