<template>
    <div class="linear-filter">
        <div class="linear-filter__name">Team</div>
        <div class="linear-filter__operation">is</div>
        <div
            ref="values"
            class="linear-filter__values"
            :class="{ active: active }"
            @click.prevent.stop="openTeamDropdown"
        >
            <div class="linear-filter__values__item--single">
                {{ team.name }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import ASelect from '~/components/ASelect.vue';
import InterfaceArrowsCrossOver from '~/components/streamline/InterfaceArrowsCrossOver.vue';
import ASelectMedia from '~/components/ASelectMedia.vue';

@Component({
    name: 'LinearFilterItem',
    components: { ASelectMedia, InterfaceArrowsCrossOver, ASelect, XIcon },
})
export default class LinearFilterItem extends Vue {
    @Prop({ required: true })
    teamId!: string;

    active = false;
    $refs!: {
        values: HTMLElement;
    };

    get team() {
        return this.$entities.linear.getById(this.teamId);
    }

    openTeamDropdown() {
        this.active = true;
        this.$dropdown.show({
            name: 'linear-team-dropdown',
            parent: this.$refs.values,
            popperOptions: {
                strategy: 'fixed',
                placement: 'bottom-start',
            },
            component: () =>
                import(
                    '~/components/linear/dropdown/LinearTeamDropdown.vue'
                ) as any,
            bind: {
                teamId: this.teamId,
            },
            on: {
                change: (teamId: any) => {
                    if (teamId === this.teamId) return;
                    this.$emit('update', { teamId });
                },
                close: () => {
                    this.$dropdown.hide('linear-team-dropdown');
                },
            },
            onClose: () => {
                this.active = false;
            },
        });
    }
}
</script>
<style lang="scss" scoped>
.linear-filter {
    display: flex;
    align-items: center;
    @include font12-500;
    height: 26px;
    width: fit-content;
    justify-content: space-between;
    color: var(--dropdown-controls-text-color);
    background: var(--dropdown-controls-select-bg-color);
    border-radius: 6px;

    &__name {
        padding: 4px 8px;
        @include font12-500;
    }

    &__operation {
        padding: 4px 8px;
        @include font12-500;
        border-radius: 2px;
    }

    &__values {
        padding: 4px 8px;
        line-height: 18px !important;
        border-radius: 6px;
        //background: var(--dropdown-controls-display-properties-bg-color);

        &:hover,
        &.active {
            background: var(
                --dropdown-controls-display-properties-bg-color__selected__hover
            );
        }

        &__wrapper {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        &__item {
            display: flex;
            align-items: center;

            &--single {
                display: flex;
                align-items: center;
                gap: 4px;
                color: var(--dropdown-controls-placeholder-text-color);
            }
        }
    }
}
</style>
