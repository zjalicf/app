<template>
    <div class="projects-switch">
        <button
            v-for="team of teams"
            :key="team.id"
            class="projects-switch--option"
            :class="{ active: activeTeamId === team.id }"
            @click="update(team.id)"
        >
            <div class="projects-switch--option--left">
                <span>{{ team.name }}</span>
            </div>
            <LoadingIcon
                v-if="isLoading(team.id) && activeTeamId !== team.id"
                size="14"
                class="loading-icon"
            />
            <InterfaceValidationCheck
                v-if="activeTeamId === team.id"
                size="14"
                class="icon"
            />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/solid';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { IntegrationType } from '~/constants';

@Component({
    name: 'LinearTeamSelector',
    components: {
        LoadingIcon,
        JiraIcon,
        InterfaceValidationCheck,
        InterfaceContentArchive,
        InterfaceContentFileAlternate,
        CheckIcon,
    },
})
export default class LinearTeamSelector extends Vue {
    @Prop({ required: true })
    tabId!: string;

    @Prop({
        default: () => {},
    })
    loading!: any;

    isLoading(id: string) {
        return this.loading[id] ?? false;
    }

    get teams() {
        const teams = this.$entities.linear.teams;
        const integration = this.$entities.linear.getIntegration();
        const syncedTeamsIds = integration.data.teams ?? [];
        return teams.filter((team: any) => syncedTeamsIds.includes(team.id));
    }

    get tabData() {
        return this.$entities.tab.getData(this.tabId) ?? {};
    }

    get activeTeamId() {
        return this.tabData?.team?.id ?? null;
    }

    update(id: string | null) {
        this.$emit('update', id);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.projects-switch {
    @include frostedGlassBackground;
    border-radius: 8px;
    padding: 4px;
    z-index: 100;
    width: 204px;

    &--option {
        @include font12-500;
        padding: 7px 7px 7px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--jira-project-switch-option-text-color);
        border-radius: 6px;
        outline: none;
        width: 100%;
        overflow-x: hidden;

        &:hover {
            color: var(--jira-project-switch-option-text-color__hover);
            background: var(--jira-project-switch-option-bg-color__hover);
        }

        &.active {
            color: var(--jira-project-switch-option-text-color__active);
        }

        &--left {
            display: flex;
            align-items: center;
            width: 100%;
            overflow-x: hidden;

            .icon {
                margin-right: 8px;
            }

            span {
                @include ellipsis;
                width: 100%;
                text-align: left;
            }
        }

        .loading-icon {
            flex-shrink: 0;
            color: var(--jira-project-switch-option-loading-color);
        }
    }
}
</style>
