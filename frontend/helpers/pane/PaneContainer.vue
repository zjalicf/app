<template>
    <div class="pane-container">
        <div v-for="(pane, index) in api.components" ref="pane" :key="index">
            <component
                :is="pane.component"
                v-if="pane.component"
                v-bind="pane.bind"
                v-on="pane.on"
            ></component>
        </div>
    </div>
</template>

<script>
import { SafeArea } from 'capacitor-plugin-safe-area';
import { CupertinoPane } from './cupertino-pane.js';

const defaultPaneConfig = async (type, os) => {
    const baseSettings = {
        backdrop: true,
        backdropOpacity: 0.4,
        bottomClose: true,
        cssClass: 'mobile-workspace-selector-pane',
        animationType: 'cubic-bezier(.65,0,.35,1)',
        animationDuration: 200,
    };
    if (type === 'picker') {
        return {
            ...baseSettings,
            buttonDestroy: false,
        };
    } else if (type === 'dropdown') {
        return {
            ...baseSettings,
            showDraggable: false,
            buttonDestroy: true,
            bottomClose: true,
            fitHeight: true,
        };
    } else {
        const offsets = await SafeArea.getSafeAreaInsets();
        let offsetTop = offsets.insets.top;
        if (os === 'android') {
            offsetTop = 0;
        }
        return {
            ...baseSettings,
            backdrop: false,
            showDraggable: false,
            buttonDestroy: false,
            fastSwipeClose: false,
            bottomClose: false,
            breaks: {
                top: {
                    enabled: true,
                    height: window.innerHeight - offsetTop,
                },
                middle: { enabled: false, offset: 430 },
                bottom: { enabled: false },
            },
            initialBreak: 'top',
        };
    }
};

export default {
    props: {
        os: {
            type: String,
            require: true,
        },
    },
    data() {
        return {
            removeBackButtonListener: null,
            oldLength: 0,
        };
    },
    watch: {
        async 'api.components'(newValue, oldValue) {
            if (newValue.length === 0) {
                if (
                    this.removeBackButtonListener &&
                    this.removeBackButtonListener.remove
                ) {
                    this.removeBackButtonListener.remove();
                    this.removeBackButtonListener = null;
                }
            }

            if (newValue.length > this.oldLength) {
                if (this.removeBackButtonListener === null) {
                    this.addBackButtonListener();
                }

                const index = newValue.length - 1; // get last and newest dropdown
                const options = this.api.components[index].options;

                const paneOptions = {
                    ...(await defaultPaneConfig(
                        this.api.components[index].type,
                        this.os,
                    )),
                    ...options,
                };

                const pane = new CupertinoPane(
                    this.$refs.pane[index],
                    paneOptions,
                );

                this.api.panes.push(pane);

                pane.on('onBackdropTap', e => {
                    if (options && options.onBackdropTap) {
                        options.onBackdropTap();
                    }
                    e.preventDefault();
                    this.api.hide();
                });

                pane.on('onDidDismiss', () => {
                    if (options && options.onDestroy) {
                        options.onDestroy();
                    }

                    if (!this.api.externalClose) {
                        this.api.hide();
                    } else {
                        this.api.externalClose = false;
                    }
                });

                pane.present({
                    animate: true,
                });

                if (options && options.onShow) {
                    options.onShow();
                }
            }

            this.oldLength = newValue.length;
        },
    },

    methods: {
        async addBackButtonListener() {
            const { App } = await import('@capacitor/app');

            this.removeBackButtonListener = await App.addListener(
                'backButton',
                () => {
                    this.api.hide();
                },
            );
        },
    },
};
</script>
<style lang="scss" scoped>
.pane-container {
    outline: none;
    z-index: 2000;
}
</style>
