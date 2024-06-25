const fs = require('fs');
const path = require('path');
const WATCHER_TIMEOUT = 3000;
// @ts-ignore
const driver = require('webdriverio');

class AppControls {
    service: any;

    constructor(service: any) {
        this.service = service;
    }

    async getElement(name: string, ensureUnique: boolean = false) {
        if (ensureUnique) {
            const elements = await this.service.browser.$$(
                `[data-e2e="${name}"]`,
            );
            if (elements.length > 1) {
                throw new Error(`Multiple elements found for ${name}`);
            }
            return elements[0];
        }

        return await this.service.browser.$(`[data-e2e="${name}"]`);
    }

    async rightClick(selector: string) {
        const element = await this.service.browser.$(
            `[data-e2e="${selector}"]`,
        );
        await element.waitForClickable({ timeout: 2000 });
        await element.click({ button: 'right' });
    }

    async click(selector: string) {
        const element = await this.service.browser.$(
            `[data-e2e="${selector}"]`,
        );
        await element.waitForClickable({ timeout: 2000 });
        await element.click();
    }

    async ctrlA() {
        await this.service.browser.keys([driver.Key.Ctrl, 'a']);
        await this.service.browser.pause(300);
    }

    async elementExists(name: string, ensureUnique: boolean = true) {
        if (ensureUnique) {
            const elements = await this.service.browser.$$(
                `[data-e2e="${name}"]`,
            );
            return elements.length === 1 && (await elements[0].isExisting());
        }

        const element = await this.service.browser.$(`[data-e2e="${name}"]`);
        return await element.isExisting();
    }

    async openAllPages() {
        await this.click('navigate-all-pages');
    }

    async openMyDay() {
        await this.click('navigate-my-day');
    }

    async openReview() {
        await this.click('task-review-trigger');
    }

    async closeReview() {
        await this.service.browser.keys(['Escape']);
    }

    async openConvertMenu() {
        await this.click('convert-to-trigger');
    }

    async selectConvertToTask() {
        await this.click('convert-to-task');
    }

    async openMyDaySpecific(diffInDays: number) {
        await this.openMyDay();
        if (diffInDays === 0) return;
        if (diffInDays > 0) {
            await this.navigateMyDayForward(diffInDays);
        } else {
            await this.navigateMyDayBackward(diffInDays);
        }
    }

    async navigateMyDayForward(numDays: number) {
        for (let i = 0; i < numDays; i++) {
            await this.click('my-day-next');
        }
    }

    async navigateMyDayBackward(numDays: number) {
        for (let i = 0; i > numDays; i--) {
            await this.click('my-day-previous');
        }
    }

    async openArchive() {
        await this.openAllPages();
        await this.click('all-pages-selector');
        await this.click('page-switch-archive');
    }

    async openSettings(
        tab?:
            | 'My Account'
            | 'Preferences'
            | 'Keybinds'
            | 'Appearance'
            | 'Overview'
            | 'Calendars'
            | 'Notifications'
            | 'Labels'
            | 'Templates'
            | 'Assistant'
            | 'Jira',
    ) {
        await this.click('workspace-selector');
        await this.click('workspace-selector-preferences');

        if (tab) {
            await this.click(`settings-${tab}`);
        }
    }
}

class MyDayUtils {
    service: any;
    controls: AppControls;

    constructor(service: any, controls: AppControls) {
        this.service = service;
        this.controls = controls;
    }
}

class TaskUtils {
    service: any;
    controls: AppControls;
    pageUtils: PageUtils;

    constructor(service: any, controls: AppControls) {
        this.service = service;
        this.controls = controls;
        this.pageUtils = new PageUtils(service, controls);
    }

    async createTask(text: string) {
        await this.controls.click('editor-instance');
        // hack when first item is task
        await this.service.browser.keys('ArrowDown');
        // invoke autocomplete
        await this.service.browser.keys('/');
        // select task
        await this.controls.click('autocomplete-Task');
        await this.service.browser.keys(text);
        // allow for nlp to go through
        // accept suggestion
        await this.service.browser.keys(driver.Key.Enter);
        await this.service.browser.keys(driver.Key.Enter);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async existsInPage(taskText: string, pageName: string) {
        await this.pageUtils.openPage(pageName);
        const task = await this.service.browser.$(
            `.ProseMirror [data-e2e="task-${taskText}"]`,
        );
        return await task.isExisting();
    }

    async existsInMyDay(text: string, deltaDays: number) {
        await this.controls.openMyDaySpecific(deltaDays);
        const task = await this.service.browser.$(
            `.ProseMirror [data-e2e="task-${text}"]`,
        );
        return await task.isExisting();
    }

    async existsInAgenda(text: string, deltaDays: number) {
        await this.controls.openMyDaySpecific(deltaDays);
        const task = await this.service.browser.$(
            `.task-review [data-e2e="task-${text}"]`,
        );
        return await task.isExisting();
    }

    async scheduleFromReview(taskName: string, deltaDays: number) {
        const scheduleButton =
            deltaDays === -1
                ? 'task-schedule-picker-this-day'
                : deltaDays === 0
                ? 'task-schedule-picker-today'
                : deltaDays === 1
                ? 'task-schedule-picker-tomorrow'
                : 'task-schedule-picker-monday';
        await this.controls.click(`task-schedule-${taskName}`);
        await this.controls.click(scheduleButton);
    }

    async scheduleContextMenu(taskName: string, deltaDays: number) {
        const scheduleButton =
            deltaDays === 0
                ? 'task-context-picker-today'
                : deltaDays === 1
                ? 'task-context-picker-tomorrow'
                : 'task-context-picker-monday';
        await this.controls.rightClick(`task-${taskName}`);
        await this.controls.click(scheduleButton);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }
}

class LabelUtils {
    service: any;
    controls: AppControls;
    pageUtils: PageUtils;

