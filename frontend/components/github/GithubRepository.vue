<template>
    <div class="github-repository" @click="$emit('change', !selected)">
        <ACheck :value="selected" />
        <div class="github-repository__body">
            <div class="github-repository__name">
                {{ repository.owner.login }}/<span>{{ repository.name }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubRepository } from '~/components/github/github';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import ACheck from '~/components/system/ACheck/ACheck.vue';

@Component({
    name: 'GithubRepositoryOwner',
    components: { ACheck, AcreomChevronRight },
})
export default class GithubRepositoryOwner extends Vue {
    @Prop({ required: true })
    repository!: GithubRepository;

    @Prop({ default: false })
    selected!: boolean;
}
</script>
<style lang="scss" scoped>
.github-repository {
    cursor: default;
    padding: 4px;
    display: grid;
    grid-template-columns: 18px 1fr;
    gap: 8px;

    &:hover {
        background: var(--github-repository-owner-bg-color__hover);
        border-radius: 6px;
    }

    &__name {
        @include font12-400;

        span {
            font-weight: bold;
        }
    }

    &__description {
        @include font11-500;
    }
}
</style>
