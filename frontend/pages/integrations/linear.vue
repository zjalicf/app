<template>
    <div class="success-page">
        <div class="success-page--container">
            <div class="success-page--container--content">
                <img src="/integrations/linear.png" alt="acreom logo" />
            </div>
            <div class="success-page--container--title">
                Linear account authorised. Return to acreom to finish
                integration.
            </div>
            <div class="success-page--container--action">
                <button
                    class="success-page--container--action--button"
                    @click="openElectron"
                >
                    Open acreom
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { SafeElectronWindow } from '~/@types';
import { isElectron } from '~/helpers/is-electron';

@Component({
    name: 'Linear',
    components: { InterfaceAdd1 },
    layout: 'homepage',
    asyncData(route) {
        const { access_token, expiry_date, vaultId } = route.query;
        return { access_token, expiry_date, vaultId };
    },
})
export default class Linear extends Vue {
    access_token!: string;
    refresh_token!: string;
    expiry_date!: string;
    vaultId!: string;

    get authString() {
        return `linear&${this.access_token}&${this.expiry_date}&${this.vaultId}`;
    }

    get appRedirect() {
        return `acreom://${btoa(`integration-add:${this.authString}`)}`;
    }

    openElectron() {
        if (isElectron()) {
            (window as SafeElectronWindow).electron.addIntegration(
                this.authString,
            );
            return;
        }

        window.location.replace(this.appRedirect);
    }

    mounted() {
        this.openElectron();
        window.opener?.postMessage(`integration-add:${this.authString}`, '*');
    }
}
</script>

<style lang="scss" scoped>
.success-page {
    @include scrollbar;
    font-family: 'Inter', sans-serif;
    user-select: none;
    height: 100vh;
    width: 100%;

    &--container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        &--title {
            @include font14-500;
            color: $white;
            max-width: 255px;
            text-align: center;
            margin-bottom: 22px;
        }

        &--action {
            max-width: 180px;
            width: 100%;

            &--button {
                @include font12-600;
                color: black;
                padding: 9px 0;
                text-align: center;
                background: $white;
                border-radius: 6px;
                width: 100%;
            }
        }

        &--content {
            margin: 0 auto 25px;
        }
    }
}
</style>
