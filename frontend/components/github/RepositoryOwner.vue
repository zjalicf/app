<template>
    <div
        class="github-repository-owner"
        :class="{ 'github-repository-owner--text-only': !owner.avatar_url }"
        @click="$emit('click', owner.login)"
    >
        <img
            v-if="owner.avatar_url"
            :src="owner.avatar_url"
            :alt="owner.login"
        />
        <div>{{ owner.label || owner.login }}</div>
        <div class="github-repository-owner__actions">
            {{ count ? `${count} Selected` : null }}
            <AcreomChevronRight size="10" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubUser } from '~/components/github/github';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';

@Component({
    name: 'GithubRepositoryOwner',
    components: { AcreomChevronRight },
})
export default class GithubRepositoryOwner extends Vue {
    @Prop({ required: true })
    owner!: GithubUser & { label?: string };

    @Prop({ default: 0 })
    count!: number;
}
</script>
<style lang="scss" scoped>
.github-repository-owner {
    @include font12-500;
    cursor: default;
    user-select: none;
    display: grid;
    align-items: center;
    grid-template-columns: 20px 1fr max-content;
    gap: 8px;
    padding: 4px 10px;

    &--text-only {
        grid-template-columns: 1fr max-content;
    }

    img {
        border-radius: 4px;
    }

    &__actions {
        @include font12-500;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
        color: $blueGrey500;
    }

    &:hover {
        background-color: var(--github-repository-owner-bg-color__hover);
        border-radius: 6px;
    }
}
</style>
