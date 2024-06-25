<template>
    <div class="page-capture">
        <div class="page-capture--input-wrapper">
            <div class="page-capture--main-input">
                <div class="editor-wrapper">
                    <editor
                        :is-page-editor="isPageCapture"
                        v-model:value="text"
                        @input="onInput"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import Editor from '~/components/editor/Editor.vue';

export default Vue.extend({
    name: 'PageCapture',
    components: {
        Editor,
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        isPageCapture: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            text: '',
        };
    },
    computed: {},
    watch: {
        value(newVal) {
            this.text = newVal;
        },
    },
    mounted() {
        this.text = this.value;
    },
    methods: {
        onInput(val, isEmpty) {
            const { title, text, html, content } = val;
            this.text = html;
            const data = { title, text, html, content };
            this.$emit('input', data, isEmpty);
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

.page-capture {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    border-radius: 12px;
    z-index: 1000000;
    height: 100%;

    &--input-wrapper {
        width: 100%;
        height: 100%;
    }
}
</style>
