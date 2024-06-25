import { Context } from '@nuxt/types';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import { iconComponents } from './icon-components';
import {
    KEYBINDS,
    SHORTCUTS_ALIASES,
} from '~/plugins/shortcuts-manager/keybinds';
import { keyboardMap, keyToCode } from '~/plugins/shortcuts-manager/keyToCode';
import { registerShortcuts } from '~/plugins/shortcuts-manager/register';
import { SafeElectronWindow } from '~/@types';

type ShortcutNamespaceType =
    | 'global'
    | 'overview'
    | 'calendar'
    | 'sidebar'
    | 'header'
    | 'preferences'
    | 'always-active'
    | 'review-panel'
    | 'editor-inactive'
    | 'context-menu'
    | 'task-panel'
    | 'modal'
    | 'notifications'
    | 'review-dropdown'
    | 'view'
    | string;

const PriorityNamespaces = ['context-menu', 'notifications'];

type Shortcut = {
    keys: string;
    alias?: string;
    namespace: ShortcutNamespaceType;
    condition?: (context: Context) => boolean;
    fn: () => void;
};

type Keybind = {
    keybind: string | string[];
    namespace: string | string[];
    category: string;
    displayLabel?: string;
};

const defaultNamespaces = () => {
    return {
        global: false,
        overview: false,
        calendar: false,
        sidebar: false,
        header: false,
        preferences: false,
        'always-active': false,
        'review-panel': false,
        'editor-inactive': false,
        'context-menu': false,
        'task-panel': false,
        linear: false,
        view: false,
        modal: false,
        notifications: false,
    };
};

export class ShortcutsManager {
    private context: Context;
    private namespaces: Record<ShortcutNamespaceType, boolean> = {
        ...defaultNamespaces(),
        'editor-inactive': true,
    };

    public isRecording: boolean = false;

    private recordedKeybind: {
        keySet?: string[];
        keyString?: string;
        keybind?: string;
    } = {};

    private freezedNamespaces: Record<ShortcutNamespaceType, boolean>[] = [];
    private shortcuts: Record<string, Shortcut[]> = {};
    private platform: string;
    private inputFocused: boolean = false;
    private editorActiveNamespaces = ['review-panel', 'editor-inactive'];

    public customKeybinds: Partial<
        Record<SHORTCUTS_ALIASES, Pick<Keybind, 'keybind'>>
    > = {};

    constructor(ctx: Context) {
        this.context = ctx;

        const customKeybinds = this.context.$appStorage.get('customKeybinds');
        if (customKeybinds) {
            this.customKeybinds = JSON.parse(customKeybinds || '{}');
        }
        document.addEventListener('focusin', (event: FocusEvent) => {
            const target = event.target as any;
            const tag = target?.tagName.toLowerCase();
            const cssClass = target.className;
            if (
                !['input', 'textarea'].includes(tag) &&
                !(tag === 'div' && cssClass === 'cm-content')
            ) {
                return;
            }
            this.inputFocused = true;
        });

        document.addEventListener('focusout', (event: FocusEvent) => {
            let target = event.target as any;
            const targetIsDocument = target.nodeName === '#document';
            const relatedTargetIsInput = ['input', 'textarea'].includes(
                (event?.relatedTarget as any)?.tagName?.toLowerCase(),
            );
            if (targetIsDocument && relatedTargetIsInput) {
                target = event.relatedTarget as any;
            }
            const tag = target?.tagName?.toLowerCase();
            const cssClass = target?.className;
            if (
                !['input', 'textarea'].includes(tag) &&
                !(tag === 'div' && cssClass === 'cm-content')
            ) {
                return;
            }
            this.inputFocused = false;
        });

        this.registerKeydownListener();
        this.registerMouseButtonListener();
        this.enableNamespace('always-active');
        this.platform = this.getPlatform();
    }

    get modalOpened() {
        return this.context.$vfm.openedModals.length > 0;
    }

