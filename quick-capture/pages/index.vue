<template>
    <div class="quick-capture-wrapper" ref="wrapper">
        <EntityPicker
            :value="QCData"
            :is-empty="isEmpty"
            :is-mac="isMac"
            @input="onInput"
            @resize="resize"
            @close="closeCapture('Button')"
            @accept="onEnter('Button')"
            @update:type="onTypeUpdated"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SafeElectronWindow } from '~/@types';
import EntityPicker from '~/components/EntityPicker.vue';
import { CaptureTypes } from '~/constants';
import { throttle } from '~/helpers/throttle';

export default Vue.extend({
    name: 'IndexPage',
    components: { EntityPicker },
    data() {
        return {
            QCData: {
                type: CaptureTypes.MY_DAY,
                text: '',
                title: null,
                html: '',
            },
            isEmpty: true,
            resizeObserver: null,
            throttledByFps: throttle(requestAnimationFrame),
        };
    },
    computed: {
        isMac() {
            return (window as SafeElectronWindow).electron.isMac();
        },
    },
    mounted() {
        window.addEventListener('keydown', this.keyDown);
        (window as SafeElectronWindow).electron.on('window-show', () => {
            this.resize();
        });
        this.resetState();
        this.resizeObserver = new ResizeObserver(this.resizeListener) as any;
        if (this.$refs.wrapper) {
            (this.resizeObserver as any)!.observe(this.$refs.wrapper);
        }
        this.$nextTick(() => {
            this.resizeListener();
        });
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.keyDown);
        if (this.resizeObserver) {
            (this.resizeObserver as any)!.disconnect();
        }
    },
    methods: {
        resizeListener() {
            this.throttledByFps(() => {
                this.resize();
            });
        },
        resetState() {
            this.QCData = {
                type: this.QCData.type ?? CaptureTypes.MY_DAY,
                text: '',
                title: null,
                html: '',
            };
            this.isEmpty = true;
            this.resize();
        },
        onTypeUpdated(newType: CaptureTypes) {
            this.QCData.type = newType;
        },
        keyDown(key: KeyboardEvent) {
            if (key.code === 'Escape') {
                this.closeCapture('Esc Key');
            }
            if (key.code === 'Enter' && (key.metaKey || key.ctrlKey)) {
                key.preventDefault();
                key.stopPropagation();
                this.onEnter('Shortcut');
            }
            if (key.key === '1' && (key.metaKey || key.ctrlKey)) {
                this.onTypeUpdated(CaptureTypes.MY_DAY);
                (window as SafeElectronWindow).electron.trackEvent(
                    'Quick Capture',
                    {
                        action: 'Select My Day',
                        source: 'Shortcut',
                    },
                );
            }
            if (key.key === '2' && (key.metaKey || key.ctrlKey)) {
                this.onTypeUpdated(CaptureTypes.PAGE);
                (window as SafeElectronWindow).electron.trackEvent(
                    'Quick Capture',
                    {
                        action: 'Select Page',
                        source: 'Shortcut',
                    },
                );
            }
        },
        onEnter(source: string) {
            const data = this.QCData;
            if (!this.isEmpty) {
                if (data.type === CaptureTypes.MY_DAY) {
                    (window as SafeElectronWindow).electron.appendToDailyDoc(
                        data.html,
                    );

                    (window as SafeElectronWindow).electron.trackEvent(
                        'Quick Capture',
                        {
                            action: 'Capture My Day',
                            source,
                        },
                    );
                } else if (data.type === CaptureTypes.PAGE) {
                    (window as SafeElectronWindow).electron.addPage(data);

                    (window as SafeElectronWindow).electron.trackEvent(
                        'Quick Capture',
                        {
                            action: 'Capture Page',
                            source,
                        },
                    );
                }
            }
            this.closeCapture();
        },
        onInput(event: any, isEmpty: boolean) {
            this.QCData = { ...this.QCData, ...event };
            this.isEmpty = isEmpty;
        },
        closeCapture(source?: string) {
            this.resetState();
            this.$nextTick(() => {
                (window as SafeElectronWindow).electron.close(source);
            });
        },
        resize() {
            // @ts-ignore
            (window as SafeElectronWindow).electron.resize(
                // @ts-ignore
                this.$refs.wrapper?.clientHeight ?? 235,
            );
        },
    },
});
</script>
<style lang="scss" scoped>
.quick-capture-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
