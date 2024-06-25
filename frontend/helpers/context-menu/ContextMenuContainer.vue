<template>
    <div class="context-menu-wrapper">
        <div
            v-if="backdrop"
            class="backdrop"
            @mousedown.prevent="mouseDownHandler"
            @contextmenu.prevent.stop="contextmenuHandler"
        ></div>
        <div
            ref="popper"
            class="context-menu-container"
            :class="{ active: api && api.contextMenu }"
        >
            <component
                :is="api.contextMenu.component"
                v-if="api && api.contextMenu"
                v-bind="api.contextMenu.bind"
                v-on="api && api.contextMenu.on"
                @close="close"
                @contextmenu.native.prevent.stop="close"
            >
                <template #tab-options>
                    <hr v-if="api.contextMenu.bind.invokeFrom !== 'tab'" />
                    <TabContextMenu
                        v-if="api.contextMenu.bind && api.contextMenu.bind.tab"
                        :tab="api.contextMenu.bind.tab"
                        :group="api.contextMenu.bind.group"
                        :invoke-from="api.contextMenu.bind.invokeFrom"
                        @close="close"
                        @contextmenu.native.prevent.stop="close"
                    />
                </template>
                <template #sidebar-options>
                    <hr class="context-menu-container__sidebar-divider" />
                    <button
                        class="context-menu-container__button"
                        @click="openViewSettings"
                    >
                        <InterfaceSettingCog class="icon" size="14" />
                        Sidebar Settings
                    </button>
                </template>
            </component>
        </div>
    </div>
</template>

<script>
import ClickOutside from 'vue-click-outside';
import TabContextMenu from '~/components/context-menu/TabContextMenu.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import { TrackingActionSource } from '~/@types/tracking';

function preventDefault(e) {
    e.preventDefault();
}

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
    window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
            get() {
                supportsPassive = true;
            },
        }),
    );
} catch (e) {}

const wheelOpt = supportsPassive ? { passive: false } : false;
const wheelEvent =
    'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
    document
        .getElementById('app-panel')
        .addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    document
        .getElementById('app-panel')
        .addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    document
        .getElementById('app-panel')
        .addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    document
        .getElementById('app-panel')
        .addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
    document
        .getElementById('app-panel')
        .removeEventListener('DOMMouseScroll', preventDefault, false);
    document
        .getElementById('app-panel')
        .removeEventListener(wheelEvent, preventDefault, wheelOpt);
    document
        .getElementById('app-panel')
        .removeEventListener('touchmove', preventDefault, wheelOpt);
    document
        .getElementById('app-panel')
        .removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

function referenceObject(evt) {
    const left = evt.clientX;
    const top = evt.clientY;
    const right = left + 1;
    const bottom = top + 1;

    function getBoundingClientRect() {
        return {
            width: 0,
            height: 0,
            left,
            top,
            right,
            bottom,
        };
    }

    return {
        getBoundingClientRect,
    };
}

export default {
    components: { InterfaceSettingCog, DropdownButton, TabContextMenu },
    directives: {
        ClickOutside,
    },
    data() {
        return {
            popper: null,
            backdrop: false,
        };
    },
    watch: {
        'api.contextMenu'(newValue, oldValue) {
            if (newValue) {
                if (oldValue) {
                    oldValue.resolve(true);
                }
                disableScroll();
                window.addEventListener('keydown', this.listenForEsc);
                this.$tracking.activityPing('context-menu');
                this.$nextTick(async () => {
                    // const { default: Popper } = await import('popper.js');
                    this.backdrop = true;
                    this.$shortcutsManager.enableNamespace(
                        'context-menu',
                        true,
                    );

                    const { createPopper } = await import('@popperjs/core');
                    this.popper = createPopper(
                        referenceObject(this.api.contextMenu.event),
                        this.$refs.popper,
                        {
                            placement: 'bottom-start',
                            onFirstUpdate: () => {
                                this.$refs.popper.classList.add(
                                    'context-menu-container__visible',
                                );
                            },
                        },
                    );
                });
            }
        },
    },
    methods: {
        mouseDownHandler() {
            this.close();
        },
        contextmenuHandler() {
            if (this.$utils.isMobile) return;
            this.close();
        },
        listenForEsc(event) {
            if (event.key === 'Escape') {
                this.close();
                window.removeEventListener('keydown', this.listenForEsc);
            }
        },
        close() {
            this.$shortcutsManager.disableNamespace('context-menu', true);
            this.$dropdown.hideAll();
            const options = this.api.contextMenu;
            if (this.api.contextMenu) {
                this.api.contextMenu.resolve(true);
            }

            this.api.contextMenu = null;

            enableScroll();

            this.backdrop = false;

            if (this.popper) {
                this.popper.destroy();
                if (options && options.onClose) {
                    options.onClose();
                }
            }
        },
        openViewSettings() {
            this.close();
            this.$utils.navigation.openSettings(
                'sidebar',
                TrackingActionSource.SIDEBAR,
            );
        },
    },
};
</script>
<style lang="scss" scoped>
.context-menu-wrapper {
    .context-menu-container {
        z-index: 1002;

        &[data-popper-placement='top-start'] > div {
            transform-origin: bottom left;
        }

        &[data-popper-placement='top'] > div {
            transform-origin: bottom;
        }

        &[data-popper-placement='top-end'] > div {
            transform-origin: bottom right;
        }

        &[data-popper-placement='bottom-start'] > div {
            transform-origin: top left;
        }

        &[data-popper-placement='bottom'] > div {
            transform-origin: top;
        }

        &[data-popper-placement='bottom-end'] > div {
            transform-origin: top right;
        }

        &[data-popper-placement='left-start'] > div {
            transform-origin: top right;
        }

        &[data-popper-placement='left'] > div {
            transform-origin: right center;
        }

        &[data-popper-placement='left-end'] > div {
            transform-origin: bottom right;
        }

        &[data-popper-placement='right-start'] > div {
            transform-origin: top left;
        }

        &[data-popper-placement='right'] > div {
            transform-origin: left center;
        }

        &[data-popper-placement='right-end'] > div {
            transform-origin: bottom left;
        }

        > div {
            opacity: 0;
            scale: 0.92;
            transition: opacity 0.1s cubic-bezier(0.61, 1, 0.88, 1),
                scale 0.1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        &__visible {
            > div {
                opacity: 1;
                scale: 1;
            }
        }

        &__sidebar-divider:first-child {
            display: none;
        }
    }

    .backdrop {
        z-index: 1002;
        position: absolute;
        width: 100vw;
        height: var(--viewport-height);
        top: 0;
        left: 0;
    }
}
</style>