    get availableShortcuts(): typeof SHORTCUTS_ALIASES {
        return SHORTCUTS_ALIASES;
    }

    get keybinds(): typeof KEYBINDS {
        const keybinds = { ...KEYBINDS } as Record<SHORTCUTS_ALIASES, Keybind>;
        const customKeybindKeys = Object.keys(
            this.customKeybinds,
        ) as SHORTCUTS_ALIASES[];

        for (const key of customKeybindKeys) {
            keybinds[key] = {
                ...keybinds[key],
                keybind: this.customKeybinds[key]!.keybind,
            };
        }

        return keybinds;
    }

    get recording(): any {
        return { ...this.recordedKeybind };
    }

    setRecording(value: boolean) {
        this.isRecording = value;
    }

    get currentNamespaces() {
        return this.namespaces;
    }

    clear() {
        this.shortcuts = {};
        this.namespaces = {};
    }

    initialize() {
        this.enableNamespace('editor-inactive');
        this.enableNamespace('always-active');
        registerShortcuts(this, this.context);
    }

    enableNamespace(namespace: ShortcutNamespaceType, isPriority = false) {
        if (this.namespaces[namespace]) return;
        if (isPriority) {
            this.freezedNamespaces.push({
                ...this.namespaces,
            });
            this.namespaces = {
                ...defaultNamespaces(),
                'editor-inactive': true,
                'always-active': true,
            };
        }
        this.namespaces[namespace] = true;
    }

    disableNamespace(namespace: ShortcutNamespaceType, isPriority = false) {
        if (isPriority) {
            const lastNamespace = this.freezedNamespaces.pop() ?? {
                ...this.namespaces,
            };
            this.namespaces = { ...lastNamespace };
        }
        this.namespaces[namespace] = false;
    }

    registerShortcut(
        alias: SHORTCUTS_ALIASES | SHORTCUTS_ALIASES[],
        fn: () => void,
    ) {
        if (isArray(alias)) {
            alias.forEach(als => this.registerAlias(als, fn));
            return;
        }
        this.registerAlias(alias, fn);
    }

    isShortcutRegistered(alias: SHORTCUTS_ALIASES) {
        const keys = this.keybinds[alias];
        if (!keys || !keys.keybind) return false;
        if (!Array.isArray(keys.keybind)) {
            keys.keybind = [keys.keybind];
        }

        return keys.keybind.reduce((acc: boolean, keybind: string) => {
            const keyString = this.createKeyString(
                keybind.split('+').map((v: string) => v.toLowerCase().trim()),
            );
            return (
                (acc ||
                    this.shortcuts[keyString]?.some(
                        ({ alias: _alias }) => alias === _alias,
                    )) ??
                false
            );
        }, false);
    }

    removeShortcut(...alias: SHORTCUTS_ALIASES[]) {
        if (!isArray(alias)) {
            alias = [alias];
        }

        for (const als of alias) {
            const keys = this.keybinds[als];

            if (!keys || !keys.keybind) return;
            if (Array.isArray(keys.keybind)) {
                keys.keybind.forEach((keybind: string) => {
                    const keyString = this.createKeyString(
                        keybind
                            .split('+')
                            .map((v: string) => v.toLowerCase().trim()),
                    );
                    if (!this.shortcuts[keyString]) return;
                    this.shortcuts[keyString] = this.shortcuts[
                        keyString
                    ].filter(shortcut => shortcut.alias !== als);
                });
                return;
            }
            const keyString = this.createKeyString(
                keys.keybind
                    .split('+')
                    .map((v: string) => v.toLowerCase().trim()),
            );
            if (!this.shortcuts[keyString]) return;

            this.shortcuts[keyString] = this.shortcuts[keyString].filter(
                shortcut => shortcut.alias !== als,
            );
        }
    }

