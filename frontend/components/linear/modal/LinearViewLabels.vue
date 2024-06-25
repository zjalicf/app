<template>
    <div class="linear-view-label" @click.prevent.stop="openDropdown">
        <div v-if="!labels.length" class="linear-issue-view__no-label">
            + Add Labels
        </div>
        <div v-else class="linear-view-label__label-wrapper">
            <div
                v-for="label in labels"
                :key="label.id"
                class="linear-view-label__label-wrapper__label"
            >
                <LinearLabelIcon :color="label.color" />
                <div class="linear-view-label__label-wrapper__label__name">
                    {{ label.name }}
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';

@Component({
    name: 'LinearViewLabels',
    components: {
        LinearLabelIcon,
        LinearStateIcon,
    },
})
export default class LinearViewLabels extends Vue {
    @Prop({ required: true })
    teamId!: string;

    @Prop({ required: true })
    labels!: any;

    openDropdown() {
        this.$dropdown.show({
            name: 'linear-label-dropdown',
            parent: this.$el,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearLabelsDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
                labels: this.labels,
            },
            on: {
                change: (labels: any) => {
                    this.$emit('change', labels);
                },
                close: () => {
                    this.$dropdown.hide('linear-label-dropdown');
                },
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-view-label {
    &__label-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: fit-content;

        &__label {
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid rgba(#e0e0e0, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;

            &:hover {
                background: var(--github-checks-summary-background__hover);
            }

            &--color {
                margin-top: 1px;
                height: 8px;
                width: 8px;
                border-radius: 50%;
                background-color: var(--label-color);
            }

            &__name {
                @include font12-500;
            }
        }
    }

    &__no-label {
        @include font12-500;
        padding: 2px 8px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        width: fit-content;
        cursor: pointer;

        &:hover {
            border-radius: 6px;
            background: var(--github-checks-summary-background__hover);
        }
    }
}
</style>
