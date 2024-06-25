<template>
    <vue-final-modal
        name="log-in"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '320px',
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
            <div class="log-in-modal--title">Sign In</div>
            <div class="log-in-modal--subtitle">Access your acreom cloud</div>
            <div class="log-in-modal--actions">
                <LoginButtons
                    :tab="tab"
                    :disable-no-account="true"
                    :use-modal="true"
                    @update-tab="tab = $event"
                />
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LoginButtons from '@/components/auth/login-buttons';

@Component({
    name: 'LogInModal',
    components: {
        LoginButtons,
    },
})
export default class LogInModal extends Vue {
    @Prop({ default: false })
    pricingLogin!: boolean;

    tab: any = 'home';
}
</script>

<style scoped lang="scss">
.log-in-modal {
    @include modal;
    user-select: none;
    padding: 30px 25px 25px;

    &--title {
        text-align: center;
        font-weight: 600;
        font-size: 24px;
        line-height: 155.2%;
        color: var(--modal-title-text-color);
        margin-bottom: 5px;
    }

    &--subtitle {
        max-width: 200px;
        margin: 0 auto 12px;
        text-align: center;
        @include font12-500;
        color: var(--modal-body-text-color);
    }

    &--actions {
        padding: 20px;
        border-radius: 12px;
        margin: 0 auto;
        max-width: 280px;
        width: 100%;
    }
}
</style>
