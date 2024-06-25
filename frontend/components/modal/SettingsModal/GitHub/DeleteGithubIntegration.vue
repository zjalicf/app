<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        name="delete-github-integration"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            'max-width': '360px',
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
                <div class="conflicts-modal--title">
                    Remove Github Integration
                </div>
                <div class="conflicts-modal--subtitle">
                    This action will remove GitHub integration from acreom.
                    Pages linked to GitHub PRs and issues will not be deleted.
                </div>
            </div>
            <div class="conflicts-modal--footer">
                <div class="conflicts-modal--footer--info"></div>
                <div class="conflicts-modal--footer--actions">
                    <CButton
                        type="danger"
                        tabindex="0"
                        @click="$emit('remove', close)"
                        >Remove Integration
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
    name: 'JiraDeleteIntegrationModal',
    components: {
        CInput,
        CButton,
    },
})
export default class JiraDeleteIntegrationModal extends Vue {
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
        await this.$store.dispatch('user/delete');
        this.$vfm.hideAll();
    }
}
</script>

<style lang="scss" scoped>
.conflicts-modal {
    @include modal;
    user-select: none;

    &--header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 16px 16px 0;
    }

    &--title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
    }

    &--subtitle {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 12px;
    }

    &--footer {
        padding: 0 16px 16px;
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
