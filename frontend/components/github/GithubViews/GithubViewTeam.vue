<template>
    <div class="github-view-assignee">
        <div class="github-view-assignee__image">
            <img :src="`https://avatars.githubusercontent.com/t/${team.id}`" />
        </div>
        <div class="github-view-assignee__name">
            {{ team.name }}
        </div>
        <div
            style="padding: 2px"
            :data-tippy-content="`<div tabindex='-1' class='tooltip'>Waiting for review</div>`"
            class="has-tippy"
        >
            <GithubStatusPendingIcon
                size="12"
                :style="{ color: 'var(--github-status-pending-color)' }"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubTeam } from '~/components/github/github';
import GithubStatusPendingIcon from '~/components/icons/GithubStatusPendingIcon.vue';

@Component({
    name: 'GithubViewTeam',
    components: { GithubStatusPendingIcon },
})
export default class GithubViewTeam extends Vue {
    @Prop({ required: true })
    team!: GithubTeam;
}
</script>
<style lang="scss" scoped>
.github-view-assignee {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;

    &__image {
        img {
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }
    }

    &__name {
        @include font12-500;
        color: var(--github-property-text-color);
    }
}
</style>
