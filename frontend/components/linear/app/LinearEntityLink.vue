<template>
    <div class="linear-entity-link" @click="open">
        <div class="linear-entity-link__icon">
            <LinearStateIcon :state="entity.state" />
        </div>
        <div class="linear-entity-link__title">
            <span class="linear-entity-link__repository">
                {{ entity.identifier }}
            </span>
            {{ entity.title }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TrackingActionSource } from '~/@types/tracking';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearEntityLink',
    components: { LinearStateIcon },
})
export default class LinearEntityLink extends Vue {
    @Prop({ required: true })
    id!: string;

    get entity() {
        return this.$entities.linear.getIssueById(this.id)!;
    }

    open() {
        this.$dropdown.hideAll();
        this.$vfm.hideAll();
        this.$entities.linear.openModal(
            this.id,
            TrackingActionSource.INFO_PANEL,
        );
    }
}
</script>
<style lang="scss" scoped>
.linear-entity-link {
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

    &__icon {
        flex-shrink: 0;
        img {
            width: 14px;
            height: 14px;
        }
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
