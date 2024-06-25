<template>
    <div
        v-shortkey="shortkeyOptions"
        class="task-review__wrapper"
        :class="{
            'wide-editor': wideEditor,
        }"
        @shortkey="shortkeyHandler"
    >
        <div class="task-review">
            <div ref="taskList" class="task-review__task-list">
                <ReviewEntities
                    :overview-date="overviewDate"
                    :active="isOpen"
                    type="agenda"
                    @scroll="scroll"
                    @last-item="handleUnfocus"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ArrowRightIcon, ChevronRightIcon, XIcon } from '@vue-hero-icons/solid';
import { add, endOfDay, startOfDay } from 'date-fns';
import Task from '@/components/task/Task.vue';
import ReviewEntities from '~/components/overview/ReviewEntities.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';

@Component({
    name: 'TaskReview',
    components: {
        ReviewEntities,
        ArrowRightIcon,
        XIcon,
        Task,
        ChevronRightIcon,
    },
})
export default class TaskReview extends Vue {
    @Prop({ default: true })
    wideEditor!: boolean;

    @Prop({ required: true })
    overviewDate!: Date;

    $refs!: { taskList: HTMLDivElement } & Record<string, Task[]>;
    tomorrow: Date = add(startOfDay(new Date()), { days: 1 });
    mousePriority: boolean = false;
    focused: boolean = false;
    isOpen: boolean = false;

    @Watch('$store.getters.editorFocused')
    handleEditorFocusChange(newValue: boolean) {
        if (newValue) {
            this.isOpen = false;
        }
    }

    @Watch('reviewEntities.length')
    onEntitiesLengthHandler(newValue: number) {
        if (newValue <= 0) {
            if (this.$store.getters.editorFocused) return;
            this.isOpen = false;
            this.$nuxt.$emit('editor:focus');
        }
    }

    get shortkeyOptions() {
        if (
            this.$store.getters.editorFocused ||
            this.$vfm.openedModals.length > 0 ||
            this.$dropdown.dropdownList.length > 0 ||
            this.$vfm.dynamicModals.length > 0 ||
            this.$contextMenu.contextMenu !== null ||
            !this.isOpen
        ) {
            return null;
        }
        return { blur: ['esc'] };
    }

    get range() {
        return {
            start: startOfDay(this.overviewDate),
            end: endOfDay(this.overviewDate),
        };
    }

    blur() {
        this.isOpen = false;
    }

    @TrackEvent(TrackingType.AGENDA, {
        action: TrackingAction.UNFOCUS_AGENDA,
        source: TrackingActionSource.SHORTCUT,
    })
    handleUnfocus() {
        this.isOpen = false;
        this.$nuxt.$emit('editor:focus');
    }

    shortkeyHandler(event: any) {
        switch (event.srcKey) {
            case 'blur':
                if (this.$store.getters.editorFocused) return;
                this.handleUnfocus();
                break;
        }
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
            return;
        }
        this.open();
    }

    scroll(amount: number) {
        const taskList = this.$refs.taskList;
        if (taskList) {
            taskList.scrollTop = amount - 42;
        }
    }

    beforeDestroy() {
        this.$nuxt.$off('review-dropdown-open');
    }

    mounted() {
        this.$nuxt.$on('review-dropdown-open', () => (this.isOpen = false));
    }
}
</script>

<style lang="scss" scoped>
.task-review {
    margin-top: -11px;
    width: 100%;
    background: var(--task-review-bg-color);
    border-radius: 12px;
    padding: 11px 0;

    :deep(.task-list--wrapper--todo--dragarea) {
        padding-bottom: 0px;
    }

    :deep(.task-outer) {
        position: relative;
        padding: 0px;

        .task-outer {
            position: relative;
            padding: 0px;
        }
    }

    &__wrapper {
        margin: 11px 0;
        padding: 0 5px;
        transform-origin: center top;
        transition: transform 0.15s cubic-bezier(0, 0.55, 0.45, 1);

        &.wide-editor {
            transition: padding 0.15s cubic-bezier(0, 0.55, 0.45, 1);
            transform: scale(1);
            padding-left: 15px;
            padding-right: 15px;
        }
    }

    &__header {
        padding: 0px 15px 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;

        &:hover {
            .icon {
                opacity: 1;
                color: var(--agenda-title-color);
            }
        }

        &__title {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
            font-size: 13.12px;
            line-height: 21px;
            color: var(--agenda-title-color);
            border-radius: 12px;

            .icon {
                flex-shrink: 0;
                opacity: 0.2;
                color: var(--agenda-title-color);
            }
        }

        &__control {
            color: var(--task-review-title-controls-icon-color);

            &:hover {
                color: var(--task-review-title-controls-icon-color__hover);
            }
        }
    }

    &__task-list {
        padding: 0 8px;

        &__empty {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--task-review-empty-text-color);
            cursor: default;
        }

        &__timeline {
            padding: 2px 10px 0;
        }
    }
}
</style>
