<template>
    <div
        class="github-clip-pill has-tippy"
        :data-tippy-content="`<div class='tooltip'>Open #${entity.number} ${entity.title}</div>`"
        @click.stop="open"
    >
        <div class="github-clip-pill__icon">
            <GithubEntityIcon :entity="entity" />
        </div>
        <div class="github-clip-pill__key">#{{ entity.number }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'GithubClipPill',
    components: { GithubEntityIcon },
})
export default class GithubClipPill extends Vue {
    @Prop({ required: true })
    clip!: string;

    get entity() {
        return this.$entities.github.getById(this.clip);
    }

    open() {
        if (!this.entity) return;

        this.$entities.github.openModal(
            this.entity,
            TrackingActionSource.PAGE_ROW_CLIP,
        );
    }
}
</script>
<style lang="scss" scoped>
.github-clip-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 4px;

    &__icon {
        flex-shrink: 0;
    }

    &:hover {
        background: $blueGrey500-16;
    }
}
</style>
