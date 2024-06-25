<template>
    <div class="sidebar-settings">
        <div class="sidebar-settings__title">Sidebar</div>
        <div class="sidebar-settings__description">
            Reorder Views in Sidebar
        </div>
        <SidebarSettingsSortable />
        <div class="sidebar-settings__section">
            <label
                v-if="$config.platform !== 'mobile'"
                class="sidebar-settings__show-pages"
            >
                <div class="sidebar-settings__show-pages__title">
                    Hide Pages In Sidebar With
                </div>
                <div class="sidebar-settings__show-pages__select">
                    <ASelect
                        :items="options"
                        :multi="true"
                        :show-arrow="false"
                        :value="selectedOptions"
                        :width="150"
                        :placeholder="'Select Pages To Hide'"
                        :search="true"
                        :emit-on-close="true"
                        :clear="true"
                        @change="updateSelectedTypes"
                        @close="onClose"
                    />
                </div>
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { tr } from 'date-fns/locale';
import SidebarSettingsSortable from '~/components/modal/SettingsModal/Sidebar/SidebarSettingsSortable.vue';
import CSwitch from '~/components/CSwitch.vue';
import ASelect from '~/components/ASelect.vue';
import { SidebarTypes } from '~/constants';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'SidebarSettings',
    computed: {
        tr() {
            return tr;
        },
    },
    components: { ASelect, CSwitch, SidebarSettingsSortable },
})
export default class SidebarSettings extends Vue {
    options = [
        { label: 'Status', id: SidebarTypes.STATUS },
        { label: 'Date', id: SidebarTypes.DATE },
        { label: 'Clip', id: SidebarTypes.CLIP },
    ];

    selectedTypes: string[] = [];

    get selectedOptions() {
        return (
            this.$store.getters['vaultSettings/sidebarOptions']?.hideTypes ?? []
        );
    }

    updateSelectedTypes(value: string[]) {
        this.selectedTypes = value;
    }

    onClose() {
        const hidden = this.selectedTypes.filter(
            x => !this.selectedOptions.includes(x),
        );
        const shown = this.selectedOptions.filter(
            (x: string) => !this.selectedTypes.includes(x),
        );
        this.$store.dispatch('vaultSettings/updateSidebarOptions', {
            hideTypes: this.selectedTypes,
        });
        hidden.forEach((type: string) => {
            this.$tracking.trackEventV2(TrackingType.SETTINGS, {
                action: TrackingAction.HIDE_PAGES_IN_SIDEBAR,
                // @ts-ignore
                sourceMeta: type,
            });
            this.$tracking.trackEvent('sidebar-hide', {
                type,
            });
        });
        shown.forEach((type: string) => {
            this.$tracking.trackEvent('sidebar-show', {
                type,
            });
        });
    }
}
</script>
<style lang="scss" scoped>
.sidebar-settings {
    padding: 30px;

    &__description {
        @include font12-500;
        margin-top: 4px;
        color: var(--settings-modal-option-description-color);
        margin-bottom: 12px;
    }

    &__title {
        @include font14-600;
        color: var(--settings-modal-title-color);
    }

    &__section {
        margin-top: 20px;
    }

    &__show-pages {
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__title {
            @include font12-600;
        }
    }
}
</style>
