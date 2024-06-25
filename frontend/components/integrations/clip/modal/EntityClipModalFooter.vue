<template>
    <div class="entity-clip-modal-footer">
        <div class="entity-clip-modal-footer__actions">
            <CButton
                type="primary"
                tabindex="0"
                :disabled="issueFetching || errorMessage || !selected"
                class="accept"
                @click="$emit('accept')"
            >
                <LoadingIcon v-if="issueFetching" size="14" class="icon" />{{
                    issueFetching ? '' : 'Add Clip'
                }}
            </CButton>
            <CButton type="secondary" tabindex="0" @click="$emit('cancel')"
                >Cancel
            </CButton>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'EntityClipModalFooter',
    components: {
        CButton,
        LoadingIcon,
    },
})
export default class EntityClipModalFooter extends Vue {
    @Prop({ default: false })
    issueFetching!: boolean;

    @Prop({ default: null })
    errorMessage!: string | null;

    @Prop({ default: null })
    selected!: string | null;
}
</script>
<style lang="scss" scoped>
.entity-clip-modal-footer {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &__actions {
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        gap: 8px;

        :deep(.c-button.accept) {
            width: 82px;
            height: 30px;
            justify-content: center;
        }
    }
}
</style>
