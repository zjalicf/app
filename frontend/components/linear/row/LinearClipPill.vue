<template>
    <div
        class="linear-clip-pill has-tippy"
        :data-tippy-content="`<div class='tooltip'>Open ${entity.identifier} ${entity.title}</div>`"
        @click.stop="
            $entities.linear.openModal(
                entity.id,
                TrackingActionSource.PAGE_CLIP,
            )
        "
    >
        <div class="linear-clip-pill__icon">
            <LinearStateIcon :state="entity.state" />
        </div>
        <div class="linear-clip-pill__key">
            {{ entity.identifier }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'LinearClipPill',
    computed: {
        TrackingActionSource() {
            return TrackingActionSource;
        },
    },
    components: { LinearStateIcon },
})
export default class LinearClipPill extends Vue {
    @Prop({ required: true })
    clip!: string;

    get entity() {
        const rawIssue = this.$entities.linear.getById(this.clip);
        if (!rawIssue) return {};
        return this.$entities.linear.deserializeIssue(rawIssue);
    }
}
</script>
<style lang="scss" scoped>
.linear-clip-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;

    &__icon {
        flex-shrink: 0;
    }

    &:hover {
        background: $blueGrey500-16;
    }
}
</style>
