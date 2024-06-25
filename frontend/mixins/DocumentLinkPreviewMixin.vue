<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import DocumentLinkPreview from '~/components/document/DocumentLinkPreview.vue';
import { throttle } from '@/helpers';

const throttledByFps = throttle(requestAnimationFrame);
const MOUSE_OVER_PREVIEW_TIMEOUT = 500;
const MOUSE_LEAVE_PREVIEW_TIMEOUT = 150;

@Component({
    name: '',
})
export default class DocumentLinkPreviewMixin extends Vue {
    @Prop({ default: false })
    disablePreview!: boolean;

    editor?: any;
    mouseOver: boolean = false;
    timer: any = null;
    previewOpen: boolean = false;
    exitTimer: any = null;
    previewPosition: {
        x: number;
        y: number;
    } = { x: 0, y: 0 };

    get documentId(): string {
        throw new Error('Not implemented');
    }

    get parentDocumentId(): string | null {
        return null;
    }

    @Watch('mouseOver')
    handleMouseOverChange(value: boolean) {
        if (this.disablePreview) return;
        clearTimeout(this.exitTimer);

        if (value) return;

        this.exitTimer = setTimeout(() => {
            this.$dropdown.hideAll();
        }, MOUSE_LEAVE_PREVIEW_TIMEOUT);
    }

    handleMouseOver() {
        if (this.disablePreview) return;
        this.mouseOver = true;
    }

    handleMouseLeave() {
        if (this.disablePreview) return;
        this.mouseOver = false;
        clearTimeout(this.timer);
    }

    handleMouseMove(event: MouseEvent) {
        if (this.disablePreview || !this.editor?.isEditable) return;
        throttledByFps(() => {
            if (this.mouseOver && !this.previewOpen) {
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                this.timer = setTimeout(() => {
                    const doc = this.$store.getters['document/byId'](
                        this.documentId,
                    );
                    if (!doc || doc.archived) return;

                    this.previewOpen = true;

                    function generateGetBoundingClientRect() {
                        return () => ({
                            width: 0,
                            height: 0,
                            top: event.clientY + 4,
                            right: event.clientX + 4,
                            bottom: event.clientY + 4,
                            left: event.clientX + 4,
                        });
                    }

                    const parent = {
                        getBoundingClientRect: generateGetBoundingClientRect(),
                    };

                    this.$dropdown.show({
                        component: DocumentLinkPreview,
                        bind: {
                            id: this.documentId,
                            parentDocumentId: this.parentDocumentId,
                        },
                        parent,
                        backdrop: false,
                        retainFocus: true,
                        popperOptions: {
                            strategy: 'fixed',
                            placement: 'bottom-start',
                        },
                        on: {
                            enter: () => {
                                this.mouseOver = true;
                            },
                            leave: () => {
                                this.mouseOver = false;
                            },
                        },
                        onClose: () => {
                            this.previewOpen = false;
                        },
                    });
                }, MOUSE_OVER_PREVIEW_TIMEOUT);
            }
        });
    }

    beforeDestroy() {
        this.previewOpen = false;
        this.handleMouseLeave();
        this.mouseOver = false;
        this.$dropdown.hideAll();
    }

    deactivated() {
        this.previewOpen = false;
        this.handleMouseLeave();
        this.mouseOver = false;
        this.$dropdown.hideAll();
    }
}
</script>
