<template>
    <div class="document-dropdown">
        <div class="document-dropdown__title">
            <div v-if="folder.icon" class="custom-icon icon">
                <span>{{ folder.icon }}</span>
            </div>
            <InterfaceFolder
                v-else
                class="document-dropdown__title__icon"
                size="16"
            />
            <span>
                {{ folder.name || 'New Folder' }}
            </span>
        </div>
        <div class="document-dropdown__options">
            <button class="document-dropdown__options__option" @click="rename">
                <div class="document-dropdown__options__option__title">
                    Rename
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceEditPencil size="16" class="icon" />
                </div>
            </button>
            <div v-if="canShare">
                <button
                    v-if="share"
                    class="document-dropdown__options__option"
                    @click="handleSharingToggle(false)"
                >
                    <div class="document-dropdown__options__option__title">
                        Stop Sharing Folder
                    </div>
                    <div class="document-dropdown__options__option__icon">
                        <InterfaceShareDelete size="16" class="icon" />
                    </div>
                </button>
                <button
                    v-else
                    class="document-dropdown__options__option"
                    @click="handleSharingToggle(true)"
                >
                    <div class="document-dropdown__options__option__title">
                        Share Folder
                    </div>
                    <div class="document-dropdown__options__option__icon">
                        <InterfaceShare size="16" class="icon" />
                    </div>
                </button>
                <button
                    v-if="share"
                    class="document-dropdown__options__option"
                    @click="copyLink"
                >
                    <div class="document-dropdown__options__option__title">
                        Sharing Options
                    </div>
                    <div class="document-dropdown__options__option__icon">
                        <InterfaceEditCopy size="16" class="icon" />
                    </div>
                </button>
            </div>
        </div>
        <div class="document-dropdown__options">
            <button
                class="document-dropdown__options__option danger"
                @click="deleteFolder"
            >
                <div class="document-dropdown__options__option__title">
                    Delete
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceDeleteBin1 size="16" class="icon" />
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { v4 } from 'uuid';
import InterfaceEditWrite2 from '~/components/streamline/InterfaceEditWrite2.vue';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import { IDocument } from '~/components/document/model';
import InterfaceShare from '~/components/streamline/InterfaceShare.vue';
import InterfaceShareDelete from '~/components/streamline/InterfaceShareDelete.vue';
import InterfaceEditCopy from '~/components/streamline/InterfaceEditCopy.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'FolderDropdown',
    components: {
        InterfaceEditCopy,
        InterfaceShareDelete,
        InterfaceShare,
        InterfaceEditWrite2,
        InterfaceFolderAdd,
        InterfaceEditPencil,
        InterfaceDeleteBin1,
        InterfaceFolder,
    },
})
export default class FolderDropdown extends Vue {
    @Prop({ default: null })
    folder!: any;

    get canShare() {
        return this.$accessControl.isProActive;
    }

    async deleteFolder() {
        await this.$pane.hide();
        await this.$entities.folder.deleteFolder(this.folder.id);
        this.$tracking.trackEventV2(TrackingType.FOLDER, {
            action: TrackingAction.DELETE,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    async rename() {
        const { Dialog } = await import('@capacitor/dialog');

        const { value, cancelled } = await Dialog.prompt({
            message: 'Rename folder',
        });

        if (cancelled) return;

        await this.$pane.hide();
        await this.$entities.folder.update({
            id: this.folder.id,
            name: value,
        });
    }

    get folderData() {
        return this.$entities.folder.byId(this.folder.id);
    }

    get share() {
        return this.folderData!.sharingUuid;
    }

    async handleSharingToggle(value: boolean) {
        await this.$entities.folder.toggleSharing(this.folderData!.id, value);

        if (value) {
            await this.copyLink();
        }
    }

    get sharingLink() {
        const origin = this.$config.baseUrl.replace(
            /(\w+)?(?:api-1\.)|(?:-api)|(?:api\.)|(?:-1-api)/i,
            'sharing.',
        );
        return this.folderData?.sharingUuid
            ? `${origin}/p/${this.folderData.sharingUuid}`
            : '';
    }

    async copyLink() {
        const { Share } = await import('@capacitor/share');
        const title = this.folderData!.name.length
            ? this.folderData!.name
            : 'Untitled';

        const options = {
            title,
            text: this.sharingLink,
        };
        let fullOptions = {};
        if (this.$utils.isMobile && this.$config.platform === 'android') {
            fullOptions = {
                ...options,
                dialogTitle: `Share ${title}`,
                url: this.sharingLink,
            };
        } else {
            fullOptions = { ...options };
        }

        await Share.share(fullOptions)
            .then(() => this.$pane.hide())
            .catch(e => console.log(e));
    }
}
</script>
<style lang="scss" scoped>
.document-dropdown {
    @include mobileDropdown;
}
</style>
