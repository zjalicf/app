<template>
    <div class="footer" :class="{ selector: selectorVisible }">
        <div class="divider"></div>
        <div class="actions-wrapper">
            <div class="actions-wrapper__left">
                <Header
                    :is-mac="isMac"
                    :header-data="headerData"
                    @update-type="$emit('update-type', $event)"
                    @select:show="onSelectShown"
                    @select:hide="onSelectHidden"
                />
                <button
                    class="actions-wrapper__left__new-task"
                    @mouseenter="setNewTaskHovered(true)"
                    @mouseleave="setNewTaskHovered(false)"
                    @click="onNewTask"
                >
                    <span
                        class="tooltip task"
                        :class="{ show: newTaskHovered }"
                    >
                        <p>Type [] in new line to create a task</p>
                    </span>
                    <CheckSquare />
                </button>
            </div>
            <div class="actions">
                <button
                    class="cancel"
                    @click="$emit('close')"
                    @mouseenter="setExitHovered(true)"
                    @mouseleave="setExitHovered(false)"
                >
                    <span class="tooltip cancel" :class="{ show: exitHovered }">
                        <p>Cancel <span class="key">Esc</span></p>
                    </span>
                    Cancel
                </button>
                <button
                    class="capture"
                    @click="$emit('accept')"
                    @mouseenter="setButtonHovered(true)"
                    @mouseleave="setButtonHovered(false)"
                >
                    <span
                        class="tooltip capture"
                        :class="{ show: buttonHovered }"
                    >
                        <p>
                            Capture
                            <span class="keys">
                                <span class="key">{{ cmdOrCtrl }}</span>
                                <span class="key">Enter</span>
                            </span>
                        </p>
                    </span>
                    Capture
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import { CaptureTypes } from '~/constants';
import CheckSquare from '~/components/icons/CheckSquare.vue';

export default Vue.extend({
    name: 'Footer',
    components: { CheckSquare },
    props: {
        headerData: {
            type: Object,
            default: () => ({
                type: CaptureTypes.MY_DAY,
                isEmpty: true,
            }),
        },
        isMac: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            buttonHovered: false,
            switchHovered: false,
            exitHovered: false,
            selectorVisible: false,
            newTaskHovered: false,
        };
    },
    computed: {
        cmdOrCtrl() {
            if (this.isMac) {
                return '⌘';
            }
            return 'Ctrl';
        },
    },
    watch: {},
    mounted() {},
    methods: {
        setButtonHovered(value) {
            this.buttonHovered = value;
        },
        setExitHovered(value) {
            this.exitHovered = value;
        },
        setNewTaskHovered(value) {
            this.newTaskHovered = value;
        },
        onSelectShown() {
            this.selectorVisible = true;
        },
        onSelectHidden() {
            this.selectorVisible = false;
        },
        onNewTask() {
            this.$nuxt.$emit('new-task');
        },
    },
});
</script>

<style lang="scss">
.key {
    color: $blueGrey50;
    height: 16px;
    background: $blueGrey700;
    border-radius: 3px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;

    font-size: 9.7px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    letter-spacing: 0.291px;
}

.divider {
    width: 100%;
    margin: 0 0 15px;
    height: 1px;
    background: $blueGrey800;
}

.footer {
    width: 100%;
    padding: 0 0 15px;

    &:not(.selector) {
        @include drag;
    }

    &.selector {
        @include noDrag;
    }
}

.divider {
    background: $blueGrey800;
    height: 1px;
    margin: 0 auto 12px;
}

.actions-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;

    p {
        cursor: default;
        user-select: none;
        color: $blueGrey600;
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
    }

    label {
        @include noDrag;
        display: flex;
        align-items: center;
        gap: 6px;
        position: relative;
        color: $blueGrey400;

        font-style: normal;
        font-weight: 500;
        font-size: 0.8835rem;
        line-height: 18px;
        letter-spacing: -0.01em;
    }

    &__left {
        @include noDrag;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        &__new-task {
            position: relative;
            padding: 7px;
            border-radius: 6px;
            color: $blueGrey400;
            background: $blueGrey500-16;

            &:hover {
                color: $white;
                background: $blueGrey500-32;
            }
        }
    }
}

.actions {
    @include noDrag;
    display: flex;
    justify-content: flex-end;
    gap: 6px;

    button {
        border-radius: 6px;
        padding: 7px 16px;
        font-weight: 600;
        font-size: 13px;
        line-height: 20px;

        &.cancel {
            color: $white;
            background: $blueGrey700;
            position: relative;

            &:hover {
                background: $blueGrey600;
            }
        }

        &.capture {
            color: $blueGrey700;
            background: $blueGrey50;
            position: relative;

            &:hover {
                background: $white;

                .tooltip {
                    visibility: visible;
                }
            }
        }
    }
}

.tooltip {
    visibility: hidden;
    background-color: black;
    color: #fff;
    text-align: center;
    padding: 5px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    bottom: 35px;
    right: 50%;
    transform: translateX(50%);

    display: flex;
    flex-direction: column;

    box-shadow: 0px 0.38741591572761536px 0px 0px rgba(0, 0, 0, 0.05),
        0px 0.9310142993927002px 0px 0px rgba(0, 0, 0, 0.07),
        0px 1.7530173063278198px 0.5364286303520203px 0px rgba(0, 0, 0, 0.08),
        0px 3.1270833015441895px 3.2195169925689697px 0px rgba(0, 0, 0, 0.09),
        0px 5.848865509033203px 9.389363288879395px 0px rgba(0, 0, 0, 0.1),
        0px 14px 27px 0px rgba(0, 0, 0, 0.14);

    p {
        display: flex;
        width: 100%;
        justify-content: space-between;
        gap: 4px;

        font-size: 12.37px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px;
        letter-spacing: -0.124px;
    }

    &.show {
        visibility: visible;
    }

    &.task {
        min-width: 210px;
    }

    &.capture {
        transform: translateX(30%);
    }
}
</style>
