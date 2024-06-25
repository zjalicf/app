import { Store } from 'vuex';
import { Command, mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { v4 } from 'uuid';
import { VueNodeViewRenderer } from '@tiptap/vue-2';
import ImageComponent from './ImageComponent.vue';
import { EditorContext } from '~/@types/app';
import { EditorTypes, TabType } from '~/constants';
import { registerEditorExtension } from '~/components/editor/extensions';
import { ImagePlaceholderPlugin } from '@/components/editor/extensions/image/placeholder';
import { isDragEvent } from '~/helpers/editor';
import { ImageObject } from '~/@types';
import { IDocument } from '~/components/document/model';
import {
    base64ImageToDataUrl,
    blobToBuffer,
    serializeImage,
} from '~/helpers/image';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

export interface ImageOptions {
    store: Store<any>;
    documentId: string;
    inline: boolean;
    HTMLAttributes: {
        [key: string]: any;
    };
}

declare module '@tiptap/core' {
    interface Commands {
        // @ts-ignore
        image: {
            /**
             * Add an image
             */
            setImage: (options: {
                src: string;
                alt?: string;
                title?: string;
            }) => Command;
            uploadImage: (files: File[]) => Command;
            setImageDocumentId: (id: string) => Command;
        };
    }
}

export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))/;
const FILE_SIZE_LIMIT = 7.8 * 1024 * 1024; // Math.round(7.8 * 1024 * 1024);
const handleImageUpload = (
    ctx: EditorContext,
    items: any[],
    event: ClipboardEvent | Event | null,
    view: EditorView,
    options: ImageOptions,
    isDropEvent = false,
) => {
    const imageIds: string[] = [];
    const activeVault = ctx.store.getters['vault/active'];
    let memoryLimitReached = false;
    const images = Array.from(items)
        .map((image: DataTransferItem) => {
            return image && image.getAsFile ? image.getAsFile() : image;
        })
        .filter(image => image)
        .filter((image: any) => {
            const isUnderLimit =
                activeVault.type === 'local' || image.size < FILE_SIZE_LIMIT;
            if (!isUnderLimit) {
                ctx.nuxt.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/ErrorNotification.vue'
                        ),
                    bind: {
                        displayText: `Could not upload\n${image.name}\n because of file size limit(8MB)`,
                    },
                });
                memoryLimitReached = true;
            }
            return isUnderLimit;
        })
        .filter(file => /image/i.test(file?.type as string));

    let dropCoordinates: { pos: number; inside: number } | undefined | null;
    if (isDropEvent && event) {
        dropCoordinates = view.posAtCoords({
            left: (event as MouseEvent).clientX,
            top: (event as MouseEvent).clientY,
        });
    }
    const { selection, schema, tr } = view.state;

    const hasHTML = items.some(x => x.type === 'text/html');
    const hasImage = items.some(x => x.type.startsWith('image/'));

    if (hasHTML && !hasImage) {
        return false;
    }

    if (memoryLimitReached && images.length === 0) return true;

    const imagesToUpload = images.map(async (image, index) => {
        const metaTransaction = tr;
        const id = v4();
        imageIds.push(id);

        const pos = dropCoordinates?.pos ?? selection.from + index;
        const imageBuffer = await blobToBuffer(image as Blob);
        const serializedImage = await serializeImage(imageBuffer);
        const type = images[index]?.type?.replace('image/', '') || 'png';
        const imageData = base64ImageToDataUrl(serializedImage, type);

        const node = schema.nodes.imageComponent.create({
            id,
            // @ts-ignore
            alt: images[index]?.name ?? 'unknown',
            data: imageData,
            loading: true,
        });

        metaTransaction.replaceWith(pos, pos, node);

        view.dispatch(metaTransaction);

        // @ts-ignore
        const name = images[index]?.name || 'unknown';
        const document = ctx.store.getters['document/byId'](
            options.documentId,
        ) as IDocument;
        return options.store?.dispatch('image/update', {
            id,
            entityType: 'documents',
            entityId: options.documentId,
            data: image,
            folderId: document.projectId,
            name,
            ext: type,
        });
    });

    if (images.length > 0) {
        event?.preventDefault();
        event?.stopImmediatePropagation();

        Promise.all(imagesToUpload);
        const activeTab = ctx.nuxt.$tabs.activeTab();
        if (!activeTab) return;
        const source = event
            ? isDropEvent
                ? TrackingActionSource.DROP
                : TrackingActionSource.PASTE
            : TrackingActionSource.AUTOCOMPLETE;
        ctx.nuxt.$tracking.trackEventV2(TrackingType.EDITOR, {
            action: TrackingAction.INSERT_IMAGE,
            source,
            sourceMeta:
                activeTab.type === TabType.MY_DAY
                    ? TrackingActionSourceMeta.MY_DAY
                    : TrackingActionSourceMeta.PAGE,
        });
    }

    return false;
};

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(_ctx: EditorContext) {
        return Node.create<ImageOptions>({
            name: 'image',

            addOptions() {
                return {
                    ...this.parent?.(),
                    inline: false,
                    HTMLAttributes: {},
                };
            },

            inline() {
                return this.options.inline;
            },

            group() {
                return this.options.inline ? 'inline' : 'block';
            },

            draggable: true,

            addAttributes() {
                return {
                    id: {
                        default: null,
                    },
                    src: {
                        default: null,
                    },
                    alt: {
                        default: null,
                    },
                    title: {
                        default: null,
                    },
                    width: {
                        default: null,
                    },
                    data: {
                        default: null,
                        renderHTML: () => {
                            return null;
                        },
                    },
                    loading: {
                        default: false,
                        renderHTML: () => {
                            return null;
                        },
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'img[src]',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'img',
                    mergeAttributes(
                        this.options.HTMLAttributes,
                        HTMLAttributes,
                    ),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(ImageComponent);
            },
        });
    },
});

