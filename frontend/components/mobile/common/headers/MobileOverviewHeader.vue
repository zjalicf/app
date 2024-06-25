<template>
    <div
        class="mobile-documents-header"
        :class="{ 'editor-focused': $store.getters.editorFocused }"
    >
        <div>
            <transition name="fade">
                <div
                    v-if="title.length"
                    class="mobile-documents-header__title"
                    :class="{ past: isPast }"
                >
                    <StarIcon v-if="isToday" class="icon" size="16" />
                    {{ title }}
                </div>
            </transition>
        </div>
        <div class="mobile-documents-header__options">
            <div
                v-if="!$store.getters.editorFocused"
                class="mobile-documents-header__options__navigation"
            >
                <div class="mobile-documents-header__options__today">
                    <button
                        v-if="!$store.getters.editorFocused"
                        ref="reviewToggle"
                        @click="toggleReviewPane"
                    >
                        <InterfaceTimeRewindAlt
                            :notification="hasTasksInReview && !isPast"
                            class="icon"
                            size="20"
                        />
                    </button>
                </div>
                <button
                    class="mobile-documents-header__options__more"
                    @click="$emit('click:previous')"
                >
                    <ChevronLeftIcon class="icon" size="26" />
                </button>
                <button
                    class="mobile-documents-header__options__more"
                    @click="$emit('click:next')"
                >
                    <ChevronRightIcon class="icon" size="26" />
                </button>
            </div>
            <button v-else class="mobile-documents-header__options__done">
                Done
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { ChevronLeftIcon, ChevronRightIcon } from '@vue-hero-icons/outline';
import { animate } from 'motion';
import { add, differenceInDays, startOfDay } from 'date-fns';
import { AcreomChevronDown } from '~/components/icons';
import InterfacePageControllerLoadingHalf from '~/components/streamline/InterfacePageControllerLoadingHalf.vue';
import InterfaceTimeRewindAlt from '~/components/icons/InterfaceTimeRewindAlt.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import StarIcon from '~/components/icons/StarIcon.vue';
import MobileTaskReview from '~/components/mobile/common/my-day/MobileTaskReview.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobileOverviewHeader',
    components: {
        StarIcon,
        InterfaceCalendar,
        InterfaceTimeRewindAlt,
        InterfacePageControllerLoadingHalf,
        ChevronLeftIcon,
        ChevronRightIcon,
        AcreomChevronDown,
    },
})
export default class MobileOverviewHeader extends Vue {
    tomorrow: Date = add(startOfDay(new Date()), { days: 1 });

    @Prop({ default: '' })
    title!: string;

    @Prop({ default: false })
    isToday!: boolean;

    $refs!: {
        reviewToggle: HTMLButtonElement;
    };

    get viewDate() {
        return this.$store.getters['dailyDoc/get']; // "YYYY-MM-DD"
    }

    get document() {
        const document = this.$store.getters['document/byDailyDoc'](
            this.viewDate,
        );
        if (!document) return {};
        return document;
    }

    get overviewDate() {
        return this.$store.getters['dailyDoc/date'];
    }

    get isPast() {
        return (
            differenceInDays(
                startOfDay(new Date()),
                startOfDay(this.overviewDate),
            ) > 0
        );
    }

    async toggleReviewPane() {
        animate(
            '#rewind-arrow',
            {
                transform: ['rotate(360deg)', 'rotate(0)'],
            },
            { duration: 0.5 },
        );

        this.$pane.show({
            component: MobileTaskReview,
            bind: {},
            type: this.hasTasksInReview ? 'picker' : 'dropdown',
            options: {
                fitHeight: !this.hasTasksInReview,
                onBackdropTap: () =>
                    animate(
                        '#rewind-arrow',
                        {
                            transform: ['rotate(-360deg)', 'rotate(0)'],
                        },
                        { duration: 0.5 },
                    ),
            },
        });

        this.$tracking.trackEventV2(TrackingType.MY_DAY, {
            action: TrackingAction.OPEN_OVERDUE,
            source: TrackingActionSource.MOBILE_BUTTON,
        });
    }

    get hasTasksInReview() {
        const now = this.$store.getters['dailyDoc/date'];
        const tasksInReview =
            this.$store.getters['tasks/review'](now).length > 0;
        const pagesInReview =
            this.$store.getters['document/review'](now).length > 0;

        return tasksInReview || pagesInReview;
    }

    @Watch('tasks.length')
    onTasksLenChange(newValue: number, oldValue: number) {
        if (oldValue > 0 && newValue <= 0) {
            setTimeout(
                () =>
                    animate(
                        '#rewind-check',
                        {
                            transform: ['scale(0.5)', 'scale(1.2)', 'scale(1)'],
                        },
                        { duration: 0.5 },
                    ),
                250,
            );
        }
    }
}
</script>
<style lang="scss" scoped>
:deep(#rewind-arrow) {
    transform-origin: center;
}

:deep(#rewind-check) {
    transform-origin: center;
}

.mobile-documents-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 4px 10px 4px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &.editor-focused {
        padding: 8px 16px 8px;
    }

    &__title {
        @include font14-600;
        color: $white;
        display: flex;
        align-items: center;

        .icon {
            margin-right: 6px;
        }

        &.past {
            color: $blueGrey300;
        }
    }

    &__options {
        &__navigation {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        &__today {
            margin-right: 10px;

            button {
                padding: 10px;
                @include animateBackgroundColor;
                color: $blueGrey300;

                &:active {
                    color: $white;
                }
            }
        }

        &__more {
            @include animateBackgroundColor;
            outline: none;
            display: block;
            padding: 9px 10px;
            color: $blueGrey300;

            &:active {
                color: $white;
            }
        }

        &__done {
            @include font12-500;
            color: $blueGrey950;
            border-radius: 12px;
            background: $white;
            padding: 9px 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            outline: none;
        }
    }
}
</style>
