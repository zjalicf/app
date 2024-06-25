<template>
    <div class="jira-title">
        <div class="jira-title--header">
            <div class="jira-title--header--title">
                <pre ref="text" class="jira-title--header--title--text">{{
                    document.title
                }}</pre>
                <button
                    v-if="!$utils.isMobile"
                    ref="options"
                    tabindex="-1"
                    class="jira-title--header--title--options"
                    :class="{
                        active: dropdownOpen,
                        wrapped: shouldWrapOptions,
                    }"
                    @click.prevent.stop="openMenu"
                >
                    <InterfaceSettingMenuHorizontal />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import JiraLabelPicker from '~/components/integrations/jira/JiraLabelPicker.vue';
import DatePicker from '~/components/date-picker/DatePicker.vue';
import InterfaceSettingMenuHorizontal from '~/components/streamline/InterfaceSettingMenuHorizontal.vue';
import { throttle } from '~/helpers';
import TitleMixin from '~/components/title/TitleMixin.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraTitle',
    components: {
        InterfaceSettingMenuHorizontal,
        DatePicker,
        JiraLabelPicker,
        JiraIcon,
        InterfaceCalendar,
        InterfaceContentFileAlternate,
    },
})
export default class JiraTitle extends TitleMixin {
    $refs!: {
        options: HTMLButtonElement;
        text: HTMLElement;
    };

    datePickerOpen: boolean = false;
    dropdownOpen: boolean = false;
    showDatePicker: boolean = false;
    localDate: any = null;
    shouldWrapOptions: boolean = false;
    titleResizeObserver: any = null;

    throttledByFps = throttle(requestAnimationFrame);

    recalculateOptionsPlacement() {
        if (this.$refs.text?.style) {
            this.$refs.text.style.height = 'auto';
            this.$refs.text.style.height = ''.concat(
                `${this.$refs.text.scrollHeight}`,
                'px',
            );
        }
        const textInput = this.$refs.text;
        const extraElement = this.$refs.options;

        if (!textInput || !extraElement || !textInput.firstChild) return;

        const containerRect = textInput.getBoundingClientRect();
        const text = this.document.title;

        const range = document.createRange();
        range.setStart(textInput.firstChild, text.length);
        range.setEnd(textInput.firstChild, text.length);
        const lastCharRect = range.getBoundingClientRect();

        this.shouldWrapOptions =
            lastCharRect.left - containerRect.left >=
            textInput.clientWidth - 38;

        if (this.shouldWrapOptions) {
            this.$refs.text.style.height = ''.concat(
                `${this.$refs.text.scrollHeight + 40}`,
                'px',
            );
        }

        const left = this.shouldWrapOptions
            ? 0
            : lastCharRect.left - containerRect.left;
        const top = this.shouldWrapOptions
            ? lastCharRect.top - containerRect.top + 40
            : lastCharRect.top - containerRect.top;

        extraElement.style.top = `${top}px`;
        extraElement.style.left = `${left}px`;
    }

    @Watch('text')
    handleValueChange() {
        this.$nextTick(() => {
            this.recalculateOptionsPlacement();
        });
    }

    resizeListener() {
        this.throttledByFps(() => {
            this.recalculateOptionsPlacement();
        });
    }

    beforeDestroy() {
        if (this.titleResizeObserver) {
            this.titleResizeObserver.disconnect();
        }
    }

    get shouldDisplayProperties() {
        return this.showDatePicker || (this.entity && this.entity.start);
    }

    get entity() {
        return (
            this.$store.getters['integrationData/byId'](this.entityId) ??
            this.$store.getters['integrationData/byId'](this.document?.clip) ??
            {}
        );
    }

    openMenu() {
        this.dropdownOpen = true;
        this.$dropdown.show({
            component: () =>
                import('@/components/context-menu/DocumentContextMenu.vue'),
            bind: {
                id: this.document.id,
                invokeFrom: 'header',
                tabId: this.tabId,
                source: TrackingActionSource.PAGE,
            },
            parent: this.$refs.options,
            onClose: () => {
                this.$nextTick(() => {
                    this.$dropdown.hideAll();
                });
                this.dropdownOpen = false;
            },
        });
    }

    change(props: any) {
        this.$store.dispatch('document/update', {
            id: this.document.id,
            labels: props.labels,
        });
    }

    mounted() {
        this.titleResizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.text) {
            this.titleResizeObserver.observe(this.$refs.text);
        }
        this.$nextTick(() => {
            this.resizeListener();
        });
    }
}
</script>

<style lang="scss" scoped>
.jira-title {
    &--header {
        user-select: none;
        border-radius: 12px;

        &--actions {
            display: flex;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            align-items: center;
            justify-content: space-between;

            &--key {
                display: flex;
                align-items: center;
                font-weight: 600;
                color: var(--jira-title-key-color);
            }

            .icon {
                margin-right: 8px;
            }
        }

        &--title {
            color: var(--tab-title-text-color);

            position: relative;
            overflow: hidden;

            &--text {
                @include font-inter;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-wrap: break-word;
                font-style: normal;
                font-weight: 700;
                font-size: 26px;
                line-height: 155.2%;
            }

            &--options {
                color: var(--tab-controls-icon-color);
                position: absolute;
                transform: translateX(10px) translateY(3px);

                padding: 7px;
                border-radius: 6px;

                &.wrapped {
                    transform: translateX(0) translateY(3px);
                }

                &:hover,
                &.active {
                    color: var(--tab-controls-icon-color__hover);
                    background: var(--tab-controls-bg-color__hover);
                }
            }
        }
    }
}
</style>
