<template>
    <div class="my-day-scroll-header">
        <div class="my-day-scroll-header--controls">
            <tippy
                :content="$utils.tooltip.getRefText"
                :delay="[300, 20]"
                :offset="`0, 0`"
                :touch="false"
                boundary="window"
                placement="bottom"
                theme="tooltip"
                target=".has-tippy"
            />
            <button
                data-e2e="my-day-previous"
                name="myDayPrevTrigger"
                class="has-tippy"
                tabindex="-1"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts
                            .MY_DAY_PREVIOUS_DAY,
                    )
                "
                @click="$emit('previous')"
            >
                <ChevronLeftIcon size="20" />
            </button>
            <button
                class="has-tippy"
                data-e2e="my-day-next"
                name="myDayNextTrigger"
                tabindex="-1"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.MY_DAY_NEXT_DAY,
                    )
                "
                @click="$emit('next')"
            >
                <ChevronRightIcon size="20" />
            </button>
            <button
                v-show="!isToday"
                data-e2e="my-day-today"
                name="myDayTodayTrigger"
                class="today has-tippy"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.MY_DAY_TODAY,
                    )
                "
                @click="$emit('today')"
            >
                Today
            </button>
        </div>
        <div class="my-day-scroll-header--actions">
            <EntityLinksPill
                v-if="$entities.page.hasLinks(document.id)"
                :links="$entities.page.getLinks(document.id)"
                :backlinks="$entities.page.getBacklinks(document.id)"
                :jira-links="$entities.page.getJiraLinks(document.id)"
                :github-links="$entities.page.getGithubLinks(document.id)"
                :linear-links="$entities.page.getLinearLinks(document.id)"
                :source-meta="TrackingActionSourceMeta.MY_DAY"
            />
            <button
                ref="reviewAnchor"
                class="my-day-scroll-header--actions--action has-tippy"
                data-e2e="task-review-trigger"
                :class="{ 'review-open': reviewOpen }"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts
                            .REVIEW_PANEL_TOGGLE,
                    )
                "
                @click="openReviewDropdownButton"
            >
                <ReviewNotificationIcon
                    :count="reviewTasks.length + reviewPages.length"
                />
            </button>
            <button
                class="my-day-scroll-header--actions--action has-tippy"
                data-e2e="my-day-calendar-trigger"
                :class="{ 'calendar-open': panelOpen }"
                :data-tippy-content="
                    $shortcutsManager.getShortcutTooltipString(
                        $shortcutsManager.availableShortcuts.PANEL_TIMELINE,
                    )
                "
                @click="$emit('toggle-timeline')"
            >
                <InterfaceCalendar class="icon" size="14" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon, ChevronRightIcon } from '@vue-hero-icons/solid';
import { format, isSameDay } from 'date-fns';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import ReviewNotificationIcon from '~/components/overview/ReviewNotificationIcon.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import ReviewDropdown from '~/components/dropdown/ReviewDropdown.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import EntityLinksPill from '~/components/entities/EntityLinksPill.vue';

@Component({
    name: 'MyDayHeaderControls',
    computed: {
        TrackingActionSourceMeta() {
            return TrackingActionSourceMeta;
        },
    },
    components: {
        EntityLinksPill,
        InterfaceCalendar,
        ReviewNotificationIcon,
        InterfaceAlertInformationCircle,
        InterfaceSettingMenuHorizontal,
        ChevronLeftIcon,
        ChevronRightIcon,
    },
})
export default class MyDayHeaderControls extends Vue {
    @Prop({ required: true })
    now!: Date;

    @Prop({ default: () => new Date() })
    overviewDate!: Date;

    @Prop({ required: true })
    panelOpen!: boolean;

    $refs!: {
        reviewAnchor: HTMLButtonElement;
    };

    reviewOpen: boolean = false;

    get document() {
        const document = this.$store.getters['document/byDailyDoc'](
            format(this.overviewDate, 'yyyy-MM-dd'),
        );
        if (!document) return {};
        return document;
    }

    get isToday() {
        return isSameDay(this.now, this.overviewDate);
    }

    get reviewTasks() {
        return this.$store.getters['tasks/review'](this.now);
    }

    get reviewPages() {
        return this.$store.getters['document/review'](this.now);
    }

    toggleReviewDropdown() {
        if (this.reviewOpen) {
            this.closeReviewDropdownShortcut();
        } else {
            this.openReviewDropdownShortcut();
        }
    }

    closeReviewDropdownShortcut() {
        this.$dropdown.hide('review-dropdown');
        this.reviewOpen = false;
    }

    @TrackEvent(TrackingType.MY_DAY, {
        action: TrackingAction.OPEN_OVERDUE,
        source: TrackingActionSource.SHORTCUT,
    })
    openReviewDropdownShortcut() {
        this._openReviewDropdown();
    }

    @TrackEvent(TrackingType.MY_DAY, {
        action: TrackingAction.OPEN_OVERDUE,
        source: TrackingActionSource.BUTTON,
    })
    openReviewDropdownButton() {
        this._openReviewDropdown();
    }

    _openReviewDropdown() {
        this.$nuxt.$emit('editor:blur');
        this.$nuxt.$emit('review-dropdown-open');
        this.$emit('scroll-top');
        this.$nextTick(() => {
            this.reviewOpen = true;
            this.$tracking.trackEvent('review-panel', {
                action: 'open',
            });
            this.$dropdown.show({
                name: 'review-dropdown',
                parent: this.$refs.reviewAnchor,
                component: ReviewDropdown,
                animate: false,
                retainFocus: true,
                backdrop: true,
                popperOptions: {
                    placement: 'bottom',
                    modifiers: [
                        {
                            name: 'preventOverflow',
                            options: {
                                mainAxis: true,
                                padding: 24,
                            },
                        },
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 4],
                            },
                        },
                    ],
                },
                bind: {
                    overviewDate: this.overviewDate,
                    now: this.now,
                },
                on: {},
                onClose: () => {
                    this.reviewOpen = false;
                    this.$tracking.trackEvent('review-panel', {
                        action: 'close',
                    });
                    this.$nextTick(() => {
                        this.$nuxt.$emit('editor:focus');
                    });
                },
            });
        });
    }
}
</script>
<style lang="scss" scoped>
.my-day-scroll-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    padding: 0 15px;

    &--controls {
        display: flex;
        align-items: center;

        button {
            @include font12-500;
            padding: 4px;
            border-radius: 6px;
            color: var(--tab-controls-icon-color);

            &.today {
                @include font12-600;
                color: var(--calendar-header-controls-text-color__today);
                border: 1px solid
                    var(--calendar-header-controls-border-color__today);
                padding: 3px 10px;
                border-radius: 6px;
            }

            &:not(:last-of-type) {
                margin-right: 6px;
            }

            &:hover {
                color: var(--tab-controls-icon-color__hover);
                background: var(--tab-controls-bg-color__hover);
            }
        }
    }

    &--actions {
        display: flex;
        align-items: center;
        gap: 8px;

        &--action {
            padding: 6px;
            border-radius: 50%;
            color: var(--tab-controls-icon-color);
            background: var(--tab-controls-bg-color);

            &:hover,
            &.review-open,
            &.calendar-open {
                color: var(--tab-controls-icon-color__hover);
                background: var(--tab-controls-bg-color__hover);
            }
        }
    }
}
</style>
