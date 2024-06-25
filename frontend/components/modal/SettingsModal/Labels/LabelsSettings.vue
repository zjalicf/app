<template>
    <div class="labels-settings">
        <div class="labels-settings__title">Labels</div>
        <div class="labels-settings__divider"></div>
        <div class="labels-settings__section">
            <div class="labels-settings__section__header">Manage Labels</div>
            <div class="labels-settings__section__sub-header">
                Edit, merge or delete labels across documents and tasks
            </div>
            <div
                v-if="allLabels.length"
                class="labels-settings__section__labels-wrapper"
            >
                <LabelEditor
                    v-for="label of allLabels"
                    :key="label"
                    :label="label"
                />
            </div>
            <div v-else class="labels-settings__section__empty">
                <p>You have no labels</p>
                <p>Create labels in pages using #</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LabelEditor from '~/components/modal/SettingsModal/Labels/LabelEditor.vue';

@Component({
    name: 'LabelsSettings',
    components: { LabelEditor },
})
export default class LabelsSettings extends Vue {
    get allLabels() {
        return [...this.$store.getters['label/list']].sort((a: any, b: any) =>
            a.localeCompare(b),
        );
    }
}
</script>
<style lang="scss" scoped>
.labels-settings {
    color: $blueGrey50;
    user-select: none;
    cursor: default;
    font-weight: 500;
    font-size: 15px;
    padding: 30px;

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
    }

    &__divider {
        margin: 15px 0 12px;
        height: 1px;
        background: var(--tab-divider-color);
    }

    &__section {
        &__empty {
            @include font12-500;
            color: var(--settings-modal-labels-empty-text-color);
            margin-top: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }

        &__header {
            @include font14-600;
            color: var(--settings-modal-title-color);
        }

        &__sub-header {
            @include font12-500;
            color: var(--settings-modal-option-description-color);
            margin-top: 6px;
            cursor: default;
            margin-bottom: 12px;
        }

        &__labels-wrapper {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
