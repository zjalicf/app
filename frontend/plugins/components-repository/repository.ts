import { Context } from '@nuxt/types';

export type ComponentType =
    | 'document'
    | 'event'
    | 'task'
    | 'jira_issue'
    | 'google_calendar'
    | 'my_day'
    | 'url'
    | 'linear'
    | string;
export type ItemFns = (context: Context, tabId: string) => () => Promise<any>;

export type RecordFns = (
    context: Context,
    tabId: string,
) => Record<string, any>;

export type RepositoryItem = Record<string, ItemFns | RecordFns>;

export class ComponentsRegistry {
    private context!: Context;
    private fallbackType!: ComponentType;
    private repository: Partial<Record<ComponentType, RepositoryItem>> = {};

    initialize(context: Context) {
        this.context = context;
        this.fallbackType = 'document';
    }

    add(type: ComponentType, componentsObject: RepositoryItem) {
        this.repository[type] = componentsObject;
    }

    get(type: ComponentType) {
        return this.repository[type] ?? this.repository.document;
    }

    getTitle(type: ComponentType, tabId: string) {
        return (
            this.get(type)?.title?.(this.context, tabId) ??
            this.get(this.fallbackType)?.title?.(this.context, tabId)
        );
    }

    getEditorPlaceholder(type: ComponentType, tabId: string) {
        return (
            this.get(type)?.editorPlaceholder?.(this.context, tabId) ??
            this.get(this.fallbackType)?.editorPlaceholder?.(
                this.context,
                tabId,
            )
        );
    }

    getPanel(type: ComponentType, tabId: string) {
        return (
            this.get(type)?.panel?.(this.context, tabId) ??
            this.get(this.fallbackType)?.panel?.(this.context, tabId)
        );
    }

    getExtendedProperties(type: ComponentType, tabId: string) {
        return (
            this.get(type)?.extendedProperties?.(this.context, tabId) ??
            this.get(this.fallbackType)?.extendedProperties?.(
                this.context,
                tabId,
            )
        );
    }

    getControls(type: ComponentType, tabId: string) {
        return (
            this.get(type)?.controls?.(this.context, tabId) ??
            this.get(this.fallbackType)?.controls?.(this.context, tabId) ??
            null
        );
    }

    newTabConfig(
        type: ComponentType,
        tabId: string,
    ): Record<string, any> | undefined {
        return (this.get(type)?.newTabConfig as RecordFns)?.(
            this.context,
            tabId,
        );
    }
}
