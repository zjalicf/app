<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '360px',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="log-in-modal">
            <EmailLogin
                :tab="tab"
                context="myAccount"
                @update-tab="tabChange($event, close)"
                @success="close"
            />
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LoginButtons from '@/components/auth/login-buttons';
import EmailLogin from '~/components/auth/EmailLogin.vue';

@Component({
    name: 'LogInModal',
    components: {
        EmailLogin,
        LoginButtons,
    },
})
export default class LogInModal extends Vue {
    @Prop({ default: false })
    pricingLogin!: boolean;

    tab: any = 'login';

    tabChange(tab: string, close: any) {
        if (tab === 'home') {
            close();
            return;
        }

        this.tab = tab;
    }
}
</script>

<style scoped lang="scss">
.log-in-modal {
    @include modal;
    padding: 45px 35px;
}
</style>
