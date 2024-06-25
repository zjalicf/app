<template>
    <node-view-wrapper
        :id="attrs.id"
        ref="wrapper"
        as="div"
        class="task-item-content"
        :class="{
            'cursor-over': dateDropdownOpen,
        }"
    >
        <div class="task-item-content__check" contenteditable="false">
            <TaskCheckbox
                :checked="isCompleted"
                @checked="onCompleted(!attrs.completed)"
            />
        </div>
        <node-view-content
            :id="attrs.id"
            ref="task"
            as="p"
            class="task-item-content__content"
            contenteditable="true"
        />
    </node-view-wrapper>
</template>
<script lang="ts">
import {
    nodeViewProps,
    NodeViewWrapper,
    NodeViewContent,
    NodeViewProps,
} from '@tiptap/vue-2';

import { Vue, Component, Watch } from 'vue-property-decorator';
import { Instance as PopperInstance } from '@popperjs/core';
import TaskCheckbox from '~/components/editor/extensions/task-item/TaskCheckbox.vue';

@Component({
    name: 'TaskItemComponent',
    components: {
        TaskCheckbox,
        NodeViewWrapper,
        NodeViewContent,
    },
    props: nodeViewProps,
})
export default class TaskItemComponent extends Vue {
    node!: NodeViewProps['node'];
    editor!: NodeViewProps['editor'];
    extension!: NodeViewProps['extension'];
    updateAttributes!: NodeViewProps['updateAttributes'];
    popper: PopperInstance | null = null;
    dateDropdownOpen: boolean = false;

    selected: boolean = false;

    $refs!: {
        task: any;
        date: HTMLElement;
        wrapper: HTMLElement;
        content: any;
        dummy: any;
    };

    get classList() {
        return this.$el?.classList;
    }

    @Watch('classList', { immediate: true, deep: true })
    handleClassListChange() {
        if (!this.classList) return;
        this.selected = this.classList.contains('has-focus');
    }

    get attrs() {
        return this.node.attrs;
    }

    get isCompleted() {
        return this.attrs.completed;
    }

    onCompleted(value: boolean) {
        if (value === this.attrs.completed) return;
        this.updateEditorAttributes({
            completed: value,
        });
        this.editor.commands.focus();
    }

    updateEditorAttributes(attrs: Record<string, any>) {
        this.updateAttributes({
            ...this.attrs,
            ...attrs,
        });
    }

    beforeDestroy() {}

    mounted() {}
}
</script>

<style lang="scss">
.inline-task {
    > img.ProseMirror-separator {
        height: 20px !important;
    }
}
</style>
<style scoped lang="scss">
.task-item-content {
    display: grid;
    align-items: baseline;
    width: 100%;
    position: relative;
    grid-template-columns: 26px 1fr max-content;
    padding-left: 2px;

    &.cursor-over,
    &:hover {
        background: var(--task-bg-color__hover);
        border-radius: 8px;

        .task-item-content__date {
            visibility: visible;
        }
    }

    :deep(.task-content-render) {
        @include editorStyling;
        color: red !important;
        line-height: 26px;
    }

    &__hidden {
        @include font-body;
        left: 26px;
        position: absolute;
        min-width: 4px;
        resize: none;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
        line-height: 26px;
        visibility: hidden;
    }

    &__content {
        width: 100%;
        min-width: 4px;
        padding-left: 0;
    }

    &__check {
        transform: translateY(2px);
    }

    &__date {
        visibility: hidden;

        &--is-set {
            visibility: visible;
        }

        position: absolute;
        white-space: nowrap;
        color: var(--accent-color);
        cursor: default;
        line-height: 16px;
        align-items: center;
        transform: translateX(32px) translateY(-3px);

        .icon {
            color: var(--task-icon-color);
        }

        button {
            padding: 6px;
            border-radius: 6px;

            &:hover,
            &.open {
                background: var(--task-bg-color__focused);
            }
        }
    }

    &__mobile-date {
        white-space: nowrap;
        color: var(--task-icon-color);
        border-radius: 50%;

        line-height: 16px;
        align-items: center;
        padding: 6px;
        background: var(--task-bg-color__focused);

        &.has-date {
            color: var(--accent-color);
        }
    }
}
</style>
