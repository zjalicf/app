<template>
    <div class="github-entity-link" @click="open">
        <div class="github-entity-link__icon">
            <GithubEntityIcon :entity="entity" />
        </div>
        <div class="github-entity-link__title">
            <span class="github-entity-link__repository">
                {{ $entities.github.getRepositoryName(entity) }}
            </span>
            {{ entity.title }}
            <span class="github-entity-link__number">#{{ entity.number }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'GithubEntityLink',
    components: { GithubEntityIcon },
})
export default class GithubEntityLink extends Vue {
    @Prop({ required: true })
    id!: string;

    get entity() {
        return this.$entities.github.getById(this.id);
    }

    open() {
        this.$dropdown.hideAll();
        this.$vfm.hideAll();
        if (!this.entity) return;
        this.$entities.github.openModal(
            this.entity,
            TrackingActionSource.BACKLINK_DROPDOWN,
        );
    }
}
</script>
<style lang="scss" scoped>
.github-entity-link {
    @include font12-500;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--document-link-text-color);
    gap: 6px;

    &__title {
        @include ellipsis;
    }

    &:hover {
        color: var(--document-link-text-color_hover);
        background: var(--document-link-bg-color_hover);
    }

    &__repository {
        color: $blueGrey400;
    }

    &__number {
        color: $blueGrey400;
    }
}
</style>
