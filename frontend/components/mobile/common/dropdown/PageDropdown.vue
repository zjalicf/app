<template>
    <div class="document-dropdown">
        <div class="document-dropdown__title">
            <DocumentIcon
                :document="document"
                :size="16"
                :font-size="14"
                class="document-dropdown__title__icon"
            />
            <span>
                {{ document.title || 'Untitled' }}
            </span>
        </div>
        <div class="document-dropdown__options">
            <button
                v-if="!document.dailyDoc && !document.template && !isPinned"
                class="document-dropdown__options__option"
                @click="pin"
            >
                <div class="document-dropdown__options__option__title">Pin</div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceEditPin2 size="16" class="icon" />
                </div>
            </button>
            <button
                v-else
                class="document-dropdown__options__option"
                @click="unpin"
            >
                <div class="document-dropdown__options__option__title">
                    Unpin
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceEditPin2 size="16" class="icon" />
                </div>
            </button>
            <button
                class="document-dropdown__options__option"
                @click="documentInfo"
            >
                <div class="document-dropdown__options__option__title">
                    Page Info
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceAlertInformationCircle size="16" class="icon" />
                </div>
            </button>
            <button
                v-if="isShared && canShare"
                class="document-dropdown__options__option"
                @click="copyDocumentLink"
            >
                <div class="document-dropdown__options__option__title">
                    Copy Sharing Link
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceEditCopy size="16" class="icon" />
                </div>
            </button>
            <button
                v-if="!isShared && canShare"
                class="document-dropdown__options__option"
                @click="shareDocument"
            >
                <div class="document-dropdown__options__option__title">
                    Share Link
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceShare size="16" class="icon" />
                </div>
            </button>
            <button
                v-else-if="canShare"
                class="document-dropdown__options__option"
                @click="stopSharing"
            >
                <div class="document-dropdown__options__option__title">
                    Stop Sharing
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceShareDelete size="16" class="icon" />
                </div>
            </button>
            <button
                class="document-dropdown__options__option"
                @click="duplicate"
            >
                <div class="document-dropdown__options__option__title">
                    Duplicate
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceAlignBack size="16" class="icon" />
                </div>
            </button>
            <button
                class="document-dropdown__options__option"
                @click="schedule"
            >
                <div class="document-dropdown__options__option__title">
                    Schedule
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceCalendar class="icon" size="16" />
                </div>
            </button>
            <button
                class="document-dropdown__options__option"
                @click="addStatus"
            >
                <div class="document-dropdown__options__option__title">
                    {{ document.pageStatus ? 'Change' : 'Add' }} Status
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceEditSelectAreaCircleDash class="icon" size="16" />
                </div>
            </button>
            <button
                v-if="!document.archived"
                class="document-dropdown__options__option"
                @click="archive"
            >
                <div class="document-dropdown__options__option__title">
                    Archive
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceContentArchive size="16" class="icon" />
                </div>
            </button>
            <button
                v-if="document.archived"
                class="document-dropdown__options__option"
                @click="restoreDocument"
            >
                <div class="document-dropdown__options__option__title">
                    Restore
                </div>
                <div class="document-dropdown__options__option__icon">
                    <InterfaceArrowsReload2Alternate size="16" class="icon" />
                </div>
            </button>
        </div>
        <div class="document-dropdown__options">
            <button
                class="document-dropdown__options__option danger"
                @click="deleteForever"
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
import { Toast } from '@capacitor/toast';
import { DatePicker, DatePickerTheme } from '@capacitor-community/date-picker';
import { format, parse, parseISO } from 'date-fns';
import { IDocument } from '~/components/document/model';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceAlertInformationCircle from '~/components/streamline/InterfaceAlertInformationCircle.vue';
import InterfaceShare from '~/components/streamline/InterfaceShare.vue';
import InterfaceArrowsBendRight1 from '~/components/streamline/InterfaceArrowsBendRight1.vue';
import InterfaceAlignBack from '~/components/streamline/InterfaceAlignBack.vue';
import InterfaceDownloadSquare from '~/components/streamline/InterfaceDownloadSquare.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceShareDelete from '~/components/streamline/InterfaceShareDelete.vue';
import InterfaceEditCopy from '~/components/streamline/InterfaceEditCopy.vue';
import InterfaceEditPin2 from '~/components/streamline/InterfaceEditPin2.vue';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';
import InterfaceArrowsReload2Alternate from '~/components/streamline/InterfaceArrowsReload2Alternate.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import MobilePageStatusDropdown from '~/components/mobile/common/dropdown/page/MobilePageStatusDropdown.vue';
import { PageStatus } from '~/constants';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import { DateFormat, TimeFormat } from '~/helpers/date';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'PageDropdown',
    components: {
        InterfaceEditSelectAreaCircleDash,
        DocumentIcon,
        InterfaceCalendar,
        InterfaceArrowsReload2Alternate,
        InterfaceContentArchive,
        InterfaceEditPin2,
        InterfaceContentFileAlternate,
        InterfaceAlertInformationCircle,
        InterfaceShare,
        InterfaceArrowsBendRight1,
        InterfaceAlignBack,
        InterfaceDownloadSquare,
        InterfaceDeleteBin1,
        InterfaceShareDelete,
        InterfaceEditCopy,
    },
})
export default class PageDropdown extends Vue {
    @Prop({ required: true })
    document!: IDocument;

    get isShared() {
        return this.document.sharingUuid;
    }

    get currentLevel() {
        return +this.$route.query.level!;
    }

