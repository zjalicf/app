<template>
    <vue-final-modal
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :click-to-close="true"
        :esc-to-close="!$shortcutsManager.isRecording"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '750px',
            width: '100%',
            'max-height': '615px',
            height: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        name="settings-modal"
        v-on="$listeners"
    >
        <div class="settings-modal">
            <SettingsModalSidebar
                :active-tab="tab"
                @tab:change="handleTabChange"
            />
            <SettingsModalBody :active-tab="tab" />
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    EditorNarrowIcon,
    EditorWideIcon,
    VaultIcon,
} from '~/components/icons';
import SettingsModalSidebar from '~/components/modal/SettingsModal/SettingsModalSidebar.vue';
import SettingsModalBody from '~/components/modal/SettingsModal/SettingsModalBody.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    components: {
        SettingsModalBody,
        SettingsModalSidebar,
        VaultIcon,
        EditorNarrowIcon,
        EditorWideIcon,
    },
    name: 'SettingsModal',
})
export default class SettingsModal extends Vue {
    @Prop({
        default: 'myAccount',
    })
    openTab!: string;

    tab: string = 'myAccount';

    handleTabChange(tab: string) {
        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.SWITCH_TAB,
            // @ts-ignore
            sourceMeta: tab,
        });
        this.tab = tab;
    }

    mounted() {
        const query = this.$route.query;
        if (query.context) {
            // @ts-ignore
            this.tab = query.context;
        } else {
            this.tab = this.openTab;
        }
        this.$nuxt.$on('settings:tab', (tab: string) => {
            this.tab = tab;
        });
        this.$tracking.trackEvent('open settings');
    }
}
</script>

<style scoped lang="scss">
.settings-modal {
    @include modal;
    background: var(--settings-modal-bg-color);
    height: 100%;
    display: grid;
    grid-template-columns: 200px auto;
    grid-template-rows: 1fr;
}
</style>
