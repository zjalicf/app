import { IntegrationProcessor } from '~/workers/integrations/processor';
import {
    AppleCalendarIntegrationAction,
    DatabaseServiceAction,
    GenericActions,
    GoogleCalendarIntegrationAction,
    IntegrationsActions,
    JiraIntegrationAction,
    ServiceKey,
} from '~/constants';
import { WorkerBase } from '~/workers/base';
import { WorkerContext } from '~/@types/app';
import { GoogleCalendarIntegration } from '~/workers/integrations/google-calendar';
import { IntegrationConfig } from '~/workers/integrations/base';
import { GithubIntegrationProcessor } from '~/workers/integrations/github/processor';
import { GithubIntegrationAction } from '~/components/github/github';
import { AppleCalendarIntegration } from '~/workers/integrations/apple-calendar';
import { LinearIntegrationActions } from '~/constants/linear';
import { LinearIntegrationProcessor } from '~/workers/integrations/linear/processor';

// One minute interval
const WORKER_INTERVAL = 1 * 60 * 1000;

export class IntegrationsWorker extends WorkerBase {
    private interval: any = 0;
    private processor!: IntegrationProcessor;
    private googleCalendarIntegration!: GoogleCalendarIntegration;
    private githubIntegration!: GithubIntegrationProcessor;
    protected serviceKey = ServiceKey.INTEGRATIONS;
    private linearIntegration!: LinearIntegrationProcessor;

    public constructor() {
        super();
    }

