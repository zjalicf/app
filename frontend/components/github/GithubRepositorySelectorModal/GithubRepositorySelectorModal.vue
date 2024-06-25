<template>
    <vue-final-modal
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="!initialSync"
        :esc-to-close="!initialSync"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '420px',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        name="github-repository-selector-modal"
        v-on="$listeners"
    >
        <div class="github-repository-picker">
            <div
                v-if="!loading && (hasOrgs || hasRepos) && !selectedOrg"
                class="github-repository-picker__header"
            >
                Select an organization
            </div>
            <div
                v-if="!loading && (hasOrgs || hasRepos) && selectedOrg"
                class="github-repository-picker__header"
            >
                <button @click="selectedOrg = null">
                    <AcreomChevronLeft size="10" />
                </button>
                <img
                    v-if="selectedOrgObject && selectedOrgObject.avatar_url"
                    :src="selectedOrgObject.avatar_url"
                    :alt="selectedOrgObject.name"
                />
                {{
                    selectedOrg === 'other' ? 'Other Repositories' : selectedOrg
                }}
            </div>
            <div ref="body" class="github-repository-picker__body">
                <GithubRepositorySelectorModalLoading v-if="loading" />
                <GithubRepositorySelectorModalEmpty
                    v-else-if="!hasOrgs && !hasRepos"
                />
                <GithubRepositorySelectorModalOrganizationPicker
                    v-else-if="!selectedOrg"
                    :organizations="orgs"
                    :selected-repositories="selectedRepositories"
                    @select="selectedOrg = $event"
                />
                <GithubRepositorySelectorModalRepositoryPicker
                    v-else
                    :organizations="orgs"
                    :repositories="repos"
                    :selected-organization="selectedOrg"
                    :selected-repositories="selectedRepositories"
                    @select-repositories="selectedRepositories = $event"
                />
            </div>
            <div class="github-repository-picker__footer">
                <CButton type="secondary" @click="cancel">Cancel</CButton>
                <CButton
                    type="primary"
                    :disabled="!selectedRepositories.length"
                    @click="save"
                    >Save</CButton
                >
            </div>
        </div>
    </vue-final-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import GithubRepositoryOwner from '~/components/github/RepositoryOwner.vue';
import GithubRepository from '~/components/github/GithubRepository.vue';
import ArrowLeft from '~/components/icons/ArrowLeft.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import CButton from '~/components/CButton.vue';
import GithubRepositorySelectorModalLoading from '~/components/github/GithubRepositorySelectorModal/GithubRepositorySelectorModalLoading.vue';
import GithubRepositorySelectorModalEmpty from '~/components/github/GithubRepositorySelectorModal/GithubRepositorySelectorModalEmpty.vue';
import GithubRepositorySelectorModalOrganizationPicker from '~/components/github/GithubRepositorySelectorModal/GithubRepositorySelectorModalOrganizationPicker.vue';
import GithubRepositorySelectorModalRepositoryPicker from '~/components/github/GithubRepositorySelectorModal/GithubRepositorySelectorModalRepositoryPicker.vue';
import AcreomChevronLeft from '~/components/icons/AcreomChevronLeft.vue';

@Component({
    name: 'GithubRepositorySelectorModal',
    components: {
        AcreomChevronLeft,
        GithubRepositorySelectorModalRepositoryPicker,
        GithubRepositorySelectorModalOrganizationPicker,
        GithubRepositorySelectorModalEmpty,
        GithubRepositorySelectorModalLoading,
        CButton,
        LoadingIcon,
        ArrowLeft,
        GithubRepository,
        GithubRepositoryOwner,
    },
})
export default class GithubRepositorySelectorModal extends Vue {
    @Prop({ default: false })
    initialSync!: boolean;

    $refs!: {
        body: HTMLDivElement;
    };

    selectedRepositories: string[] = [];
    selectedOrg: string | null = null;
    search = '';

    @Watch('selectedOrg')
    handleSelectedOrgChanged(): void {
        this.$refs.body.scrollTop = 0;
    }

    get selectedOrgObject() {
        return this.orgs.find(org => org.login === this.selectedOrg);
    }

    get loading() {
        return (
            this.$entities.github.loadingRepositories() ||
            this.$entities.github.loadingOrganizations()
        );
    }

    get repos() {
        return this.$entities.github.getRepositories();
    }

    get hasOrgs() {
        return this.orgs.length > 0;
    }

    get hasRepos() {
        return this.repos.length > 0;
    }

    get orgs() {
        const orgs: any[] = this.$entities.github.getOrganizations();

        if (
            this.repos.some(
                r => r.owner.login === this.$entities.github.myself?.login,
            )
        ) {
            orgs.unshift(this.$entities.github.myself!);
        }

        const orgLogins = orgs.map(o => o.login);

        if (this.repos.some(r => !orgLogins.includes(r.owner.login))) {
            orgs.push({
                id: -1,
                login: 'other',
                avatar_url: '',
                label: 'Other Repositories',
            });
        }

        return orgs;
    }

    async cancel() {
        if (this.initialSync) {
            await this.$entities.github.delete(false);
        }

        this.$vfm.hide('github-repository-selector-modal');
    }

    save() {
        this.$entities.github.setSyncedRepositories(
            this.selectedRepositories,
            this.initialSync,
        );
        this.$vfm.hide('github-repository-selector-modal');
    }

    beforeMount() {
        this.$entities.github.loadUserOrganizations();
        this.$entities.github.loadUserRepositories();
        this.$entities.github.loadUserTeams();
    }

    mounted() {
        const integration = this.$entities.github.getIntegration();

        if (!integration || !Array.isArray(integration.data?.repositories))
            return;

        this.selectedRepositories = [...integration.data.repositories];
    }
}
</script>
<style lang="scss" scoped>
.github-repository-picker {
    position: relative;
    @include modal;
    user-select: none;

    &__header {
        @include font14-600;
        position: absolute;
        top: 0;
        width: 100%;
        border-top-right-radius: 12px;
        border-top-left-radius: 12px;
        color: var(--modal-title-text-color);
        padding: 16px 16px 8px;
        user-select: none;
        background: var(--jira-panel-header-bg-color);
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */
        z-index: 1;
        line-height: 26px;

        display: flex;
        align-items: center;
        gap: 8px;

        button {
            padding: 8px;
            border-radius: 6px;

            &:hover {
                background: var(--tab-controls-bg-color__hover);
            }
        }

        img {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
    }

    &__body {
        @include scrollbar(50px, 52px);
        overflow: auto;
        padding: 50px 16px 52px;
        height: 400px;

        &--loading {
            user-select: none;
            @include font12-500;
            color: var(--modal-text-color);
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            text-align: center;
        }
    }

    &__footer {
        position: absolute;
        bottom: 0;
        padding: 6px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
        background: var(--jira-panel-header-bg-color);
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }
}
</style>
