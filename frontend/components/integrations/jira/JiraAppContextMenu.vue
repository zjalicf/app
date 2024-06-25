<template>
    <div class="jira-context-menu">
        <div v-if="projects.length > 1">
            <div class="jira-context-menu--title">projects</div>
            <button
                v-for="project of projects"
                :key="project.id"
                @click="openProject(project.id)"
            >
                <JiraIcon size="14" class="icon" />
                {{ project.name }}
            </button>
            <hr />
        </div>
        <DropdownButton @click="openJiraSettings">
            <InterfaceSettingCog class="icon" />
            Jira Settings
        </DropdownButton>
        <slot name="sidebar-options" />
        <slot name="tab-options" />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import { IntegrationType, TabType } from '~/constants';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraAppContextMenu',
    components: { InterfaceSettingCog, DropdownButton, JiraIcon },
})
export default class JiraAppContextMenu extends Vue {
    get jiraIntegrations() {
        return this.$store.getters['integration/byType'](IntegrationType.JIRA);
    }

    get projects() {
        return this.jiraIntegrations
            .reduce(
                (acc: any[], { data }: { data: any }) => [
                    ...acc,
                    ...data.projects.filter((project: any) => {
                        return project.syncEnabled;
                    }),
                ],
                [],
            )
            .map((project: any) =>
                this.$store.getters['integrationData/byId'](project.id),
            );
    }

    openProject(id: string) {
        this.$emit('close');
        const activeTab = this.$tabs.activeTab();
        if (activeTab && activeTab.type === TabType.JIRA_APP) {
            const data = {
                project: id,
            };
            this.$store.dispatch('tabs/updateTabData', {
                tabId: activeTab.id,
                data,
            });

            return;
        }

        const tab = this.$tabs.createNewTabObject(v4(), TabType.JIRA_APP, {
            project: id,
        });
        this.$tabs.openTab(tab);
    }

    openJiraSettings() {
        this.$emit('close');
        this.$entities.jira.openSettings(
            TrackingActionSource.JIRA_BENTO_CONTEXT_MENU,
        );
    }
}
</script>

<style lang="scss" scoped>
.jira-context-menu {
    @include contextMenu;
    @include frostedGlassBackground;

    &--title {
        @include font10-700;
        padding: 3px 8px 0;
        color: var(--context-menu-section-title);
        text-transform: uppercase;
    }

    &--button {
        justify-content: flex-start;
        align-items: center;
        width: 100%;

        &.icon {
            margin-right: 13px;
        }
    }
}
</style>
