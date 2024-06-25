<template>
    <div class="dropdown-wrapper">
        <div v-for="(dropdown, index) in api.dropdownList" :key="index">
            <div
                v-if="dropdown.backdrop"
                class="backdrop"
                data-e2e="dropdown-backdrop"
                @contextmenu.prevent.stop="close(index)"
                @mousedown="close(index, $event)"
            ></div>
            <div
                ref="popper"
                class="dropdown-container"
                aria-expanded="true"
                role="dialog"
                tabindex="-1"
            >
                <transition v-if="dropdown.animate" name="fade-move">
                    <component
                        :is="dropdown.component"
                        v-if="dropdown.component"
                        v-bind="dropdown.bind"
                        v-on="dropdown.on"
                        @close="close(index)"
                    >
                    </component>
                </transition>
                <component
                    :is="dropdown.component"
                    v-else-if="dropdown.component"
                    v-bind="dropdown.bind"
                    v-on="dropdown.on"
                    @close="close(index)"
                >
                </component>
            </div>
        </div>
    </div>
</template>

<script>
const defaultPopperOptions = () => ({
    placement: 'bottom-start',
});

export default {
    data() {
        return {
            lastActiveElement: null,
        };
    },
    watch: {
        'api.dropdownList': {
            handler(newValue, oldValue) {
                if (newValue?.length === 0) {
                    this.$shortcutsManager.disableNamespace('dropdown', true);
                }

                if (newValue?.length < oldValue?.length) {
                    return;
                }
                if (newValue?.length) {
                    if (newValue?.length <= 1) {
                        window.addEventListener('keydown', this.listenForEsc);
                    }
                    const index = newValue.length - 1; // get last and newest dropdown
                    const options = this.api.dropdownList[index];
                    const popperOptions = Object.assign(
                        defaultPopperOptions(),
                        options.popperOptions,
                    );

                    this.$tracking.activityPing('dropdown');

                    this.$nextTick(async () => {
                        this.$shortcutsManager.enableNamespace(
                            'dropdown',
                            true,
                        );

                        const dropdown = this.$refs.popper[index];

                        this.lastActiveElement = options.parent;
                        const { createPopper } = await import('@popperjs/core');
                        const popper = createPopper(options.parent, dropdown, {
                            ...popperOptions,
                            onFirstUpdate: async () => {
                                dropdown.classList.add(
                                    'dropdown-container__visible',
                                );
                            },
                        });

                        if (!options.retainFocus) {
                            dropdown.focus({
                                preventScroll: true,
                            });
                        }

                        this.api.poppers.push(popper);
                    });
                }
            },
            immediate: true,
            deep: false,
        },
    },
    methods: {
        handleMouseDown(index, e) {
            if (this.$utils.isMobile) {
                e.preventDefault();
                return;
            }

            const options = this.api.dropdownList[index];
            if (options && options.preventBackdrop) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        listenForEsc(event) {
            if (event.key === 'Escape') {
                this.close(this.api.poppers.length - 1);
            }
        },
        close(index, e) {
            if (this.$utils.isMobile && e) {
                e.preventDefault();
            }

            const options = this.api.dropdownList[index];
            if (options && options.preventBackdrop && e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const [popper] = this.api.poppers.splice(index, 1);

            if (popper) {
                popper.destroy();
                if (options && options.onClose) {
                    options.onClose();
                }
            }

            if (
                options &&
                !options.retainFocus &&
                this.lastActiveElement &&
                this.lastActiveElement.focus
            ) {
                this.lastActiveElement.focus({
                    preventScroll: true,
                });
                this.lastActiveElement = null;
            }

            this.api.dropdownList = this.api.dropdownList.filter(
                (_opts, idx) => idx !== index,
            );
            if (this.api.dropdownList.length <= 0) {
                window.removeEventListener('keydown', this.listenForEsc);
            }
        },
    },
};
</script>
<style lang="scss">
.fade-long {
    opacity: 1;
}

.fade-long-enter {
    opacity: 0;
}

.fade-long-enter-active {
    transition: opacity 20s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-long-leave-active {
    transition: opacity 20s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-long-leave-to {
    opacity: 0;
}
</style>
<style lang="scss" scoped>
.dropdown-wrapper {
    .dropdown-container {
        outline: none;
        z-index: 2000;

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
    }

    .backdrop {
        z-index: 2000;
        position: absolute;
        width: 100vw;
        height: var(--viewport-height);
        top: 0;
        left: 0;
    }
}
</style>
