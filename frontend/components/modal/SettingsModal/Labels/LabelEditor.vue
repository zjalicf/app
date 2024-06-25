<template>
    <div
        class="label-editor"
        :class="{ editing }"
        :data-e2e="`label-${value}`"
        @dblclick.stop.prevent="onFocus"
    >
        <span class="label-editor__label">#</span>
        <input
            ref="input"
            v-model="value"
            class="label-editor__title"
            spellcheck="false"
            autocomplete="off"
            @click.prevent.stop
            @focus="onFocused"
            @blur="onBlurred"
            @keydown.esc.stop.prevent="handleEnter"
            @keydown.enter="handleEnter"
        />
        <span v-if="!editing" class="label-editor__count">
            {{ count }} items</span
        >
        <button
            v-if="!editing"
            class="label-editor__remove"
            :data-e2e="`label-delete-${value}`"
            @click.prevent.stop="deleteLabel"
        >
            <InterfaceDeleteBin1 class="icon" size="14" />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import { ILabel } from '~/@types';
import { getLabelName } from '~/plugins/entities/label';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'LabelEditor',
    components: { InterfaceDeleteBin1 },
})
export default class LabelEditor extends Vue {
    @Prop({ required: true })
    label!: ILabel;

    $refs!: {
        input: HTMLElement;
    };

    value: string = '';

    editing: boolean = false;
    initialValue: string = '';

    get count() {
        const labelMap = this.$store.getters['label/labelsMap'];
        return (
            (labelMap[this.label]?.tasks.length ?? 0) +
            (labelMap[this.label]?.pages.length ?? 0)
        );
    }

    onFocus() {
        this.initialValue = this.label.replace('#', '');
        this.$refs.input.focus({ preventScroll: true });
    }

    onFocused() {
        this.editing = true;
    }

    onBlurred() {
        this.editing = false;
        this.$refs.input.blur();
        this.storeLabel();
    }

    handleEnter() {
        this.$refs.input.blur();
    }

    storeLabel() {
        const text = this.$entities.label.normalize(this.value);

        const hasChanged = this.initialValue !== text;
        if (!hasChanged) return;

        const labelAlreadyExists = this.$entities.label.exists(text);

        if (labelAlreadyExists) {
            this.$vfm.show({
                component: () =>
                    import(
                        '~/components/modal/SettingsModal/Labels/LabelsConflictModal.vue'
                    ),
                bind: {
                    oldLabel: getLabelName(this.label),
                    newLabel: getLabelName(text),
                },
                on: {
                    cancel: () => this.onFailedMerge(),
                },
            });
            return;
        }

        this.$entities.label.merge(
            getLabelName(this.label),
            getLabelName(text),
        );
    }

    onFailedMerge() {
        this.value = this.initialValue;
        this.$refs.input.focus({ preventScroll: true });
    }

    deleteLabel() {
        if (!this.count) {
            this.$entities.label.delete(getLabelName(this.label));
            return;
        }

        this.$vfm.show({
            component: () =>
                import(
                    '~/components/modal/SettingsModal/Labels/DeleteLabelModal.vue'
                ),
            bind: {
                label: getLabelName(this.label),
            },
        });
    }

    mounted() {
        this.value = this.label.replace('#', '');
    }
}
</script>
<style lang="scss" scoped>
.label-editor {
    @include font12-500;
    border-radius: 6px;
    background: var(--settings-modal-labels-editor-background);
    box-shadow: var(--settings-modal-labels-editor-box-shadow);
    color: var(--settings-modal-labels-editor-text-color);
    padding: 8px 14px;
    display: grid;
    grid-template-columns: 8px 1fr 53px 14px;
    gap: 6px;
    margin-bottom: 8px;
    cursor: default;

    &.editing {
        grid-template-columns: 8px 1fr;
        padding: 6px 12px;
        border: 2px solid var(--accent-color);
    }

    &:hover {
        background: var(--settings-modal-labels-editor-background__hover);
    }

    &__label {
        color: var(--settings-modal-labels-editor-controls-color-active);
    }

    &__title {
        @include inputMetaStyles;
        outline: none;
        cursor: default;
        pointer-events: none;

        .editing & {
            cursor: text;
            pointer-events: all;
        }
    }

    &__count {
        color: var(--settings-modal-labels-editor-controls-color-inactive);
    }

    &__remove {
        color: var(--settings-modal-labels-editor-controls-color-inactive);

        &:hover {
            color: var(--settings-modal-labels-editor-controls-color-active);
        }
    }
}
</style>
