import { Context, Plugin } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';
import { LinearController } from './linear';
import { PageController } from '~/plugins/entities/page';
import { EventController } from '~/plugins/entities/event';
import { LabelController } from '~/plugins/entities/label';
import { TaskController } from '~/plugins/entities/task';
import { VaultController } from '~/plugins/entities/vault';
import { GithubController } from '~/plugins/entities/github';
import { JiraController } from '~/plugins/entities/jira';
import { AutoUpdaterController } from '~/plugins/entities/auto-updater';
import { IcsIntegrationController } from '~/plugins/entities/ics-integration';
import { AssistantController } from '~/plugins/entities/assistant';
import { TabController } from '~/plugins/entities/tab';
import { ViewController } from '~/plugins/entities/view';
import { AppleCalendarController } from '~/plugins/entities/apple-calendar';
import { VersionsController } from '~/plugins/entities/versions';
import { MyDayController } from '~/plugins/entities/my-day';
import { ProjectController } from '~/plugins/entities/project';
import { FolderController } from '~/plugins/entities/folder';

declare module '@nuxt/types' {
    interface Context {
        $entities: {
            tab: TabController;
            page: PageController;
            task: TaskController;
            label: LabelController;
            event: EventController;
            vault: VaultController;
            github: GithubController;
            jira: JiraController;
            linear: LinearController;
            autoUpdater: AutoUpdaterController;
            icsIntegration: IcsIntegrationController;
            appleCalendar: AppleCalendarController;
            assistant: AssistantController;
            view: ViewController;
            version: VersionsController;
            myDay: MyDayController;
            project: ProjectController;
            folder: FolderController;
        };
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        $entities: {
            tab: TabController;
            page: PageController;
            task: TaskController;
            event: EventController;
            label: LabelController;
            vault: VaultController;
            autoUpdater: AutoUpdaterController;
            github: GithubController;
            jira: JiraController;
            linear: LinearController;
            icsIntegration: IcsIntegrationController;
            appleCalendar: AppleCalendarController;
            assistant: AssistantController;
            view: ViewController;
            version: VersionsController;
            myDay: MyDayController;
            project: ProjectController;
            folder: FolderController;
        };
    }
}

const entitiesPlugin: Plugin = (ctx: Context, inject: Inject) => {
    ctx.$entities = {} as any;

    ctx.$entities.page = new PageController(ctx);
    ctx.$entities.task = new TaskController(ctx);
    ctx.$entities.label = new LabelController(ctx);
    ctx.$entities.event = new EventController(ctx);
    ctx.$entities.vault = new VaultController(ctx);
    ctx.$entities.github = new GithubController(ctx);
    ctx.$entities.jira = new JiraController(ctx);
    ctx.$entities.linear = new LinearController(ctx);
    ctx.$entities.autoUpdater = new AutoUpdaterController(ctx);
    ctx.$entities.icsIntegration = new IcsIntegrationController(ctx);
    ctx.$entities.appleCalendar = new AppleCalendarController(ctx);
    ctx.$entities.assistant = new AssistantController(ctx);
    ctx.$entities.tab = new TabController(ctx);
    ctx.$entities.view = new ViewController(ctx);
    ctx.$entities.version = new VersionsController(ctx);
    ctx.$entities.myDay = new MyDayController(ctx);
    ctx.$entities.project = new ProjectController(ctx);
    ctx.$entities.folder = new FolderController(ctx);

    inject('entities', ctx.$entities);
};

export default entitiesPlugin;