    constructor(service: any, controls: AppControls) {
        this.service = service;
        this.controls = controls;
        this.pageUtils = new PageUtils(service, controls);
    }

    async existsInPage(labelName: string, pageName: string) {
        await this.pageUtils.openPage(pageName);
        const label = await this.service.browser.$(
            `.ProseMirror [data-label="${labelName}"]`,
        );
        return await label.isExisting();
    }

    async existsInSettings(labelName: string) {
        await this.controls.openSettings('Labels');
        const label = await this.service.browser.$(
            `[data-e2e="label-${labelName}"].label-editor`,
        );
        const exists = await label.isExisting();
        await this.service.browser.keys(['Escape']);
        return exists;
    }
}

class PageUtils {
    service: any;
    controls: AppControls;

    constructor(service: any, controls: AppControls) {
        this.service = service;
        this.controls = controls;
    }

    async getPage(title: string) {
        await this.openPage(title);
        const editor = await this.controls.getElement('editor-instance');
        const content = await editor.getText();

        return {
            title,
            content,
        };
    }

    async createPage(title: string, content: string) {
        await this.controls.click('new-page');
        await this.controls.click('page-title-editor');
        await this.service.browser.keys(title);
        await this.controls.click('editor-instance');
        await this.service.browser.keys(content);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async isArchived(title: string) {
        await this.controls.openArchive();
        return await this.controls.elementExists(`card-${title}`);
    }

    async pageExists(title: string, ensureUnique: boolean = true) {
        return await this.controls.elementExists(`page-${title}`, ensureUnique);
    }

    async openPage(title: string) {
        await this.controls.click(`page-${title}`);
    }

    async renamePage(oldTitle: string, newTitle: string) {
        await this.openPage(oldTitle);
        await this.controls.click('page-title-editor');
        await this.controls.ctrlA();
        await this.service.browser.keys(newTitle);
        await this.service.browser.keys(['Escape']);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async archivePage(title) {
        await this.openPage(title);
        await this.controls.click('page-title-options');
        await this.controls.click('document-context-menu-archive');
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async replaceCurrentContent(content: string) {
        await this.controls.click('editor-instance');
        await this.controls.ctrlA();
        await this.service.browser.keys(content);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async replaceContent(title: string, content: string) {
        await this.openPage(title);
        await this.controls.click('editor-instance');
        await this.controls.ctrlA();
        await this.service.browser.keys(content);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async appendContent(title: string, content: string) {
        await this.openPage(title);
        await this.controls.click('editor-instance');
        await this.service.browser.keys(['End']);
        await this.service.browser.keys(content);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async prependContent(title: string, content: string) {
        await this.openPage(title);
        await this.controls.click('editor-instance');
        await this.service.browser.keys(['Home']);
        await this.service.browser.keys(content);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async moveToFolder(title: string, folder: string) {
        const page = await this.controls.getElement(`page-${title}`);
        const target = await this.controls.getElement(`folder-${folder}`);
        await page.dragAndDrop(target, { duration: 300 });

        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async pageExistsInFolder(renamedPage: string, renamedFolder: string) {
        const element = await this.service.browser.$(
            `[data-e2e="sidebar-item-${renamedFolder}"] [data-e2e="page-${renamedPage}"]`,
        );
        return await element.isExisting();
    }

    async labelInPageExists(page: string, labelName: string) {
        await this.openPage(page);
        const label = await this.service.browser.$(
            `.ProseMirror [data-e2e="label-page-${labelName}"]`,
        );
        return await label.isExisting();
    }
}

class FolderUtils {
    service: any;
    controls: AppControls;

    constructor(service: any, controls: AppControls) {
        this.service = service;
        this.controls = controls;
    }

    async createFolder(title: string) {
        await this.controls.click('new-folder');
        await this.service.browser.pause(1000);
        await this.service.browser.keys(title);
        await this.service.browser.keys(['Enter']);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async folderExists(title: string) {
        return await this.controls.elementExists(`folder-${title}`);
    }

    async toggleFolder(title: string) {
        await this.controls.click(`folder-${title}`);
    }

    async renameFolder(oldTitle: string, newTitle: string) {
        await this.controls.rightClick(`folder-${oldTitle}`);
        await this.controls.click('folder-context-menu-rename');
        await this.service.browser.pause(1000);
        await this.controls.ctrlA();
        await this.service.browser.keys(newTitle);
        await this.service.browser.keys(['Enter']);
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }
}

class LocalVaultDataUtils {
    service: any;
    vaultPath: string | null;

    constructor(service: any) {
        this.service = service;
        this.vaultPath = null;
    }

    setVaultPath(path: string) {
        this.vaultPath = path;
    }

    isArchived(title: string) {
        return fs.existsSync(
            path.join(this.vaultPath, '.trash', `${title}.md`),
        );
    }

    pageExists(title: string) {
        return fs.existsSync(path.join(this.vaultPath, `${title}.md`));
    }

    async createPage(title: string, content: string) {
        fs.writeFileSync(
            path.join(this.vaultPath, `${title}.md`),
            content,
            'utf-8',
        );
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    getPage(title: string) {
        const pagePath = path.join(this.vaultPath, `${title}.md`);
        const content = fs.readFileSync(pagePath, 'utf-8');

        return {
            name: `${title}.md`,
            path: pagePath,
            content,
        };
    }

    async replaceContent(title: string, content: string) {
        fs.writeFileSync(
            path.join(this.vaultPath, `${title}.md`),
            content,
            'utf-8',
        );
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    folderExists(title: string) {
        return fs.existsSync(path.join(this.vaultPath, title));
    }

    async createFolder(title: string) {
        fs.mkdirSync(path.join(this.vaultPath, title));
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async renamePage(oldTitle: string, newTitle: string) {
        fs.renameSync(
            path.join(this.vaultPath, `${oldTitle}.md`),
            path.join(this.vaultPath, `${newTitle}.md`),
        );
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    async renameFolder(oldTitle: string, newTitle: string) {
        fs.renameSync(
            path.join(this.vaultPath, oldTitle),
            path.join(this.vaultPath, newTitle),
        );
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }

    pageExistsInFolder(renamedPage: string, renamedFolder: string) {
        return fs.existsSync(
            path.join(this.vaultPath, renamedFolder, `${renamedPage}.md`),
        );
    }

    async moveToFolder(title: string, folder: string) {
        fs.renameSync(
            path.join(this.vaultPath, `${title}.md`),
            path.join(this.vaultPath, folder, `${title}.md`),
        );
        await this.service.browser.pause(WATCHER_TIMEOUT);
    }
}

class TestUtils {
    service: any;
    context: any;
    vaultPath: string | null;
    pageUtils: PageUtils;
    localVault: LocalVaultDataUtils;
    controls: AppControls;
    folderUtils: FolderUtils;
    labelUtils: LabelUtils;
    taskUtils: TaskUtils;
    myDayUtils: MyDayUtils;

    constructor(service: any, context: any) {
        this.service = service;
        this.context = context;
        this.vaultPath = null;
        this.controls = new AppControls(service);
        this.pageUtils = new PageUtils(service, this.controls);
        this.folderUtils = new FolderUtils(service, this.controls);
        this.labelUtils = new LabelUtils(service, this.controls);
        this.localVault = new LocalVaultDataUtils(service);
        this.taskUtils = new TaskUtils(service, this.controls);
        this.myDayUtils = new MyDayUtils(service, this.controls);
    }

    async initializeVaultPath() {
        const testTitle = this.context.title;
        const TEST_VAULT_FOLDER = `/temp-vault-${testTitle}`;
        const tempPath = await this.service.browser.electron.app(
            'getPath',
            'documents',
        );
        this.vaultPath = tempPath + TEST_VAULT_FOLDER;
        this.localVault.setVaultPath(this.vaultPath);
    }

    async setupVault() {
        await this.initializeVaultPath();
        await this.service.browser.execute(p => {
            // @ts-ignore
            window.__test_path = p;
        }, this.vaultPath);

        fs.rmSync(this.vaultPath, { recursive: true, force: true });
        fs.mkdirSync(this.vaultPath);
        fs.cpSync(
            path.join(__dirname, '../fixtures/vault-data'),
            this.vaultPath,
            { recursive: true },
        );
    }

    async createAndOpenVault() {
        const noAccount = this.service.browser.$(`[data-e2e="no-account"]`);
        await noAccount.waitForDisplayed();
        await this.controls.click('no-account');
        await this.controls.click('create-vault-data');
        await this.controls.click('acreom-cloud-skip');
        await this.controls.click('onboarding-skip');
    }
}

module.exports = {
    TestUtils,
};
