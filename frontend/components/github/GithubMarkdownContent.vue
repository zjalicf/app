<template>
    <div class="github-markdown-content" v-html="html"></div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SafeElectronWindow } from '~/@types';

@Component({
    name: 'GithubMarkdownContent',
})
export default class GithubMarkdownContent extends Vue {
    @Prop({ default: '' })
    html!: string;

    mounted() {
        this.$nextTick(() => {
            const links = this.$el.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const url = link.getAttribute('href') || '';
                    this.$utils.navigation.openExternalLink(url);
                });
            });
        });
    }
}
</script>
<style lang="scss" scoped>
.github-markdown-content {
    :deep(table th),
    :deep(table td) {
        border: 1px solid var(--editor-table-border-color);
        padding: 3px 7px;
    }

    :deep(h1) {
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 1rem;
    }

    :deep(h2) {
        font-weight: bold;
        font-size: 18px;
        margin-bottom: 1rem;
    }

    :deep(h3) {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 1rem;
    }

    :deep(h4) {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 1rem;
    }

    :deep(h5) {
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 1rem;
    }

    :deep(*) {
        font-size: 14px;
    }

    :deep(h6) {
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 1rem;
    }

    :deep(a) {
        color: var(--accent-color);

        &:hover {
            text-decoration: underline;
        }
    }

    :deep(code),
    :deep(pre) {
        background: var(--editor-code-bg-color);
    }

    :deep(pre) {
        padding: 4px 8px;
        border-radius: 6px;
        overflow: auto;
    }

    :deep(hr) {
        margin: 14px 0;
        border-color: var(--editor-hr-color);
    }
}
</style>