    initialize(ctx: any) {
        const context = {
            $config: ctx,
            ...this.getCommsFunctions(),
        } as WorkerContext;
        this.processor = new IntegrationProcessor(context);
        this.googleCalendarIntegration = new GoogleCalendarIntegration(context);
        this.githubIntegration = new GithubIntegrationProcessor(context);
        this.linearIntegration = new LinearIntegrationProcessor(context);

        context.on(GoogleCalendarIntegrationAction.WATCH_EMIT, async watch => {
            const integration = await context.invoke<IntegrationConfig<any>>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.RETRIEVE,
                {
                    table: 'integrations',
                    vaultId: watch.vaultId,
                    id: watch.integrationId,
                    payload: {
                        vaultId: watch.vaultId,
                        id: watch.integrationId,
                    },
                    callerContext:
                        'worker.ts/initialize googleCalendarWatchEmit',
                },
            );
            return this.googleCalendarIntegration.retrieveEvents(
                integration,
                watch.calendarId,
                null,
            );
        });
    }

    manualRun(payload: any) {
        if (payload.id) {
            this.processor.manualProcessIntegration(
                payload.vaultId,
                payload.id,
            );
            return;
        }
        this.processor.manualProcessVault(payload.vaultId);
    }

    protected async handleMessage(
        operation:
            | IntegrationsActions
            | GenericActions.RESPONSE
            | GoogleCalendarIntegrationAction
            | GithubIntegrationAction
            | JiraIntegrationAction
            | AppleCalendarIntegrationAction
            | LinearIntegrationActions,
        payload: any,
        messageId: string,
        service?: ServiceKey,
    ) {
        if (operation === GenericActions.RESPONSE) {
            this.invokeCallbacks[messageId]?.(payload);
            return;
        }
        let response: any = {};
        switch (operation) {
            case IntegrationsActions.INITIALIZE:
                this.initialize(payload);
                break;
            case IntegrationsActions.MANUAL_RUN:
                this.manualRun(payload);
                break;
            case IntegrationsActions.START:
                this.start();
                break;
            case JiraIntegrationAction.GET_METADATA:
                this.processor.JiraIntegrationProcessor.initialize(
                    payload.config,
                );
                break;
            case JiraIntegrationAction.INITIALIZE:
                this.processor.JiraIntegrationProcessor._execute(
                    payload.config,
                    payload.projects,
                    payload.initial,
                );
                break;
            case JiraIntegrationAction.GET_ISSUE:
                response =
                    await this.processor.JiraIntegrationProcessor.getIssue(
                        payload.integration,
                        payload.project,
                        payload.key,
                        payload.options,
                    );
                break;
            case JiraIntegrationAction.SAVE_ISSUE:
                await this.processor.JiraIntegrationProcessor.saveTask(
                    payload.integration,
                    payload.entity,
                    payload.mods,
                    payload.oldEntity,
                );
                break;
            case AppleCalendarIntegrationAction.GET_RANGE:
                (
                    this.processor.resolve(
                        payload.config,
                    ) as AppleCalendarIntegration
                )?.manualExecute(payload.config, payload.range);
                return;
            case GoogleCalendarIntegrationAction.GET_EVENTS:
                this.googleCalendarIntegration
                    .retrieveEvents(
                        payload.config,
                        payload.calendarId,
                        payload.range,
                    )
                    .catch(err => {
                        this.emit(ServiceKey.SENTRY, 'trackError', err);
                        console.log(err);
                    });
                break;
            case GithubIntegrationAction.INITIAL_LOAD_REPOSITORY:
                this.githubIntegration.initialLoadRepository(
                    payload.config,
                    payload.id,
                );
                break;
            case GithubIntegrationAction.REMOVE_REPOSITORY:
                this.githubIntegration.removeRepository(
                    payload.config,
                    payload.id,
                );
                break;
            case GithubIntegrationAction.INITIALIZE:
                this.githubIntegration.initialLoad(payload.config);
                break;
            case GithubIntegrationAction.EXECUTE:
                this.githubIntegration.execute(payload.config);
                break;
            case GithubIntegrationAction.FETCH_ISSUE:
                response = await this.githubIntegration.fetchIssue(
                    payload.config,
                    payload.repository,
                    payload.issueId,
                );
                break;
            case GithubIntegrationAction.FETCH_PR:
                response = await this.githubIntegration.fetchPullRequest(
                    payload.config,
                    payload.repository,
                    payload.pullRequestId,
                );
                break;
            case GithubIntegrationAction.FETCH_COMMIT_STATUSES:
                response = await this.githubIntegration.fetchCommitStatuses(
                    payload.config,
                    payload.repository,
                    payload.commitId,
                    payload.entityId,
                );
                break;
            case GithubIntegrationAction.FETCH_COMMIT_CHECKS:
                response = await this.githubIntegration.fetchCommitChecks(
                    payload.config,
                    payload.repository,
                    payload.commitId,
                    payload.entityId,
                );
                break;

            case GithubIntegrationAction.FETCH_TIMELINE:
                response = await this.githubIntegration.fetchTimeline(
                    payload.config,
                    payload.repository,
                    payload.pullRequestId,
                    payload.entityId,
                );
                break;
            case GithubIntegrationAction.PROCESS_REMOTE_CHANGE:
                this.githubIntegration.processRemoteChange(
                    payload.config,
                    payload.change,
                );
                break;
            case GithubIntegrationAction.POST_COMMENT:
                response = await this.githubIntegration.postComment(
                    payload.config,
                    payload.repository,
                    payload.number,
                    payload.body,
                );
                break;

            case GithubIntegrationAction.LOAD_TEAMS:
                await this.githubIntegration.loadUserTeams(payload.config);
                break;
            case GithubIntegrationAction.LOAD_REPOSITORIES:
                await this.githubIntegration.loadUserRepositories(
                    payload.config,
                );
                break;
            case GithubIntegrationAction.LOAD_ORGANIZATIONS:
                await this.githubIntegration.loadUserOrganizations(
                    payload.config,
                );
                break;
            case LinearIntegrationActions.INITIALIZE_INTEGRATION:
                this.linearIntegration.initializeIntegration(
                    payload.integration,
                );
                break;
            case LinearIntegrationActions.GET_COMMENTS_AND_HISTORY:
                response = await this.linearIntegration.getCommentsAndHistory(
                    payload.integration,
                    payload.issueId,
                );
                break;
            case LinearIntegrationActions.UPDATE_ISSUE:
                response = await this.linearIntegration.updateIssue(
                    payload.integration,
                    payload.issueId,
                    payload.payload,
                );
                break;
            case LinearIntegrationActions.GET_VIEW_PREVIEW_ISSUES:
                response = await this.linearIntegration.getIssuesPreview(
                    payload.integration,
                    payload.view,
                );
                break;
            case LinearIntegrationActions.LOAD_VIEWS_ISSUES:
                response = await this.linearIntegration.loadViewsIssues(
                    payload.integration,
                    payload.views,
                );
                break;
            case LinearIntegrationActions.PREPARE_TEAM_DATA:
                response = await this.linearIntegration.prepareTeamsData(
                    payload.integration,
                    payload.teamIds,
                );
                break;
            case LinearIntegrationActions.GET_ISSUE:
                response = await this.linearIntegration.getIssue(
                    payload.integration,
                    payload.issueId,
                    payload.identifier,
                );
                break;
            default:
                this.handleEvent(operation, payload);
        }

        return this.emit(
            service || ServiceKey.INTEGRATIONS,
            GenericActions.RESPONSE,
            response,
            messageId,
        );
    }

    start() {
        if (this.interval) {
            return;
        }
        this.processor.process(true);
        this.interval = setInterval(() => {
            this.processor.process();
        }, WORKER_INTERVAL);
    }
}
