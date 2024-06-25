<template>
    <label class="page-list-tasks">
        Has Tasks
        <div class="preferences--wrapper-tray--toggle">
            <CSwitch
                id="quick-capture"
                :value="value"
                @input="updateShowUncompleted"
            />
        </div>
    </label>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import CSwitch from '~/components/CSwitch.vue';

@Component({
    name: 'PageListSourceControls',
    components: {
        CSwitch,
    },
})
export default class PageListSourceControls extends Vue {
    @Prop({})
    tabId!: string;

    @Prop()
    value!: boolean;

    tempValue!: boolean;

    @Watch('value', { immediate: true })
    handleValueChange() {
        this.tempValue = this.value;
    }

    updateShowUncompleted(value: boolean) {
        this.$emit('update', value);
        this.tempValue = value;
    }
}
</script>
<style lang="scss" scoped>
.page-list-tasks {
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
