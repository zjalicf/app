<template>
    <div class="entity-clip-modal-content">
        <div class="entity-clip-modal-content__header">
            <div class="entity-clip-modal-content__header__title">
                Paste URL to clip.
            </div>
        </div>
        <EntityClipModalControl>
            <template #title> Paste an URL: </template>
            <template #controls>
                <CInput
                    ref="input"
                    :value="url"
                    type="text"
                    placeholder="URL"
                    class="input"
                    @input="onURLPasted"
                />
            </template>
            <template v-if="errorMessage" #error>
                {{ errorMessage }}
            </template>
        </EntityClipModalControl>
        <EntityClipModalFooter
            :issue-fetching="issueFetching"
            :error-message="errorMessage"
            :selected="selected"
            @accept="modalAccept"
            @cancel="modalCancel"
        />
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import CInput from '~/components/CInput.vue';
import ClipModalContentMixin from '~/components/integrations/clip/modal/content/ClipModalContentMixin.vue';
import EntityClipModalFooter from '~/components/integrations/clip/modal/EntityClipModalFooter.vue';
import EntityClipModalControl from '~/components/integrations/clip/modal/EntityClipModalControl.vue';
@Component({
    name: 'UrlClipModalContent',
    components: {
        EntityClipModalControl,
        EntityClipModalFooter,
        CInput,
    },
})
export default class UrlClipModalContent extends ClipModalContentMixin {
    onURLPasted(url: string) {
        this.url = url;
        this.errorMessage = null;
        if (this.url === '') return;
        if (!this.$entities.page.isValidUrl(this.url)) {
            this.onError('Invalid URL');
            return;
        }
        this.onUrlSelected(this.url);
    }
}
</script>
