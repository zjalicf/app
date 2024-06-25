<template>
    <div class="workspace-selector">
        <button
            ref="workspaceSelectorTrigger"
            class="workspace-selector__wrapper"
            data-e2e="workspace-selector"
            :class="{
                active: workspaceSelectorActive,
            }"
            @click="openDropdown"
        >
            <div
                class="workspace-selector__image"
                :title="vaultName"
                :style="{
                    backgroundColor: vaultColor,
                }"
            >
                <span>{{ vaultName[0] }}</span>
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import ClickOutside from 'vue-click-outside';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isElectron } from '~/helpers/is-electron';

@Component({
    directives: {
        ClickOutside,
    },
    computed: {
        ...mapGetters({
            user: 'auth/user',
        }),
    },
})
export default class WorkspaceSelector extends Vue {
    isElectron: boolean = isElectron();
    workspaceSelectorActive: boolean = false;

    $refs!: {
        workspaceSelectorTrigger: HTMLButtonElement;
    };

    openDropdown() {
        this.workspaceSelectorActive = true;
        this.$dropdown.show({
            component: () =>
                import('~/components/dropdown/WorkspaceSelectorDropdown.vue'),
            parent: this.$refs.workspaceSelectorTrigger,
            popperOptions: {
                placement: 'bottom-start',
            },
            onClose: () => {
                this.workspaceSelectorActive = false;
            },
        });
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get vaultColor() {
        const vaultId = this.$store.getters['vault/activeVaultId'] || '';

        return this.$store.getters['vault/color'](vaultId);
    }

    get email() {
        if (this.user) {
            if (this.user.email) return this.user.email;
            else return this.user.name;
        }

        return '';
    }

    get vaultName() {
        const id = this.$store.getters['vault/active']?.id ?? '';
        const vault = this.$store.getters['vault/byId'](id);
        return vault?.name ?? '';
    }
}
</script>

<style lang="scss" scoped>
.loading-icon {
    margin-left: 8px;
}

.workspace-selector {
    @include noDrag;
    position: relative;
    user-select: none;

    &__wrapper {
        width: 100%;
        border-radius: 6px;
        position: relative;
        padding: 4px;
        display: flex;
        align-items: center;
        gap: 6px;

        &__loading {
            display: flex;
            align-items: center;
        }

        &:hover,
        &.active {
            background: var(--app-bg-icon-bg-color__hover);
        }
    }

    &__image {
        width: 20px;
        height: 20px;
        color: var(--workspace-selector-icon-color);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;

        img {
            display: block;
            border-radius: 4px;
        }
    }
}
</style>
