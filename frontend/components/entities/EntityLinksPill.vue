<template>
    <div
        ref="linksButton"
        class="jira-clip-pill"
        :class="{ active: linksOpen }"
        @click.stop="openLinks"
    >
        <InterfaceArrowsDiagonalAlternate class="icon" />
        {{
            links.length +
            backlinks.length +
            githubLinks.length +
            linearLinks.length +
            jiraLinks.length
        }}
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceArrowsDiagonalAlternate from '~/components/streamline/InterfaceArrowsDiagonalAlternate.vue';
import LinksDropdown from '~/components/dropdown/LinksDropdown.vue';
import { GithubIssue, GithubPullRequest } from '~/components/github/github';
import { IDocument } from '~/components/document/model';
import { TrackingActionSourceMeta } from '~/@types/tracking';

@Component({
    name: 'EntityLinksPill',
    components: { InterfaceArrowsDiagonalAlternate },
})
export default class EntityLinksPill extends Vue {
    @Prop({ default: () => [] })
    links!: IDocument[];

    @Prop({ default: () => [] })
    backlinks!: IDocument[];

    @Prop({
        default: () => [],
    })
    githubLinks!: (GithubPullRequest | GithubIssue)[];

    @Prop({
        default: () => [],
    })
    jiraLinks!: any[];

    @Prop({
        default: () => [],
    })
    linearLinks!: any[];

    @Prop({ default: undefined })
    sourceMeta!: TrackingActionSourceMeta | undefined;

    linksOpen: boolean = false;

    $refs!: {
        linksButton: HTMLDivElement;
    };

    openLinks() {
        if (!this.$refs.linksButton) return;
        this.linksOpen = true;
        this.$emit('open');
        this.$dropdown.show({
            component: LinksDropdown,
            parent: this.$refs.linksButton,
            bind: {
                links: this.links,
                backlinks: this.backlinks,
                githubLinks: this.githubLinks,
                jiraLinks: this.jiraLinks,
                linearLinks: this.linearLinks,
                sourceMeta: this.sourceMeta,
            },
            onClose: () => {
                this.linksOpen = false;
                this.$emit('close');
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.jira-clip-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: default;

    &__icon {
        flex-shrink: 0;
    }

    &:hover,
    &.active {
        background: $blueGrey500-16;
    }
}
</style>
