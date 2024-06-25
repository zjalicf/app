<template>
    <div class="linear-controls-dropdown">
        <tippy
            :content="getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="top"
            theme="tooltip"
            target=".has-tippy"
        />
        <div class="linear-controls-dropdown__section">
            <div class="linear-controls-dropdown__section__item">
                <p>Group by</p>
                <LinearGroupByControls
                    :view-id="viewId"
                    @update="$emit('update', $event)"
                />
            </div>
            <div class="linear-controls-dropdown__section__item">
                <p>Sort by</p>
                <LinearSortByControls
                    :view-id="viewId"
                    @update="$emit('update', $event)"
                />
            </div>
        </div>
        <hr />
        <div class="linear-controls-dropdown__section">
            <div class="linear-controls-dropdown__section__title">
                Display Properties
            </div>
            <LinearDisplayProperties
                :view-id="viewId"
                @update="$emit('update', $event)"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ADropDown from '~/components/ADropDown.vue';
import LinearSortByControls from '~/components/linear/controls/LinearSortByControls.vue';
import LinearDisplayProperties from '~/components/linear/controls/LinearDisplayProperties.vue';
import LinearGroupByControls from '~/components/linear/controls/LinearGroupByControls.vue';

@Component({
    name: 'LinearControlsDropdown',
    components: {
        LinearGroupByControls,
        LinearDisplayProperties,
        LinearSortByControls,
        ADropDown,
    },
})
export default class LinearControlsDropdown extends Vue {
    @Prop({ required: true })
    viewId!: string;

    getRefText(reference: any) {
        return reference.getAttribute('data-tippy-content') ?? '';
    }
}
</script>
<style lang="scss" scoped>
.linear-controls-dropdown {
    @include frostedGlassBackground;
    padding: 10px;
    border-radius: 12px;
    min-width: 270px;
    max-width: 270px;
    user-select: none;

    hr {
        margin-bottom: 10px;
        border-color: var(--tab-divider-color);
    }

    &__section {
        &__title {
            @include font10-700;
            padding: 0 0 8px;
            color: var(--dropdown-button-text-color);
            text-transform: uppercase;
        }

        &__item {
            @include font12-500;
            outline: none;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--dropdown-controls-text-color);
            margin-bottom: 10px;
        }
    }
}
</style>
