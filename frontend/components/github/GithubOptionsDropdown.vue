<template>
    <div class="github-options-dropdown">
        <div class="github-options-dropdown__option column">
            <div class="github-options-dropdown__option__title">Sort By</div>
            <div class="github-options-dropdown__option__controls">
                <ASelect
                    :items="sortByOptions"
                    :value="sortBy"
                    :width="150"
                    :dropdown-width="150"
                    check-placement="start"
                    @change="updateSortBy"
                />
                <button @click="updateSortDirection">
                    <InterfaceEditSortAscending
                        v-if="sortDirection === 'asc'"
                        size="14"
                    />
                    <InterfaceEditSortDescending
                        v-if="sortDirection === 'desc'"
                        size="14"
                    />
                </button>
            </div>
        </div>
        <hr />
        <div class="github-options-dropdown__option">
            <div class="github-options-dropdown__option__subtitle">
                display properties
            </div>
            <GithubDisplayProperties
                :tab-id="tabId"
                @updateOptions="$emit('updateOptions', $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceEditSortDescending from '~/components/icons/InterfaceEditSortDescending.vue';
import InterfaceEditSortAscending from '~/components/icons/InterfaceEditSortAscending.vue';
import ASelect from '~/components/ASelect.vue';
import { SortingOptions } from '~/constants';
import GithubDisplayProperties from '~/components/github/GithubDisplayProperties.vue';

@Component({
    name: 'GithubOptionsDropdown',
    components: {
        GithubDisplayProperties,
        ASelect,
        InterfaceEditSortAscending,
        InterfaceEditSortDescending,
    },
})
export default class GithubOptionsDropdown extends Vue {
    @Prop({ required: true })
    tabId!: string;

    get tabData() {
        return this.$store.getters['tabs/byId'](this.tabId)?.data;
    }

    get sortBy() {
        return this.tabData.sortBy;
    }

    get sortDirection(): 'asc' | 'desc' {
        return this.tabData.sortDirection;
    }

    get sortByOptions() {
        return [
            {
                id: SortingOptions.TITLE,
                label: 'Title',
            },
            {
                id: SortingOptions.UPDATED_AT,
                label: 'Updated At',
            },
            {
                id: SortingOptions.CREATED_AT,
                label: 'Created At',
            },
        ];
    }

    updateSortBy(sortBy: SortingOptions) {
        this.$emit('updateOptions', {
            sortBy,
        });
    }

    updateSortDirection() {
        this.$emit('updateOptions', {
            sortDirection: this.sortDirection === 'asc' ? 'desc' : 'asc',
        });
    }
}
</script>
<style lang="scss" scoped>
.github-options-dropdown {
    @include frostedGlassBackground;
    padding: 10px;
    border-radius: 12px;
    min-width: 270px;
    max-width: 270px;
    user-select: none;

    hr {
        margin: 10px 0px;
        border-color: var(--tab-divider-color);
    }

    &__option {
        &.column {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
        }

        &__title {
            @include font12-500;
            outline: none;
            width: 100%;
            color: var(--dropdown-controls-text-color);
        }

        &__subtitle {
            @include font10-700;
            padding: 0 0 8px;
            color: var(--dropdown-button-text-color);
            text-transform: uppercase;
        }

        &__controls {
            display: flex;
            align-items: center;
            gap: 4px;

            button {
                padding: 7px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--dropdown-controls-select-bg-color);
                border-radius: 6px;
                outline: none;
                color: var(--dropdown-controls-select-text-color);
                z-index: 11;

                &:hover,
                &.active {
                    background: var(--dropdown-controls-select-bg-color__hover);
                    color: var(--dropdown-controls-select-text-color__hover);
                }
            }
        }
    }
}
</style>
