<template>
    <div class="cm-status-dropdown">
        <button
            class="cm-status-dropdown--button"
            @click="changeStatus('todo')"
        >
            <div class="cm-status-dropdown--left">
                <p class="cm-status-dropdown--text">Todo</p>
            </div>
            <CheckIcon v-if="status === 'todo'" class="right-icon" size="16" />
        </button>
        <button
            class="cm-status-dropdown--button"
            @click="changeStatus('completed')"
        >
            <div class="cm-status-dropdown--left">
                <p class="cm-status-dropdown--text">Completed</p>
            </div>
            <CheckIcon
                v-if="status === 'completed'"
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
    name: 'StatusOptionsDropdown',
    components: {
        CheckIcon,
    },
})
export default class StatusOptionsDropdown extends Vue {
    @Prop()
    task!: ITask;

    get status() {
        return this.$store.getters['tasks/byId'](
            this.task.recurrentId || this.task.id,
        ).completed
            ? 'completed'
            : 'todo';
    }

    changeStatus(newStatus: string) {
        this.$emit('close');
        this.$emit(`change:${newStatus}`);
    }
}
</script>
<style lang="scss" scoped>
.cm-status-dropdown {
    @include frostedGlassBackground;
    @include font12-500;
    width: 140px;
    color: var(--dropdown-context-labels-text-color);
    border-radius: 8px;
    outline: none;
    max-height: 250px;
    overflow-y: overlay;
    padding: 5px 4px;

    &--left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &--text {
        @include ellipsis;
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
