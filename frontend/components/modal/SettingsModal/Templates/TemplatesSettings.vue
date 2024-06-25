<template>
    <div class="templates-settings">
        <div class="templates-settings--title">Templates</div>
        <div class="templates-settings--divider"></div>
        <div class="templates-settings--section">
            <div class="templates-settings--section-title">
                <div>Templates</div>
                <div class="templates-settings--description">
                    Use templates for repetitive and boring documents.
                </div>
            </div>
            <button class="templates-settings--button" @click="openTemplates">
                Go to templates
            </button>
        </div>
        <div class="templates-settings--divider"></div>

        <div class="templates-settings--section">
            <div class="templates-settings--section-title">
                <div>My Day Template</div>
                <div class="templates-settings--description">
                    Select template to display in your My Day screen
                </div>
            </div>
            <TemplateDropdown
                :templates="templates"
                :selected-template="selectedTemplate"
                @template:update="handleTemplateChange"
            />
        </div>

        <div class="templates-settings--divider"></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import TemplateDropdown from '~/components/dropdown/TemplateDropdown.vue';
import RuntimeTemplate from '~/components/util/RuntimeTemplate.vue';
import { TabType, ViewType } from '~/constants';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'TemplatesSettingsSettings',
    components: {
        TemplateDropdown,
        RuntimeTemplate,
    },
})
export default class TemplatesSettingsSettings extends Vue {
    get templates() {
        return this.$store.getters['document/templates'] ?? [];
    }

    get selectedTemplate() {
        const selectedTemplateId =
            this.$store.getters['vault/preferences']?.myDayTemplateId ?? null;
        if (!selectedTemplateId) return null;
        const template =
            this.templates.find(
                (template: IDocument) => template.id === selectedTemplateId,
            ) ?? null;
        return template?.id ?? null;
    }

    handleTemplateChange(templateId: string) {
        const vault = this.$store.getters['vault/active'];
        if (!vault) return;
        const newVaultPreferences = { ...vault };
        if (!newVaultPreferences.preferences)
            newVaultPreferences.preferences = {};
        newVaultPreferences.preferences = {
            ...newVaultPreferences.preferences,
            myDayTemplateId: templateId,
        };
        this.$store.dispatch('vault/update', newVaultPreferences);
        this.$store.dispatch('document/updateMyDayTemplates');

        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.SELECT_MY_DAY_TEMPLATE,
        });
    }

    @TrackEvent(TrackingType.TEMPLATE, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.SETTINGS,
    })
    openTemplates() {
        this.$vfm.hideAll();
        this.$entities.view.openTemplates();
    }
}
</script>

<style lang="scss" scoped>
.templates-settings {
    padding: 30px;

    &--divider {
        margin: 15px 0 12px;
        height: 1px;
        background: var(--tab-divider-color);
    }

    &--section {
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &--section-title {
        @include font12-600;
        color: var(--settings-modal-title-color);
    }

    &--description {
        @include font12-500;
        margin-top: 4px;
        color: var(--settings-modal-option-description-color);
    }

    &--button {
        border-radius: 6px;
        padding: 5px 11px;
        @include font12-500;
        color: var(--settings-modal-button-primary-text-color);
        background: var(--settings-modal-button-primary-bg-color);
        outline: none;

        &:hover,
        &.active {
            background: var(--settings-modal-button-primary-bg-color__hover);
            color: var(--settings-modal-button-primary-text-color__hover);
        }

        .icon {
            margin-right: 4px;
        }
    }

    &--dropdown {
        @include font12-500;
        outline: none;
        width: 100%;
        padding: 4px 0;
        color: var(--settings-modal-button-primary-text-color);
    }

    &--title {
        @include font14-600;
        color: var(--settings-modal-title-color);
        margin-bottom: 20px;
    }
}
</style>
