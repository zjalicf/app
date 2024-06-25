<template>
    <div class="github-repository-selector-orgs-picker">
        <div class="github-repository-selector-orgs-picker__body">
            <GithubRepositoryOwner
                v-for="org in organizations"
                :key="org.id"
                :owner="org"
                :count="getSelectedCountForOwner(org).length"
                @click="$emit('select', $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubOrganization } from '~/components/github/github';
import GithubRepositoryOwner from '~/components/github/RepositoryOwner.vue';

@Component({
    name: 'GithubRepositorySelectorModalOrganizationPicker',
    components: { GithubRepositoryOwner },
})
export default class GithubRepositorySelectorModalOrganizationPicker extends Vue {
    @Prop({ required: true })
    organizations!: (GithubOrganization & { label: string })[];

    @Prop({ required: true })
    selectedRepositories!: string[];

    getSelectedCountForOwner(owner: GithubOrganization & { label: string }) {
        return this.selectedRepositories.filter(id => {
            const repo = this.$entities.github.getRepositoryById(id);

            if (!repo) return false;

            if (owner.login === 'other') {
                const logins = this.organizations.map(o => o.login);
                return !logins.includes(repo.owner.login);
            }

            return repo.owner.login === owner.login;
        });
    }
}
</script>
<style lang="scss" scoped>
.github-repository-selector-orgs-picker {
    &__header {
        @include font14-600;
        color: var(--settings-modal-title-color);
        margin-bottom: 8px;
        line-height: 26px;
    }
}
</style>
