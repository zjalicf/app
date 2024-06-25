<template>
    <vue-final-modal
        v-slot="{ close }"
        name="new-sidebar-modal"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="false"
        :click-to-close="false"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '300px',
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
        <div class="new-sidebar-modal">
            <div class="new-sidebar-modal__header">
                <img src="/components/new-sidebar.gif" />
            </div>
            <div class="new-sidebar-modal__body">
                <h2>Your tasks have moved</h2>
                <p>
                    Tasks without page have been moved to Inbox page in Tasks
                    folder. Scheduled tasks were moved to My Day. Tasks in pages
                    are unchanged.
                </p>
            </div>
            <div class="new-sidebar-modal__footer">
                <CButton
                    class="new-sidebar-modal__footer__button"
                    size="full-width"
                    @click="close"
                >
                    Got it
                </CButton>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CalendarIcon, GlobeIcon, SparklesIcon } from '@vue-hero-icons/solid';
import { RobotIcon } from '~/components/icons';
import CSwitch from '@/components/CSwitch.vue';
import CButton from '~/components/CButton.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';

@Component({
    name: 'NewSidebarModal',
    components: {
        CButton,
        CalendarIcon,
        GlobeIcon,
        CSwitch,
        SparklesIcon,
        GithubIcon,
        RobotIcon,
        JiraIcon,
    },
})
export default class NewSidebarModal extends Vue {}
</script>

<style scoped lang="scss">
.new-sidebar-modal {
    @include modal;
    padding: 20px;

    &__header {
        margin-bottom: 25px;
        img {
            display: block;
            border-radius: 12px;
        }
    }

    &__body {
        h2 {
            @include font14-500;
            color: var(--modal-title-text-color);
            text-align: center;
            margin-bottom: 10px;
        }

        p {
            @include font12-500;
            color: var(--modal-body-text-color);
            text-align: center;
            margin-bottom: 30px;
        }
    }
}
</style>
