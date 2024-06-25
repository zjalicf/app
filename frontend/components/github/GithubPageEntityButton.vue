<template>
    <div class="jira-clip">
        <button
            class="jira-clip--wrapper"
            :class="{ active: showPanel }"
            @click="openIssueModal"
        >
            <GithubEntityIcon :entity="entity" />
            <div class="jira-clip--key">#{{ entity.number }}</div>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Inject, InjectReactive, Vue } from 'vue-property-decorator';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import { TabSymbols } from '~/constants/symbols';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { PANEL_DETACH_WIDTH } from '~/constants';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraIssue',
    components: {
        GithubEntityIcon,
        JiraIcon,
        InterfaceUserCircle,
        InterfaceAdd1,
        DocumentIcon,
        AcreomChevronRight,
    },
})
export default class JiraIssue extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @InjectReactive(TabSymbols.TAB_WIDTH)
    tabWidth!: number;

    get shouldDetachPanel() {
        return this.tabWidth < PANEL_DETACH_WIDTH;
    }

    get showPanel() {
        return this.$tabs.panelOpen(this.tabId);
    }

    get document() {
        return this.$store.getters['document/byId'](this.entityId);
    }

    get entity() {
        const id = this.document?.clip;
        return this.$store.getters['integrationData/byId'](id) ?? {};
    }

    openIssueModal() {
        this.$entities.github.openModal(
            this.entity,
            TrackingActionSource.PAGE_CLIP,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-clip {
    &--wrapper {
        display: grid;
        grid-template-columns: minmax(16px, 1fr) auto;
        padding: 5px 8px;
        border-radius: 6px;
        gap: 6px;
        background: var(--jira-clip-bg-color);
        align-items: center;

        &:hover,
        &.active {
            background: var(--a-select-button-highlight-bg);

            .jira-clip--key {
                color: var(--jira-clip-key-text-color__hover);
            }
        }
    }

    img {
        display: block;
    }

    &--key {
        @include font12-500;
        color: var(--jira-clip-key-text-color);
        white-space: nowrap;
    }
}
</style>
