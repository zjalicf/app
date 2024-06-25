<template>
    <div class="sync-status" @click.prevent.stop="dismiss">
        <div v-if="statusVisible && !dismissed" class="network-status">
            <LoadingIcon
                v-if="syncStatusText === 'Connecting...'"
                size="14"
                class="icon"
            />
            <span
                v-else-if="syncStatusText === 'No connection. Working offline.'"
                class="dot offline"
            ></span>
            <span
                v-else-if="syncStatusText === 'Connected. All changes synced.'"
                class="dot online"
            ></span>
            {{ syncStatusText }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'SyncStatus',
    components: { LoadingIcon },
})
export default class SyncStatus extends Vue {
    get syncStatusText() {
        return this.$store.getters['syncStatus/statusText'];
    }

    get statusVisible() {
        if (
            this.$vfm.openedModals.find(
                (m: any) => m.name === 'encryption-passphrase-modal',
            )
        ) {
            return false;
        }
        return this.$store.getters['syncStatus/visible'];
    }

    get dismissed() {
        return this.$store.getters['syncStatus/dismissed'];
    }

    dismiss() {
        this.$store.commit('syncStatus/setDismissed', true);
    }
}
</script>
<style lang="scss" scoped>
.sync-status {
    position: relative;

    .network-status {
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: -0.24px;
        text-align: center;
        background: var(--mobile-sync-status-bg-color);
        box-shadow: var(--mobile-sync-status-box-shadow);
        border-radius: 33px;
        left: 50%;
        transform: translateX(-50%);
        top: 53px + 4px;
        padding: 7px 13px;
        position: absolute;
        z-index: 101;
        display: flex;
        align-items: center;
        color: var(--mobile-sync-status-text-color);
        white-space: nowrap;

        .icon {
            margin-right: 8px;
            color: var(--mobile-sync-status-icon-color);
            flex-shrink: 0;
        }

        .dot {
            margin-right: 8px;
            width: 8px;
            height: 8px;

            &.online {
                background: #63c756;
            }

            &.offline {
                background: #ff7272;
            }
            border-radius: 50%;
            flex-shrink: 0;
        }
    }
}
</style>