registerEditorExtension({
    type: EditorTypes.FULL,
    createInstance(ctx: EditorContext) {
        return Node.create<ImageOptions>({
            name: 'imageComponent',

            addOptions() {
                return {
                    ...this.parent?.(),
                    store: ctx.store,
                    inline: false,
                    HTMLAttributes: {},
                    documentId: ctx.config.image?.documentId || '',
                };
            },

            inline() {
                return this.options.inline;
            },

            group() {
                return this.options.inline ? 'inline' : 'block';
            },

            draggable: true,

            addAttributes() {
                return {
                    id: {
                        default: null,
                    },
                    src: {
                        default: null,
                    },
                    alt: {
                        default: null,
                    },
                    title: {
                        default: null,
                    },
                    width: {
                        default: null,
                    },
                    data: {
                        default: null,
                        renderHTML: () => {
                            return null;
                        },
                    },
                    loading: {
                        default: false,
                        renderHTML: () => {
                            return null;
                        },
                    },
                };
            },

            parseHTML() {
                return [
                    {
                        tag: 'image-component[id]',
                    },
                ];
            },

            renderHTML({ HTMLAttributes }) {
                return [
                    'image-component',
                    mergeAttributes(
                        this.options.HTMLAttributes,
                        HTMLAttributes,
                    ),
                ];
            },

            addCommands() {
                return {
                    setImage:
                        options =>
                        ({ tr, dispatch }) => {
                            const { selection } = tr;
                            const node = this.type.create(options);

                            if (dispatch) {
                                tr.replaceRangeWith(
                                    selection.from,
                                    selection.to,
                                    node,
                                );
                            }

                            return true;
                        },
                    uploadImage:
                        (files: File[]): Command =>
                        ({ editor }) => {
                            // called from autocomplete
                            handleImageUpload(
                                ctx,
                                files,
                                null,
                                editor.view,
                                this.options,
                            );
                            return true;
                        },
                    setImageDocumentId: (id: string) => () => {
                        this.options.documentId = id;
                        return true;
                    },
                };
            },

            addInputRules() {
                return [
                    nodeInputRule({
                        find: inputRegex,
                        type: this.type,
                        getAttributes: match => {
                            const [, , alt, src, title] = match;
                            const imageObj =
                                ctx.store.getters['image/bySrc'](src);
                            if (!imageObj) {
                                return { src, alt, title };
                            }
                            return imageObj;
                        },
                    }),
                ];
            },

            addNodeView() {
                return VueNodeViewRenderer(ImageComponent);
            },

            addProseMirrorPlugins() {
                const options = this.options as ImageOptions;

                return [
                    ImagePlaceholderPlugin,
                    new Plugin({
                        key: new PluginKey('image-d'),
                        props: {
                            handlePaste(view, event: ClipboardEvent) {
                                if (!event.clipboardData) {
                                    return false;
                                }
                                const items = Array.from(
                                    event.clipboardData?.items || [],
                                );
                                // called from paste
                                return handleImageUpload(
                                    ctx,
                                    items,
                                    event,
                                    view,
                                    options,
                                );
                            },
                            handleDrop(view, event) {
                                if (
                                    !isDragEvent(event) ||
                                    event.dataTransfer?.files?.length === 0
                                ) {
                                    return false;
                                }
                                const images = Array.from(
                                    event.dataTransfer?.files ?? [],
                                ).filter(file =>
                                    /image/i.test(file.type),
                                ) as File[];
                                // called by drop
                                return handleImageUpload(
                                    ctx,
                                    images,
                                    event,
                                    view,
                                    options,
                                    true,
                                );
                            },
                        },
                    }),
                ];
            },
        });
    },
});
