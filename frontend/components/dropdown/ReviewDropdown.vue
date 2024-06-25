<template>
    <div class="review-dropdown">
        <div ref="review-tasklist" class="task-review__wrapper">
            <div class="task-review">
                <div
                    v-if="reviewEntities.length > 0"
                    class="task-review__header"
                >
                    Overdue
                </div>
                <div class="task-review__task-list">
                    <div
                        v-if="reviewEntities.length <= 0"
                        class="task-review__task-list__empty"
                    >
                        <InterfaceTimeRewindAlt class="empty-icon" size="70" />
                        Nothing is overdue. Great job!
                    </div>
                    <div v-else>
                        <ReviewEntities
                            type="review"
                            :active="isOpen"
                            :overview-date="overviewDate"
                            :now="now"
                            @scroll="scroll"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import InterfaceTimeRewindAlt from '~/components/icons/InterfaceTimeRewindAlt.vue';
import ReviewEntities from '~/components/overview/ReviewEntities.vue';

@Component({
    name: 'TaskReviewDropdown',
    components: {
        ReviewEntities,
        InterfaceTimeRewindAlt,
    },
})
export default class TaskReviewDropdown extends Vue {
    $refs!: {
        'review-tasklist': HTMLElement;
        [key: string]: any;
    };

    @Prop({ required: true })
    overviewDate!: Date;

    @Prop({ required: true })
    now!: Date;

    isOpen: boolean = false;

    get reviewEntities() {
        return [
            ...this.$store.getters[`document/review`](this.now),
            ...this.$store.getters['tasks/review'](this.now),
        ];
    }

    scroll(amount: number) {
        const taskList = this.$refs['review-tasklist'];
        if (taskList) {
            // @ts-ignore
            taskList.scrollTop = amount - 100;
        }
    }

    @Watch('reviewEntities.length')
    onEntitiesLengthHandler(newValue: number) {
        if (newValue <= 0) {
            this.$emit('close');
            if (this.$store.getters.editorFocused) return;
            this.$nuxt.$emit('editor:focus');
        }
    }

    mounted() {
        this.$nextTick(() => {
            // hack to activate the 'active' watcher and enable shortcuts on dropdown
            this.isOpen = true;
        });
    }
}
</script>
<style lang="scss" scoped>
.review-dropdown {
    @include scrollbar(3px, 3px);
    @include frostedGlassBackground;
    border-radius: 8px;
    padding: 12px 8px;
    min-width: 380px;
    max-width: 380px;
    overflow-y: overlay;
}

.task-review {
    width: 100%;

    &__wrapper {
        max-height: 500px;
    }

    :deep(.task-outer) {
        position: relative;
        padding: 0px;

        .task-outer {
            position: relative;
            padding: 0px;
        }
    }

    &__header {
        @include ellipsis;
        @include font14-600;
        color: var(--task-review-list-group-header-text-color);
        padding: 0px 8px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;

        &__title {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 10px;
            font-weight: 600;
            font-size: 13.12px;
            line-height: 21px;
            color: var(--task-review-title-text-color);
        }
    }

    &__task-list {
        &__empty {
            @include font12-500;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 29px;
            color: var(--task-review-empty-text-color);
            cursor: default;
            padding: 58px 0 44px;

            .empty-icon {
                color: var(--task-review-empty-icon-color);
            }
        }
    }
}
</style>
