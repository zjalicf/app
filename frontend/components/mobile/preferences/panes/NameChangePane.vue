<template>
    <div
        class="name-change-pane"
        :style="{ '--keyboard-height': `${keyboardHeight}px` }"
    >
        <div class="name-change-pane__header">
            <button @click="$emit('cancel')">Cancel</button>
            {{ vaultName }}
            <button @click="$emit('done', text)">Done</button>
        </div>
        <div class="name-change-pane__input-backdrop">
            <div class="name-change-pane__input-backdrop__input-wrapper">
                <input
                    ref="nameInput"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    :value="text"
                    placeholder="Vault Name"
                    @input="onInput($event.target.value)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'NameChangePane',
    components: {},
})
export default class NameChangePane extends Vue {
    $refs!: {
        nameInput: HTMLInputElement;
    };

    text: string = '';

    get vaultName() {
        const vault = this.$store.getters['vault/active'];
        const { name } = this.$store.getters['vault/byId'](vault.id);

        return name || 'Untitled';
    }

    get keyboardHeight() {
        const keyboardOpen = this.$utils.mobile.keyboardOpen;

        if (!keyboardOpen) return 0;
        return this.$store.getters['mobile/keyboardHeight'];
    }

    onInput(value: string) {
        this.text = value;
    }

    setFocus() {
        if (!this.$refs.nameInput) return;
        this.$nextTick(() => {
            this.$refs.nameInput.focus({
                preventScroll: true,
            });
        });
    }

    mounted() {
        setTimeout(() => {
            this.setFocus();
        }, 400);

        this.text = this.vaultName;
    }
}
</script>

<style lang="scss" scoped>
.name-change-pane {
    overflow: auto;
    height: calc(100vh - var(--keyboard-height));

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: $white;
        gap: 14px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        letter-spacing: -0.24px;
        border-bottom: 1px solid $blueGrey800;

        button {
            color: var(--accent-color);
            padding: 16px 20px;
        }
    }

    &__input-backdrop {
        padding: 0 16px 16px;
        margin-top: 16px;
        position: sticky;
        position: -webkit-sticky;
        top: 0;

        &__input-wrapper {
            display: flex;
            padding: 14px 13px;
            background: var(--mobile-pane-option-bg-color);
            border-radius: 9px;
            -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
            backdrop-filter: blur(12px); /* Chrome and Opera */

            input {
                @include inputMetaStyles;
                outline: none;
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                letter-spacing: -0.24px;
                color: var(--mobile-pane-search-input-text-color);
                display: block;
                width: 100%;

                &::placeholder {
                    color: var(--mobile-pane-search-input-placeholder-color);
                }
            }
        }
    }
}
</style>
