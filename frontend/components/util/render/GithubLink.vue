<template>
    <span class="github-link"
        ><GithubEntityIcon :entity="entity" class="icon" /><span
            class="github-link__title"
            ><span class="github-link__key">#{{ entity?.number }} </span
            >{{ entity?.title }}</span
        ></span
    >
</template>
<script>
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';

export default {
    components: { GithubEntityIcon },
    data() {
        return {
            id: null,
        };
    },
    computed: {
        entity() {
            return this.$entities.github.getById(this.id);
        },
    },
    mounted() {
        const { id } = this.$attrs;
        this.id = id;
    },
};
</script>
<style lang="scss" scoped>
.github-link {
    text-decoration: none !important;
    text-decoration-thickness: 0px !important;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 2px 4px;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;
    position: relative;

    .icon {
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