    get canShare() {
        return this.$accessControl.isProActive;
    }

    async addStatus() {
        const capitalize = (label: string) => {
            const arr = label.split(' ');
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
            }
            return arr.join(' ');
        };
        await this.$pane.hide();
        await this.$utils.mobile.closeKeyboard();
        await this.$pane.show({
            component: MobilePageStatusDropdown,
            bind: {
                statuses: Object.values(PageStatus).map(status => ({
                    id: status,
                    icon: this.$utils.page.getWorkflowIcon(status),
                    label: capitalize(status),
                })),
                selectedStatus: this.document.pageStatus,
            },
            type: 'dropdown',
            on: {
                select: (status: PageStatus) => {
                    this.$entities.page.changeStatus(this.document, status);
                    this.$pane.hide();
                    this.$tracking.trackEventV2(TrackingType.PAGE, {
                        action: TrackingAction.SET_STATUS,
                        source: TrackingActionSource.MOBILE_DROPDOWN,
                    });
                },
            },
        });
    }

    deleteForever() {
        this.$pane.hide();
        this.$utils.page.deletePage(this.document);
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.DELETE,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    async restoreDocument() {
        const payload = {
            updatedAt: new Date(),
            id: this.document.id,
            archived: false,
        };
        await this.$store.dispatch('document/update', payload);
        this.$tracking.trackEvent('document', {
            action: 'unarchive',
            entity_id: this.document.id,
        });
        this.$pane.hide();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.RESTORE,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    async duplicate() {
        const duplicatedDocument = await this.$store.dispatch(
            'document/duplicate',
            this.document.id,
        );
        this.$pane.hide();
        await this.$router.push({
            path: `/mobile/documents/${duplicatedDocument.id}`,
            query: {
                level: `${this.currentLevel + 1}`,
            },
        });
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.DUPLICATE,
            sourceMeta: TrackingActionSourceMeta.MOBILE,
        });
    }

    get isPinned() {
        const document = this.$store.getters['document/byId'](this.document.id);
        if (document) {
            return document.pinned;
        }

        return false;
    }

    async pin() {
        const pinnedDocuments = this.$store.getters['document/pinned'];
        await this.$store.dispatch('document/update', {
            id: this.document.id,
            pinned: true,
            pinOrder: pinnedDocuments.length * 500,
        });
        this.$tracking.trackEvent('document', {
            action: 'pin',
            entity_id: this.document.id,
        });
        this.$pane.hide();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.PIN,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    async archive() {
        const payload = {
            updatedAt: new Date(),
            id: this.document.id,
            archived: true,
        };
        await this.$store.dispatch('document/update', payload);
        this.$tracking.trackEvent('document', {
            action: 'archive',
            entity_id: this.document.id,
        });
        this.$pane.hide();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.ARCHIVE,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    async unpin() {
        await this.$store.dispatch('document/update', {
            id: this.document.id,
            pinned: false,
            pinOrder: null,
        });
        this.$tracking.trackEvent('document', {
            action: 'unpin',
            entity_id: this.document.id,
        });
        this.$pane.hide();
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.UN_PIN,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }

    get sharingLink() {
        const origin = this.$config.baseUrl.replace(
            /(\w+)?(?:api-1\.)|(?:-api)|(?:api\.)|(?:-1-api)/i,
            'sharing.',
        );
        const doc = this.$store.getters['document/byId'](this.document.id);
        return doc.sharingUuid ? `${origin}/d/${doc.sharingUuid}` : '';
    }

    async shareDocument() {
        const sharingUuid = v4();
        await this.$store.dispatch('document/update', {
            id: this.document.id,
            sharingUuid,
        });
        await this.copyDocumentLink();
        this.$pane.hide();
    }

    stopSharing() {
        this.$store.dispatch('document/update', {
            id: this.document.id,
            sharingUuid: null,
        });

        Toast.show({
            text: 'Sharing Stopped',
            position: 'top',
        });

        this.$pane.hide();
    }

    async copyDocumentLink() {
        const { Share } = await import('@capacitor/share');
        const title = this.document.title.length
            ? this.document.title
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

    documentInfo() {
        this.$router.push({
            path: `/mobile/info/${this.document.id}`,
            query: {
                level: `${this.currentLevel + 1}`,
            },
        });
        this.$pane.hide();
        this.$tracking.trackEventV2(TrackingType.INFO_PANEL, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE,
            sourceMeta: this.document.id,
        });
    }

    async schedule() {
        await this.$pane.hide();
        const selectedTheme: DatePickerTheme = 'dark';
        const dateFormat =
            this.$store.getters['appSettings/dateTimeOptions'].dateFormat ===
            DateFormat.EU
                ? 'd/M/yyyy'
                : 'M/d/yyyy';
        const is24h =
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat ===
            TimeFormat.HOUR_24;
        const date = await DatePicker.present({
            mode: 'date',
            theme: selectedTheme,
            ios: {
                format: dateFormat,
                style: 'inline',
            },
            is24h,
        });
        if (!date.value) return;
        let value: string;
        if (this.$config.os === 'android') {
            value = format(parseISO(date.value), dateFormat);
        }

        if (this.$config.os === 'ios') {
            value = date.value;
        }
        this.$utils.page.schedulePage(
            this.document,
            parse(value!, dateFormat, new Date()),
        );
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.SET_DATE,
            source: TrackingActionSource.MOBILE_DROPDOWN,
        });
    }
}
</script>
<style lang="scss" scoped>
.document-dropdown {
    @include mobileDropdown;
}
</style>
