<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            'max-width': '400px',
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
        <div class="conflicts-modal">
            <div class="conflicts-modal--header">
                <div class="conflicts-modal--title">Delete Account</div>
                <div class="conflicts-modal--subtitle">
                    This action will permanently delete {{ email }} account and
                    all of it's data (Cloud Vaults) from acreom. Local Vaults
                    are unaffected. This action can't be undone.
                </div>
            </div>
            <div class="conflicts-modal--body">
                <p>Type {{ email }} to confirm</p>
                <CInput
                    v-model="confirmEmail"
                    :background="true"
                    :placeholder="email"
                />
            </div>

            <div class="conflicts-modal--footer">
                <div class="conflicts-modal--footer--info"></div>
                <div class="conflicts-modal--footer--actions">
                    <CButton
                        type="danger"
                        tabindex="0"
                        :disabled="disabled"
                        @click="deleteUser"
                        >Delete Permanently
                    </CButton>
                    <CButton type="secondary" tabindex="0" @click="close"
                        >Cancel</CButton
                    >
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CButton from '@/components/CButton.vue';
import CInput from '~/components/CInput.vue';

@Component({
    name: 'AccountDeleteModal',
    components: {
        CInput,
        CButton,
    },
})
export default class AccountDeleteModal extends Vue {
    confirmEmail: string = '';

    get disabled() {
        return this.confirmEmail !== this.email;
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get email() {
        if (this.user) {
            if (this.user.email) return this.user.email;
            else return this.user.username;
        }

        return '';
    }

    async deleteUser() {
        await this.$vfm.hideAll();
        await this.$store.dispatch('user/delete');
    }
}
</script>

<style lang="scss" scoped>
.conflicts-modal {
    @include modal;
    user-select: none;
    padding: 16px;

    &--title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
    }

    &--subtitle {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 8px;
    }

    &--body {
        margin-bottom: 12px;

        p {
            @include font12-500;
            color: var(--modal-body-text-color);
            margin-bottom: 8px;
        }
    }

    &--footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        &--actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
