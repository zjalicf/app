<template>
    <div>
        <div
            v-if="labels.length > 2"
            class="linear-issue-view__label-single"
            :class="{ disabled }"
        >
            {{ labels.length }} labels
        </div>
        <div v-else class="linear-issue-view__label-wrapper">
            <div
                v-for="label in labels"
                :key="label.id"
                class="linear-issue-view__label"
                :class="{ disabled }"
                @click.prevent.stop="$emit('click-label', label)"
            >
                <div
                    class="linear-issue-view__label--color"
                    :style="{ '--label-color': label.color }"
                ></div>
                <div class="linear-issue-view__label--name">
                    {{ label.name }}
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearViewLabels',
    components: {
        LinearStateIcon,
    },
})
export default class LinearViewLabels extends Vue {
    @Prop({ required: true })
    labels!: any;

    @Prop({ default: false })
    disabled!: boolean;
}
</script>
<style lang="scss" scoped>
.linear-issue-view__label-single {
    min-width: fit-content;
    @include font12-500;
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid $blueGrey500-16;
    color: $blueGrey400;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}
.linear-issue-view__label-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: fit-content;

    .linear-issue-view__label {
        padding: 2px 8px;
        border-radius: 12px;
        border: 1px solid $blueGrey500-16;
        color: $blueGrey400;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        &:not(.disabled):hover,
        &.active {
            background: $blueGrey500-16;
        }

        &--color {
            margin-top: 1px;
            height: 8px;
            width: 8px;
            border-radius: 50%;
            background-color: var(--label-color);
        }

        &--name {
            @include font12-500;
            color: $blueGrey400;
        }
    }
}
</style>
