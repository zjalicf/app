<template>
    <div ref="qc" class="entity-picker">
        <div class="entity-picker--display">
            <PageCapture
                :value="value.html"
                :is-page-capture="type === CaptureTypes.PAGE"
                @input="onInput"
            />
        </div>
        <Footer
            :is-mac="isMac"
            :header-data="headerData"
            @close="$emit('close')"
            @accept="$emit('accept')"
            @update:capture-multiple="$emit('toggle-multiple')"
            @update-type="onTypeChange($event)"
        />
    </div>
</template>

<script>
import Vue from 'vue';
import Editor from '~/components/editor/Editor.vue';
import Footer from '~/components/Footer.vue';
import { CaptureTypes } from '~/constants';

export default Vue.extend({
    name: 'EntityPicker',
    components: {
        Footer,
        Editor,
    },
    props: {
        value: {
            type: Object,
            default: {
                type: CaptureTypes.MY_DAY,
                text: '',
                title: null,
                html: '',
            },
        },
        isEmpty: {
            type: Boolean,
            default: true,
        },
        isMac: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        CaptureTypes() {
            return CaptureTypes;
        },
        text() {
            return this.value.text;
        },
        type() {
            return this.value.type;
        },
        height() {
            return this.$refs.qc?.offsetHeight ?? 0;
        },
        cmdOrCtrl() {
            if (this.isMac) {
                return '⌘';
            }
            return 'Ctrl';
        },
        headerData() {
            return {
                type: this.type,
                isEmpty: this.isEmpty,
            };
        },
    },
    watch: {},
    mounted() {},
    methods: {
        onInput(val, isEmpty) {
            this.$emit('input', val, isEmpty);
        },
        onTypeChange(newType) {
            if (newType === 'new_page') {
                window.electron.trackEvent('Quick Capture', {
                    action: 'Select Page',
                    source: 'Dropdown',
                });
            }

            if (newType === 'my_day') {
                window.electron.trackEvent('Quick Capture', {
                    action: 'Select My Day',
                    source: 'Dropdown',
                });
            }

            this.$emit('update:type', newType);
        },
    },
});
</script>

<style lang="scss">
.editor-wrapper {
    padding: 0;
    overflow: overlay;
    height: 100%;
    max-height: 350px;

    &::-webkit-scrollbar-track {
        cursor: default;
        background-color: none;
    }

    &::-webkit-scrollbar {
        cursor: default;
        width: 6px;
        height: 6px;
        margin-right: 4px;
        background-color: none;
    }

    &::-webkit-scrollbar-thumb {
        cursor: default;
        transition: background 0.15s cubic-bezier(0.83, 0, 0.17, 1),
            color 0.15s cubic-bezier(0.83, 0, 0.17, 1),
            fill 0.15s cubic-bezier(0.83, 0, 0.17, 1),
            box-shadow 0.15s cubic-bezier(0.83, 0, 0.17, 1);
        will-change: background, color, fill, box-shadow;
        background: $blueGrey800;
        min-height: 50px;

        &:hover {
            background: $blueGrey700;
        }
    }
}

.keys {
    display: flex;
    align-items: center;
}

.key {
    color: $blueGrey50;
    height: 16px;
    background: $blueGrey700;
    border-radius: 3px;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;
}

.entity-picker {
    @include drag;
    padding: 12px 15px 0;
    width: 557px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    border-radius: 12px;
    background: $blueGrey950;
    border: 1px solid $blueGrey700;
    z-index: 1000000;
    height: 100%;

    &--display {
        @include noDrag;
        width: 100%;
        height: 100%;
    }
}
</style>
