<template>
    <div class="github-panel" :class="[viewContext]">
        <GithubPullRequestView v-if="isPr" :id="id" @close="$emit('close')" />
        <GithubIssueView v-else :id="id" @close="$emit('close')" />
    </div>
</template>
<script lang="ts">
import { Component, Inject, Provide, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import GithubPullRequestView from '~/components/github/GithubPullRequestView.vue';
import GithubIssueView from '~/components/github/GithubIssueView.vue';
import { isGithubPullRequest } from '~/plugins/entities/github';
import {
    GithubIntegrationDataType,
    GithubSymbols,
} from '~/components/github/github';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';

@Component({
    name: 'GithubPanel',
    methods: { isGithubPullRequest },
    components: { InterfaceDelete1, GithubIssueView, GithubPullRequestView },
})
export default class GithubPanel extends Vue {
    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Provide(GithubSymbols.VIEW_CONTEXT)
    viewContext: string = 'panel';

    get isPr() {
        return this.id.startsWith(GithubIntegrationDataType.PR);
    }

    get id() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data.panelData.id;
    }
}
</script>
<style lang="scss" scoped>
.github-panel {
    @include scrollbar(10px, 10px, 0px);
    overflow-y: auto;
    background: var(--panel-background);
    border-radius: 12px;
    max-height: calc(100% - 6px);
    box-shadow: var(--panel-shadow);
}
</style>
