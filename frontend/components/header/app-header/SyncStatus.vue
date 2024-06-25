<template>
    <div class="sync-status no-drag">
        <tippy
            :content="$utils.tooltip.getRefText"
            :delay="[300, 20]"
            :touch="false"
            boundary="window"
            placement="bottom"
            theme="tooltip"
            target=".has-tippy"
        />
        <component
            :is="resolveIcon"
            size="14"
            class="has-tippy icon"
            :completed="vaultProgress.completed"
            :total="vaultProgress.total"
            :data-tippy-content="syncStatus"
        ></component>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';
import ComputerStorageHardDrive2 from '~/components/streamline/ComputerStorageHardDrive2.vue';
import TippyElement from '~/components/header/app-header/TippyElement.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import { LoadProgressState } from '~/constants';
import ProgrammingCloudCheck from '~/components/streamline/ProgrammingCloudCheck.vue';
import ProgrammingCloudOff from '~/components/streamline/ProgrammingCloudOff.vue';
import TaskListProgress from '~/components/task/TaskListProgress.vue';
import InterfaceSecurityShield4 from '~/components/streamline/InterfaceSecurityShield4.vue';

@Component({
    name: 'SyncStatus',
    components: {
        TippyElement,
    },
})
export default class SyncStatus extends Vue {
    now: Date = new Date();

    get isEncrypted() {
        return !!this.$store.getters['user/user']?.privateKeys;
    }

    defaultIcon() {
        const cloudIcon = this.isEncrypted
            ? InterfaceSecurityShield4
            : ProgrammingCloudCheck;
        return this.$store.getters['vault/isActiveLocal']
            ? ComputerStorageHardDrive2
            : cloudIcon;
    }

    get vaultProgress() {
        return {
            completed: this.priorityStatus?.info?.loaded ?? 1,
            total: this.priorityStatus?.info?.total ?? 1,
        };
    }

    get resolveIcon() {
        if (!this.priorityStatus.state) {
            return this.defaultIcon();
        }

        switch (this.priorityStatus.state) {
            case LoadProgressState.OKAY:
                return this.defaultIcon();
            case LoadProgressState.IMPORTING_NEW_CHANGES:
            case LoadProgressState.IMPORTING_NEW_VAULT:
                if (!this.shouldShow) return this.defaultIcon();
                return TaskListProgress;
            case LoadProgressState.CLOUD_VAULT_LOADING:
            case LoadProgressState.CLOUD_VAULT_SENDING:
                if (!this.shouldShow) return this.defaultIcon();
                return LoadingIcon;
            case LoadProgressState.ENCRYPTING_VAULT:
                if (!this.shouldShow) return this.defaultIcon();
                return LoadingIcon;
            case LoadProgressState.ERROR:
                return ProgrammingCloudOff;
            default:
                return null;
        }
    }

    get vaultType() {
        const currentVault = this.$store.getters['vault/active'];
        if (currentVault?.type === 'remote') {
            if (this.isEncrypted) {
                return 'Encrypted vault. Synced to cloud';
            }
            return 'Synced to cloud';
        }

        return 'Saved to disk';
    }

    get timestamp() {
        return this.priorityStatus?.info?.timestamp ?? Date.now();
    }

    get lastSyncText() {
        return formatDistance(new Date(this.timestamp), this.now, {
            addSuffix: true,
        });
    }

    get shouldShow() {
        return (
            this.timeRemaining + this.timeElapsed > 5 ||
            (this.priorityStatus?.info?.loaded > 0 &&
                this.priorityStatus?.info?.total -
                    this.priorityStatus?.info?.loaded >
                    50)
        );
    }

    get deviceStatus() {
        return (
            this.vaultStatus?.deviceStatus ?? {
                state: LoadProgressState.OKAY,
            }
        );
    }

    get cloudStatus() {
        return (
            this.vaultStatus?.cloudStatus ?? {
                state: LoadProgressState.OKAY,
            }
        );
    }

    get vaultStatus() {
        return (
            this.$store.getters['vault/vaultStatus'](
                this.$store.getters['vault/activeVaultId'],
            ) ?? {}
        );
    }

    get priorityStatus() {
        if (this.deviceStatus.state !== LoadProgressState.OKAY) {
            return this.deviceStatus;
        }

        return this.cloudStatus;
    }

    get statusMessage() {
        const state = this.priorityStatus.state;
        const okMessage = this.lastSyncText;
        if (state === LoadProgressState.OKAY) {
            return okMessage;
        }

        if (state === LoadProgressState.ERROR) {
            return 'Offline';
        }

        if (!this.shouldShow) {
            return okMessage;
        }

        if (state === LoadProgressState.ENCRYPTING_VAULT) {
            return `Encrypting ${this.priorityStatus?.info?.loaded}/${this.priorityStatus?.info?.total}`;
        }

        if (state === LoadProgressState.IMPORTING_NEW_VAULT) {
            return `Importing ${this.priorityStatus?.info?.loaded}/${this.priorityStatus?.info?.total}`;
        }

        if (state === LoadProgressState.IMPORTING_NEW_CHANGES) {
            return `Importing ${this.priorityStatus?.info?.loaded}/${this.priorityStatus?.info?.total}`;
        }

        if (state === LoadProgressState.CLOUD_VAULT_LOADING) {
            return `Loading ${this.priorityStatus?.info?.loaded}/${this.priorityStatus?.info?.total}`;
        }

        if (state === LoadProgressState.CLOUD_VAULT_SENDING) {
            return `Syncing ${this.priorityStatus?.info?.loaded}/${this.priorityStatus?.info?.total}`;
        }
    }

    get syncStatus() {
        return `<div class='tooltip'>${this.vaultType} ${this.statusMessage}</div>`;
    }

    get timeElapsed() {
        return this.priorityStatus?.info?.timeElapsed;
    }

    get timeRemaining() {
        return this.priorityStatus?.info?.timeRemaining;
    }

    mounted() {
        setInterval(() => {
            this.now = new Date();
        }, 60000);
    }
}
</script>
<style lang="scss" scoped>
.icon {
    outline: none;
}

.sync-status {
    user-select: none;
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--sync-status-icon-color);
}
</style>
