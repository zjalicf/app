import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { Context } from '@nuxt/types';
import {
    AuthService,
    DocumentsService,
    EventsService,
    ImagesService,
    IntegrationsService,
    NLPService,
    ProjectsService,
    TaskListsService,
    TasksService,
    UserService,
    VaultsService,
} from '~/plugins/storage-service/cloud/index';
import {
    CloudServiceAction,
    GoogleCalendarIntegrationAction,
} from '~/constants';
import { WebsocketsService } from '~/plugins/storage-service/cloud/websockets';
import { GoogleCalendarIntegrationService } from '~/plugins/storage-service/cloud/google-calendar-integration';

export class CloudService {
    public axiosInstance: NuxtAxiosInstance;
    private readonly userService: UserService;
    private readonly documentsService: DocumentsService;
    private readonly projectsService: ProjectsService;
    private readonly tasksService: TasksService;
    private readonly eventsService: EventsService;
    private readonly taskListsService: TaskListsService;
    private readonly authService: AuthService;
    private readonly imagesService: ImagesService;
    private readonly nlpService: NLPService;
    private readonly integrationsService: IntegrationsService;
    private readonly vaultsService: VaultsService;
    private readonly websocketsService: WebsocketsService;
    private readonly googleCalendarIntegration: GoogleCalendarIntegrationService;

    constructor({ $axios, store, $config, $serviceRegistry }: Context) {
        this.axiosInstance = $axios;
        this.userService = new UserService($axios, store);
        this.documentsService = new DocumentsService($axios, store);
        this.projectsService = new ProjectsService($axios, store);
        this.tasksService = new TasksService($axios, store);
        this.eventsService = new EventsService($axios, store);
        this.taskListsService = new TaskListsService($axios, store);
        this.authService = new AuthService($axios, $config);
        this.imagesService = new ImagesService($axios, store);
        this.nlpService = new NLPService($axios, store);
        this.integrationsService = new IntegrationsService($axios, store);
        this.vaultsService = new VaultsService($axios, store);
        this.googleCalendarIntegration = new GoogleCalendarIntegrationService(
            $axios,
            store,
        );
        this.websocketsService = new WebsocketsService({
            $config,
            store,
            $serviceRegistry,
        } as Context);
    }

    get Websockets(): WebsocketsService {
        return this.websocketsService;
    }

    get User(): UserService {
        return this.userService;
    }

    get Documents(): DocumentsService {
        return this.documentsService;
    }

    get Tasks(): TasksService {
        return this.tasksService;
    }

    get TaskLists(): TaskListsService {
        return this.taskListsService;
    }

    get Events(): EventsService {
        return this.eventsService;
    }

    get Projects(): ProjectsService {
        return this.projectsService;
    }

    get Auth(): AuthService {
        return this.authService;
    }

    get NLP(): NLPService {
        return this.nlpService;
    }

    get Integrations(): IntegrationsService {
        return this.integrationsService;
    }

    get Images(): ImagesService {
        return this.imagesService;
    }

    get Vaults(): VaultsService {
        return this.vaultsService;
    }

    get GoogleCalendarIntegration(): GoogleCalendarIntegrationService {
        return this.googleCalendarIntegration;
    }
}

export class CloudAdapter {
    private cloudService: CloudService;

    constructor(cloudService: CloudService) {
        this.cloudService = cloudService;
    }

    resolveService(entity: string) {
        switch (entity) {
            case 'documents':
                return this.cloudService.Documents;
            case 'events':
                return this.cloudService.Events;
            case 'projects':
                return this.cloudService.Projects;
            case 'taskLists':
                return this.cloudService.TaskLists;
            case 'vaults':
                return this.cloudService.Vaults;
            case 'integrations':
                return this.cloudService.Integrations;
            case 'user':
                return this.cloudService.User;
            case 'nlp':
                break;
            case 'images':
                return this.cloudService.Images;
            case 'auth':
                break;
        }
        return null;
    }

    execute(operation: string, payload: any, awaitResponse: boolean = true) {
        switch (operation) {
            case CloudServiceAction.IS_ONLINE:
                return true;
            case CloudServiceAction.QUICKADD:
                return this.cloudService.NLP.quickAdd(payload.data, payload.ts);
            case CloudServiceAction.WEBSOCKETS_INITIALIZE:
                return this.cloudService.Websockets.initialize();
            case CloudServiceAction.WEBSOCKETS_REGISTER_NAMESPACE:
                return this.cloudService.Websockets.registerProtocol(
                    payload.vaultId,
                );
            case CloudServiceAction.WEBSOCKETS_DISCONNECT_NAMESPACE:
                return this.cloudService.Websockets.disconnectProtocol(
                    payload.vaultId,
                );

            case GoogleCalendarIntegrationAction.GET_EVENTS:
                return this.cloudService.GoogleCalendarIntegration.getEvents(
                    payload.vaultId,
                    payload.integrationId,
                    payload.calendarId,
                    payload.range,
                    payload.syncToken,
                    payload.pageToken,
                );
            case GoogleCalendarIntegrationAction.SAVE_EVENT:
                return this.cloudService.GoogleCalendarIntegration.saveEvent(
                    payload.vaultId,
                    payload.integrationId,
                    payload.calendarId,
                    payload.event,
                );
            case GoogleCalendarIntegrationAction.MOVE_EVENT:
                return this.cloudService.GoogleCalendarIntegration.moveEvent(
                    payload.vaultId,
                    payload.integrationId,
                    payload.calendarId,
                    payload.destination,
                    payload.eventId,
                );
            case GoogleCalendarIntegrationAction.DELETE_EVENT:
                return this.cloudService.GoogleCalendarIntegration.deleteEvent(
                    payload.vaultId,
                    payload.integrationId,
                    payload.calendarId,
                    payload.eventId,
                );
            case GoogleCalendarIntegrationAction.CREATE_WATCH:
                return this.cloudService.GoogleCalendarIntegration.createWatch(
                    payload.vaultId,
                    payload.integrationId,
                    payload.calendarId,
                );
        }

        const { entity, payload: _payload } = payload;
        const service = this.resolveService(entity);
        if (!service) return null;

        switch (operation) {
            case CloudServiceAction.RETRIEVE:
                return service.retrieve(_payload.id, _payload.vaultId);
            case CloudServiceAction.LIST:
                return service.list(_payload.vaultId);
            case CloudServiceAction.LIST_DELETE_CHANGES:
                return service.listDeleteChanges(
                    _payload.vaultId,
                    _payload.timestamp,
                );
            case CloudServiceAction.SAVE:
                return service.save(
                    _payload.entity,
                    _payload.options,
                    _payload.vaultId,
                );
            case CloudServiceAction.SAVE_BATCH:
                return service.saveBatch(
                    _payload.entities,
                    _payload.vaultId,
                    _payload.options,
                );
            case CloudServiceAction.DELETE:
                return service.delete(_payload.id, _payload.vaultId);
            default:
                return Promise.resolve(null);
        }
    }
}
