<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{}"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="conflicts-modal">
            <div class="conflicts-modal--header">
                <div class="conflicts-modal--title">Sync Jira Projects</div>
                <div class="conflicts-modal--subtitle">
                    Select which Jira projects should be synced with acreom.
                </div>
            </div>
            <div class="conflicts-modal--body">
                <ADropDown
                    :items="projects"
                    :value="selectedProjects"
                    :multi="true"
                    :styled="false"
                    :search="true"
                    search-placeholder="Select Projects"
                    width="368"
                    @change="updateSelectedProjects"
                />
            </div>

            <div class="conflicts-modal--footer">
                <div class="conflicts-modal--footer--info"></div>
                <div class="conflicts-modal--footer--actions">
                    <CButton
                        tabindex="0"
                        @click="handleJiraProjectSelect(close)"
                        >Save
                    </CButton>
                    <CButton type="secondary" tabindex="0" @click="close"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';
import CInput from '~/components/CInput.vue';
import ADropDown from '~/components/ADropDown.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { TabType } from '~/constants';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'JiraProjectSelectorModal',
    components: {
        ADropDown,
        CInput,
        CButton,
    },
})
export default class JiraProjectSelectorModal extends Vue {
    @Prop({ required: true })
    integrationId!: any;

    selectedProjects: string[] = [];

    updateSelectedProjects(value: string[]) {
        this.selectedProjects = value;
    }

    get jiraIntegration() {
        return this.$store.getters['integration/byId'](this.integrationId);
    }

    get projects() {
        const data = this.$store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        )
            .filter(
                (project: any) => project.integrationId === this.integrationId,
            )
            .map((project: any) => {
                return {
                    ...project,
                    label: project.name,
                };
            });

        return data;
    }

    confirmEmail: string = '';

    get disabled() {
        return this.confirmEmail !== this.email;
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get email() {
        if (this.user) {
            if (this.user.email) return this.user.email;
            else return this.user.username;
        }

        return '';
    }

    async deleteUser() {
        await this.$store.dispatch('user/delete');
        this.$vfm.hideAll();
    }

    async handleJiraProjectSelect(close: any) {
        const disablingSync = this.projects
            .filter((project: any) => {
                return (
                    !this.selectedProjects.includes(project.id) &&
                    project.syncEnabled
                );
            })
            .map(({ id }: any) => id);

        await this.$tabs.closeTabsByFilter(tab => {
            const isJiraTab = TabType.JIRA_APP === tab.type;
            if (!isJiraTab) return false;
            return disablingSync.includes(tab.data.project);
        });

        const selectedProjects = this.projects.map((project: any) => {
            return {
                id: project.id,
                key: project.key,
                syncEnabled: this.selectedProjects.includes(project.id),
            };
        });

        selectedProjects.map((project: any) =>
            this.$store.dispatch('integrationData/update', project),
        );
        await this.$store.dispatch('integration/save', {
            ...this.jiraIntegration,
            data: {
                ...this.jiraIntegration.data,
                projects: this.projects.map((project: any) => {
                    return {
                        id: project.id,
                        key: project.key,
                        syncEnabled: this.selectedProjects.includes(project.id),
                    };
                }),
            },
        });

        this.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.SELECT_PROJECTS,
        });

        close();
    }

    beforeMount() {
        this.selectedProjects = [
            ...this.projects
                .filter(({ syncEnabled }: any) => syncEnabled)
                .map(({ id }: any) => id),
        ];
    }
}
</script>

<style lang="scss" scoped>
.conflicts-modal {
    @include modal;
    width: 400px;
    cursor: default;
    padding: 16px;
    user-select: none;

    &--title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
    }

    &--subtitle {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 4px;
    }

    &--body {
        @include scrollbar;
        max-height: 300px;
        overflow: auto;

        :deep(.a-dropdown) {
            padding: 0;
        }
    }

    &--footer {
        padding: 12px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &--actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
