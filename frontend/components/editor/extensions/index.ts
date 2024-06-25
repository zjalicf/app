import { Node, Mark } from '@tiptap/pm/model';
import {
    EditorContext,
    ExtensionInterface,
    MarkSerializer,
    NodeSerializer,
    Serializer,
} from '~/@types/app';

export const extensions: ExtensionInterface[] = [];
export const nodeSerializers: NodeSerializer[] = [];
export const markSerializers: MarkSerializer[] = [];

export const registerEditorExtension = (extension: ExtensionInterface) => {
    extensions.push(extension);
};

export const registerNodeSerializer = (serializer: NodeSerializer) => {
    nodeSerializers.push(serializer);
};

export const registerMarkSerializer = (serializer: MarkSerializer) => {
    markSerializers.push(serializer);
};

export const getNodeSerializers = (ctx: EditorContext) => {
    return nodeSerializers.reduce(
        (acc: Record<string, Serializer<Node>>, serializer: NodeSerializer) => {
            return {
                ...acc,
                ...serializer(ctx),
            };
        },
        {} as Record<string, Serializer<Node>>,
    );
};

export const getMarkSerializers = (ctx: EditorContext) => {
    return markSerializers.reduce(
        (acc: Record<string, Serializer<Mark>>, serializer: MarkSerializer) => {
            return {
                ...acc,
                ...serializer(ctx),
            };
        },
        {} as Record<string, Serializer<Mark>>,
    );
};