    getTooltipKeys(keybind: string) {
        let keys = keybind;
        if (this.context.$config.os === 'mac') {
            if (keys.includes('meta')) {
                keys = keys.replace('meta', 'cmd');
            }
        }
        if (this.context.$config.os !== 'mac') {
            if (keys.includes('meta')) {
                keys = keys.replace('meta', 'ctrl');
            }
        }

        return keys.split('+');
    }

    getShortcutTooltipString(alias: SHORTCUTS_ALIASES, customTitle?: string) {
        const titleCase = (str: string): string => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        };
        let code = this.keybinds[alias].keybind as string;

        if (Array.isArray(code)) {
            code = code[0];
        }
        if (!code) return '';

        const shortCutString = code
            .split('+')
            .map(el => {
                if (this.platform === 'mac') {
                    const allowedMacIson = [
                        'ctrl',
                        'alt',
                        'shift',
                        'arrowdown',
                        'arrowup',
                        'arrowleft',
                        'arrowright',
                        'backspace',
                    ];

                    if (allowedMacIson.includes(el)) {
                        return iconComponents[el]?.html;
                    }

                    if (el === 'meta') {
                        return iconComponents.cmd.html;
                    }
                }

                if (this.platform !== 'mac') {
                    const allowedIcons = [
                        'arrowdown',
                        'arrowup',
                        'arrowleft',
                        'arrowright',
                    ];

                    if (allowedIcons.includes(el)) {
                        return iconComponents[el]?.html;
                    }

                    if (el === 'meta') {
                        return 'ctrl';
                    }
                }

                return el;
            })
            .map(el => {
                return `<span class='tooltip-button'>${titleCase(el)}</span>`;
            })
            .join(' ');
        const name = alias
            ?.split(':')
            ?.pop()
            ?.split(' ')
            .map(titleCase)
            .join(' ');
        return `<div class='tooltip'>${
            customTitle ?? name
        }<span class='tooltip-divider'></span>${shortCutString}</span></div>`;
    }

    private isPriorityNamespace(namespace: string) {
        return PriorityNamespaces.includes(namespace);
    }

    private isEditorActive(namespace: string) {
        return (
            this.editorActiveNamespaces.includes(namespace) &&
            (this.context.store.getters.editorFocused || this.inputFocused)
        );
    }

    private registerAlias(alias: SHORTCUTS_ALIASES, fn: () => void) {
        const shortcutKeys = this.keybinds[alias];
        if (!shortcutKeys || !shortcutKeys.keybind) return;
        if (
            shortcutKeys.notAllowed &&
            (shortcutKeys.notAllowed.includes(this.context.$config.platform) ||
                shortcutKeys.notAllowed.includes(this.context.$config.os))
        )
            return;

        const assignShortcut = (shortcut: Shortcut) => {
            if (!Array.isArray(this.shortcuts[shortcut.keys])) {
                this.shortcuts[shortcut.keys] = [];
            }
            const exists = this.shortcuts[shortcut.keys].find(
                ({ alias }) => alias === shortcut.alias,
            );
            if (exists) {
                this.shortcuts[shortcut.keys] = this.shortcuts[
                    shortcut.keys
                ].filter(({ alias }) => alias !== shortcut.alias);
            }
            this.shortcuts[shortcut.keys].unshift(shortcut);
        };

        if (isArray(shortcutKeys.keybind)) {
            shortcutKeys.keybind.forEach((keybind: string) => {
                assignShortcut(
                    this.createShortcut(
                        keybind,
                        fn,
                        shortcutKeys.namespace,
                        alias,
                        shortcutKeys.condition,
                    ),
                );
            });
            return;
        }
        assignShortcut(
            this.createShortcut(
                shortcutKeys.keybind,
                fn,
                shortcutKeys.namespace,
                alias,
                shortcutKeys.condition,
            ),
        );
    }

    private createShortcut(
        keys: string,
        fn: () => void,
        namespace?: string,
        alias?: string,
        condition?: (context: Context) => boolean,
    ): Shortcut {
        const keyString = this.createKeyString(
            keys.split('+').map(v => v.toLowerCase()),
        );
        const payload = {
            keys: keyString,
            fn,
            alias,
            namespace,
            condition: condition || (() => true),
        };
        if (!namespace) {
            payload.namespace = 'global';
        }
        return payload as Shortcut;
    }

    private getPlatform() {
        if (this.context.$config.os === 'web') {
            let os = 'other';
            if (navigator.appVersion.includes('Win')) os = 'windows';
            if (navigator.appVersion.includes('Mac')) os = 'mac';
            if (navigator.appVersion.includes('Linux')) os = 'linux';
            return os;
        }
        return this.context.$config.os;
    }

    invokeShortcutManual(name: string) {
        const keyString = Object.keys(this.shortcuts).find(key =>
            this.shortcuts[key].some(s => s.alias === name),
        );
        const shortcuts = this.shortcuts[keyString!];
        this.evaluateShortcuts(shortcuts);
    }

    private registerKeydownListener() {
        const forbiddenKeybinds = [
            'escape',
            'enter',
            'shift+enter',
            'meta+w',
            'ctrl+w',
            'meta+q',
            'ctrl+q',
        ];
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!event.code) return;

            if (this.isRecording) {
                const keySet = this.parseKeySet(event, false);
                if (keySet.includes('esc')) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.setRecording(false);
                }
                if (forbiddenKeybinds.includes(keySet.join('+'))) return;
                event.preventDefault();
                event.stopPropagation();
                this.recordKeybinds(event);
                return;
            }

            const keySet = this.parseKeySet(event);
            const keyString = this.createKeyString(keySet);
            const shortcuts = this.getEnabledShortcuts(keyString);

            if (!shortcuts.length) return;
            event.preventDefault();
            event.stopPropagation();
            this.evaluateShortcuts(shortcuts);
        });
    }

    private registerMouseButtonListener() {
        document.addEventListener('mouseup', (event: MouseEvent) => {
            const keySet = [];
            if (event.button === 3) {
                event.preventDefault();
                event.stopPropagation();
                keySet.push('mousebutton4');
            }
            if (event.button === 4) {
                event.preventDefault();
                event.stopPropagation();
                keySet.push('mousebutton5');
            }

            const keyString = this.createKeyString(keySet);
            const shortcuts = this.getEnabledShortcuts(keyString);
            if (!shortcuts.length) return;
            event.preventDefault();
            event.stopPropagation();
            this.evaluateShortcuts(shortcuts);
        });
    }

    private getEnabledShortcuts(keyString: string): Shortcut[] {
        return (
            this.shortcuts[keyString.toLowerCase()]?.reduce(
                (acc: Shortcut[], shortcut: Shortcut) => {
                    if (!shortcut) return acc;

                    let namespacesEnabled: boolean;
                    let editorActive: boolean;

                    let namespaces: string | string[] = shortcut.namespace;
                    if (!isArray(namespaces)) {
                        namespaces = [namespaces];
                    }

                    const alwaysActive = namespaces
                        .join(' ')
                        .includes('always-active');

                    const modalNamespace = namespaces
                        .join(' ')
                        .includes('modal');

                    if (alwaysActive) {
                        return [...acc, shortcut];
                    }

                    if (!alwaysActive && this.modalOpened && !modalNamespace) {
                        return acc;
                    }

                    if (isArray(shortcut.namespace)) {
                        namespacesEnabled = shortcut.namespace.some(
                            namespace => {
                                const namespaceSplit = namespace.split('&');
                                return namespaceSplit.every(
                                    (n: string) => this.namespaces[n.trim()],
                                );
                            },
                        );
                    } else {
                        const namespaceSplit = shortcut.namespace.split('&');
                        namespacesEnabled = namespaceSplit.every(
                            namespace => this.namespaces[namespace.trim()],
                        );
                    }

                    if (isArray(shortcut.namespace)) {
                        editorActive = shortcut.namespace.some(namespace => {
                            const namespaceSplit = namespace.split('&');
                            return namespaceSplit.some((n: string) =>
                                this.isEditorActive(n.trim()),
                            );
                        });
                    } else {
                        const namespaceSplit = shortcut.namespace.split('&');
                        editorActive = namespaceSplit.some(namespace =>
                            this.isEditorActive(namespace.trim()),
                        );
                    }
                    if (!namespacesEnabled || editorActive) return acc;
                    return [...acc, shortcut];
                },
                [] as Shortcut[],
            ) ?? []
        );
    }

    private evaluateShortcuts(shortcuts: Shortcut[]) {
        shortcuts?.forEach(shortcut => {
            if (shortcut && shortcut.condition?.(this.context)) {
                shortcut.fn();
            }
        });
    }

    existingKeybind(query: string) {
        const existingKeybinds = Object.entries(this.keybinds);
        for (const [shortcut, { keybind }] of existingKeybinds) {
            let keybindStrings = keybind;
            if (!isArray(keybindStrings)) {
                keybindStrings = [keybindStrings];
            }
            if (keybindStrings.includes(query)) {
                return shortcut;
            }
        }
        return null;
    }

    recordKeybinds(event: KeyboardEvent) {
        const keySet = this.parseKeySet(event, false);
        this.recordedKeybind = {
            keySet,
            keyString: this.createKeyString(keySet),
            keybind: this.createKeyString(keySet, false),
        };
    }

    saveKeybinds() {
        this.context.$appStorage.set(
            'customKeybinds',
            JSON.stringify(this.customKeybinds),
        );
    }

    private handleSystemShortcutsChanged(
        shortcut: SHORTCUTS_ALIASES,
        keybind: any,
        previous: any,
    ) {
        if (shortcut === SHORTCUTS_ALIASES.QUICK_CAPTURE) {
            (window as SafeElectronWindow)?.electron?.setQCShortcut?.(
                previous,
                keybind,
            );
        }
    }

    setCustomKeybinds(shortcut: SHORTCUTS_ALIASES, keybind: any) {
        const existingKeybind = this.existingKeybind(keybind.keybind!);
        this.recordedKeybind = {};
        let shortcutArray: any;
        if (this.keybinds[shortcut]) {
            const previousKeybind = { ...this.keybinds[shortcut] };
            if (this.keybinds[shortcut].category === 'system-shortcuts') {
                this.handleSystemShortcutsChanged(
                    shortcut,
                    keybind.keybind,
                    previousKeybind.keybind,
                );
            }
            if (!isArray(previousKeybind.keybind)) {
                previousKeybind.keybind = [previousKeybind.keybind];
            }
            for (const prevKeybind of previousKeybind.keybind) {
                const previousKeyString = this.createKeyString(
                    prevKeybind?.split('+'),
                );
                this.customKeybinds = {
                    ...this.customKeybinds,
                    [shortcut]: keybind,
                };
                if (this.shortcuts[previousKeyString]) {
                    shortcutArray = [...this.shortcuts[previousKeyString]];
                    delete this.shortcuts[previousKeyString];
                }
            }
        }
        if (shortcutArray) {
            this.shortcuts[keybind.keyString!] = shortcutArray;
        }
        if (existingKeybind && existingKeybind !== shortcut) {
            this.customKeybinds = {
                ...this.customKeybinds,
                [existingKeybind]: { keybind: '', keyString: '' },
            };
        }
        this.saveKeybinds();
    }

    clearCustomShortcuts() {
        const customShortcutsKeys = Object.keys(
            this.customKeybinds,
        ) as SHORTCUTS_ALIASES[];
        for (const key of customShortcutsKeys) {
            const defaults = { ...KEYBINDS[key] };
            if (isUndefined(this.customKeybinds[key]!.keybind)) continue;
            const previousKeyString = this.createKeyString(
                (this.customKeybinds[key]!.keybind as string).split('+'),
            );
            if (this.keybinds[key].category === 'system-shortcuts') {
                this.handleSystemShortcutsChanged(
                    key,
                    defaults.keybind,
                    this.customKeybinds[key]!.keybind as string,
                );
            }
            const shortcutArray = this.shortcuts[previousKeyString]
                ? [...this.shortcuts[previousKeyString]]
                : null;
            if (!isArray(defaults.keybind)) {
                defaults.keybind = [defaults.keybind];
            }
            if (shortcutArray) {
                delete this.shortcuts[previousKeyString];
                for (const keybind of defaults.keybind) {
                    const keyString = this.createKeyString(keybind.split('+'));
                    this.shortcuts[keyString] = shortcutArray;
                }
            }
        }
        this.customKeybinds = {};
        this.saveKeybinds();
    }

    private createKeyString(keys: string[], replace = true): string {
        let shortcutKeys = [...keys];

        if (
            this.platform !== 'mac' &&
            shortcutKeys.includes('meta') &&
            !shortcutKeys.includes('ctrl')
        ) {
            shortcutKeys = shortcutKeys.map(key =>
                key === 'meta' ? 'ctrl' : key,
            );
        }
        const keySet = new Set(shortcutKeys);
        const output = [];

        const keyOrder = ['meta', 'ctrl', 'alt', 'shift'];
        for (const key of keyOrder) {
            if (keySet.has(key)) {
                output.push(key);
                keySet.delete(key);
            }
        }
        output.push(...keySet);
        return shortcutKeys
            .map(key => {
                if (replace && key in keyToCode) {
                    return keyToCode[key].toLowerCase();
                }
                return key;
            })
            .join('+');
    }

    public parseKeySet(event: KeyboardEvent, useCode = true) {
        let keyCode = keyboardMap[event.keyCode] ?? null;
        if (!keyCode) {
            keyCode = String.fromCharCode(event.keyCode).toLowerCase();
        }
        const code =
            keyToCode[keyCode]?.toLowerCase() ?? event.code?.toLowerCase();

        const keySet = new Set([useCode ? code : keyCode]);

        event.ctrlKey && keySet.add('ctrl');
        event.shiftKey && keySet.add('shift');
        event.altKey && keySet.add('alt');
        event.metaKey && keySet.add('meta');

        const output = [];

        const keyOrder = ['meta', 'ctrl', 'alt', 'shift'];
        for (const key of keyOrder) {
            if (keySet.has(key)) {
                output.push(key);
                keySet.delete(key);
            }
        }
        output.push(...keySet.values());

        return output;
    }

    exportCustomShortcuts() {
        const shortcutJSON = JSON.stringify(this.customKeybinds);
        return btoa(`[acr-shortcuts]:${shortcutJSON}`);
    }

    validateCustomShortcutsString(dataString: string) {
        try {
            const rawString = atob(dataString);
            const [identifier] = rawString.split(':', 1);
            const data = rawString.replace('[acr-shortcuts]:', '');
            return identifier === '[acr-shortcuts]' && JSON.parse(data);
        } catch (e) {
            return false;
        }
    }

    importCustomShortcuts(dataString: string) {
        if (!this.validateCustomShortcutsString(dataString)) return;
        const rawString = atob(dataString.trim());
        const [identifier] = rawString.split(':', 1);
        if (identifier !== '[acr-shortcuts]') return;
        const data = rawString.replace('[acr-shortcuts]:', '');
        try {
            const customShortcuts = JSON.parse(data);
            const entries = Object.entries(customShortcuts);
            for (const [shortcut, keybinds] of entries) {
                this.setCustomKeybinds(
                    shortcut as SHORTCUTS_ALIASES,
                    keybinds as any,
                );
            }
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: 'Keybinds configuration imported',
                },
            });
        } catch (e) {
            console.log(e);
        }
    }
}
