<template>
    <div class="github-repository-selector-repo-picker">
        <div class="github-repository-selector-repo-picker__search">
            <input
                ref="input"
                v-model="search"
                type="text"
                placeholder="Search repositories"
            />
        </div>
        <div
            v-if="selectedRepositoriesWithData.length"
            class="github-repository-selector-repo-picker__selected"
        >
            <div
                class="github-repository-selector-repo-picker__selected__title"
            >
                Selected
            </div>
            <GithubRepositoryComponent
                v-for="repo in selectedRepositoriesWithData"
                :key="repo.id"
                :repository="repo"
                :selected="selectedRepositories.includes(repo.id)"
                @change="selectRepository(repo.id, $event)"
            />
        </div>
        <GithubRepositoryComponent
            v-for="repo in unselectedRepositories"
            :key="repo.id"
            :repository="repo"
            :selected="selectedRepositories.includes(repo.id)"
            @change="selectRepository(repo.id, $event)"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    GithubOrganization,
    GithubRepository,
} from '~/components/github/github';
import GithubRepositoryComponent from '~/components/github/GithubRepository.vue';
import AcreomChevronLeft from '~/components/icons/AcreomChevronLeft.vue';
import CInput from '~/components/CInput.vue';

@Component({
    name: 'GithubRepositorySelectorModalRepositoryPicker',
    components: {
        CInput,
        AcreomChevronLeft,
        GithubRepositoryComponent,
    },
})
export default class GithubRepositorySelectorModalRepositoryPicker extends Vue {
    @Prop({ required: true })
    organizations!: (GithubOrganization & { label: string })[];

    @Prop({ required: true })
    repositories!: GithubRepository[];

    @Prop({ required: true })
    selectedOrganization!: string | null;

    @Prop({ required: true })
    selectedRepositories!: string[];

    $refs!: {
        input: HTMLInputElement;
    };

    search: string = '';

    get repositoriesByOrg() {
        const logins = this.organizations.map(o => o.login);

        if (this.selectedOrganization === 'other') {
            return this.repositories.filter(
                r => !logins.includes(r.owner.login),
            );
        }

        return this.repositories.filter(
            r => r.owner.login === this.selectedOrganization,
        );
    }

    get selectedRepositoriesWithData() {
        return this.repositoriesByOrg.filter(r =>
            this.selectedRepositories.includes(r.id),
        );
    }

    get unselectedRepositories() {
        return this.repositoriesByOrg
            .filter(r => !this.selectedRepositories.includes(r.id))
            .filter(r =>
                r.name.toLowerCase().includes(this.search.toLowerCase()),
            );
    }

    selectRepository(repositoryId: string, value: boolean) {
        if (value) {
            this.$emit('select-repositories', [
                ...this.selectedRepositories,
                repositoryId,
            ]);
        } else {
            this.$emit(
                'select-repositories',
                this.selectedRepositories.filter(id => id !== repositoryId),
            );
        }
    }

    mounted() {
        this.$nextTick(() => {
            this.$refs.input?.focus({ preventScroll: true });
        });
    }
}
</script>
<style lang="scss" scoped>
.github-repository-selector-repo-picker {
    padding-top: 32px;

    &__header {
        @include font14-600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--settings-modal-title-color);

        button {
            padding: 8px;
            border-radius: 6px;
            &:hover {
                background: var(--tab-controls-bg-color__hover);
            }
        }
    }
    &__search {
        margin: 0px 0px 13px;
        padding-bottom: 6px;
        top: 50px;
        left: 13px;
        z-index: 200;
        position: absolute;
        max-width: calc(100% - 32px);
        width: 100%;
        background: var(--jira-panel-header-bg-color);
        -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
        backdrop-filter: blur(12px); /* Chrome and Opera */

        input {
            @include inputMetaStyles;
            @include font12-500;
            display: block;
            width: 100%;
            outline: none;
            background: var(--c-input-bg-color);
            padding: 4px 8px;
            border-radius: 6px;
            z-index: 1;

            &::placeholder {
                color: var(--c-input-placeholder-color);
            }
        }
    }

    &__selected {
        padding-bottom: 8px;
        margin-bottom: 9px;
        &__title {
            @include font12-600;
            color: var(--settings-modal-title-color);
            margin-bottom: 4px;
        }
        border-bottom: 1px solid var(--tab-divider-color);
    }
}
</style>
