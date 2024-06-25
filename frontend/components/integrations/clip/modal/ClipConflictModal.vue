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
        :content-style="{}"
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
        <div class="clip-conflicts-modal">
            <div class="clip-conflicts-modal--header">
                <div class="clip-conflicts-modal--title">
                    Page and Issue already linked.
                </div>
                <div
                    v-if="type === 'page'"
                    class="clip-conflicts-modal--subtitle"
                >
                    The <b>{{ oldIssue }}</b> is already linked to
                    <b>{{ oldPage }}</b
                    >. Do you want to link the issue to <b>{{ newPage }}</b
                    >?
                </div>
                <div v-else class="clip-conflicts-modal--subtitle">
                    The <b>{{ oldIssue }}</b> is already linked to
                    <b>{{ oldPage }}</b
                    >. Do you want instead link <b>{{ newIssue }}</b> to
                    <b>{{ oldPage }}</b
                    >?
                </div>
            </div>
            <div class="clip-conflicts-modal--footer">
                <div class="clip-conflicts-modal--footer--info"></div>
                <div class="clip-conflicts-modal--footer--actions">
                    <CButton
                        type="primary"
                        tabindex="0"
                        @click="$emit('new', close)"
                        >Replace
                    </CButton>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="$emit('old', close)"
                        >Keep old link
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import CInput from '~/components/CInput.vue';

@Component({
    name: 'JiraClipConflictModal',
    components: {
        CInput,
        CButton,
    },
})
export default class JiraClipConflictModal extends Vue {
    @Prop({ required: true })
    type!: string;

    @Prop()
    oldIssue!: string;

    @Prop()
    newIssue!: string;

    @Prop()
    oldPage!: string;

    @Prop()
    newPage!: string;
}
</script>

<style lang="scss" scoped>
.clip-conflicts-modal {
    @include modal;
    width: 360px;
    padding: 0;
    margin: 0 auto;
    cursor: default;
    user-select: none;
    padding: 16px;

    &--header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
    }

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

    &--footer {
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &--actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;

            .c-button:not(:last-of-type) {
                margin-left: 8px;
            }
        }
    }
}
</style>
