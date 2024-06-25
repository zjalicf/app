<template>
    <div class="jira-clip">
        <button
            class="jira-clip__wrapper"
            :class="{ active: showPanel }"
            @click="openIssueModal"
        >
            <IssueType
                class="jira-clip__wrapper__issue-avatar"
                :entity="entity"
            />
            <div class="jira-clip__wrapper__key">
                {{ entity.key }}
            </div>
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
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraIssue',
    components: {
        IssueType,
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
        return (
            this.$store.getters['integrationData/byId'](this.entityId) ??
            this.$store.getters['integrationData/byId'](this.document?.clip) ??
            {}
        );
    }

    get issueType() {
        return this.entity?.properties?.issuetype ?? null;
    }

    openIssueModal() {
        this.$entities.jira.openModal(
            this.entity,
            TrackingActionSource.PAGE_CLIP,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-clip {
    &__wrapper {
        display: grid;
        grid-template-columns: minmax(16px, 1fr) auto;
        align-items: center;
        padding: 5px 8px;
        border-radius: 6px;
        gap: 6px;
        background: var(--jira-clip-bg-color);

        &:hover,
        &.active {
            background: var(--a-select-button-highlight-bg);

            .jira-clip--key {
                color: var(--jira-clip-key-text-color__hover);
            }
        }

        &__issue-avatar {
            img {
                display: block;
            }
        }

        &__key {
            @include font12-500;
            color: var(--jira-clip-key-text-color);
            white-space: nowrap;
        }
    }
}
</style>
