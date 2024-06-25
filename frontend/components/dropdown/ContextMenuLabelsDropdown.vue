<template>
    <div class="cm-label-dropdown">
        <button
            v-for="option of allLabels"
            :key="option.id"
            class="cm-label-dropdown--button"
            @click="handleLabelChange(option.label)"
        >
            <div class="cm-label-dropdown--left">
                <p class="cm-label-dropdown--text">{{ option.label }}</p>
            </div>
            <CheckIcon
                v-if="selected.includes(option.id)"
                class="right-icon"
                size="16"
            />
        </button>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/solid';
import { ITask } from '~/components/task/model';

@Component({
    name: 'ContextMenuLabelsDropdown',
    components: {
        CheckIcon,
    },
})
export default class ContextMenuLabelsDropdown extends Vue {
    @Prop({ required: true })
    allLabels!: any[];

    @Prop()
    task!: ITask;

    get selected() {
        return (
            this.$store.getters['tasks/byId'](
                this.task.recurrentId || this.task.id,
            ).labels ?? []
        );
    }

    handleLabelChange(newSelection: string[]) {
        this.$emit('label:update', newSelection);
    }
}
</script>
<style lang="scss" scoped>
.cm-label-dropdown {
    @include frostedGlassBackground;
    @include scrollbar;
    @include font12-500;
    width: 140px;
    color: var(--dropdown-context-labels-text-color);
    border-radius: 8px;
    outline: none;
    max-height: 250px;
    overflow-y: overlay;
    padding: 5px 4px;

    &--left {
        @include ellipsis;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &--text {
        @include ellipsis;
        width: 100%;
        text-align: left;
    }

    .right-icon {
        color: var(--dropdown-context-labels-icon-color);
        flex-shrink: 0;
    }

    &--button {
        padding: 5px 10px;
        color: var(--dropdown-context-labels-button-color);
        width: 100%;
        justify-content: space-between;
        display: flex;
        align-items: center;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--dropdown-context-labels-button-color__hover);
        }
    }
}
</style>
