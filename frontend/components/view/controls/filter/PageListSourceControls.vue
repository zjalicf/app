<template>
    <div class="page-list-source">
        Source
        <div class="page-list-source__dropdown">
            <ASelect
                :items="sourceItems"
                :value="sourceValue"
                :width="150"
                :dropdown-width="150"
                check-placement="start"
                @change="changeSourceOption"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { SourceOptions } from '~/constants';
import ASelect from '~/components/ASelect.vue';
import { ViewPropertyDefinition } from '~/components/view/model';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'PageListSourceControls',
    components: {
        ASelect,
    },
})
export default class PageListSourceControls extends Vue {
    @Prop({})
    tabId!: string;

    @Prop({})
    source!: ViewPropertyDefinition;

    get sourceItems() {
        return [
            {
                id: SourceOptions.VAULT,
                label: 'Vault',
            },
            {
                id: SourceOptions.MY_DAY,
                label: 'My Day',
            },
        ];
    }

    get sourceValue() {
        return this.source?.operation === 'isSet'
            ? SourceOptions.MY_DAY
            : SourceOptions.VAULT;
    }

    changeSourceOption(value: SourceOptions) {
        if (value === SourceOptions.VAULT) {
            this.$emit('update', {
                property: 'dailyDoc',
                operation: 'isNotSet',
            });
            this.$tracking.trackEventV2(TrackingType.ALL_PAGES, {
                action: TrackingAction.CHANGE_SOURCE_TO_VAULT,
                source: TrackingActionSource.DROPDOWN,
            });
        }
        if (value === SourceOptions.MY_DAY) {
            this.$emit('update', {
                property: 'dailyDoc',
                operation: 'isSet',
            });
            this.$tracking.trackEventV2(TrackingType.ALL_PAGES, {
                action: TrackingAction.CHANGE_SOURCE_TO_MY_DAY,
                source: TrackingActionSource.DROPDOWN,
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.page-list-source {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);

    button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--dropdown-controls-select-bg-color);
        border-radius: 6px;
        outline: none;
        color: var(--dropdown-controls-select-text);
        z-index: 11;

        &:hover,
        &.active {
            background: var(--dropdown-controls-select-bg-color__hover);
            color: var(--dropdown-controls-select-text-color__hover);
        }
    }

    &__dropdown {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;

        &--order {
            padding: 7px;
        }
    }
}
</style>
