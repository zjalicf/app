import { v4 } from 'uuid';
import type { User } from 'jira.js/out/version3/models';
import { EntityController } from '~/plugins/entities/controller';
import {
    IntegrationType,
    JiraIntegrationAction,
    JiraStatusColors,
    ServiceKey,
    TabType,
} from '~/constants';
import { JiraIntegrationDataType } from '~/constants/jira';
import {
    IntegrationAuthStatus,
    IntegrationConfig,
} from '~/workers/integrations/base';
import { JiraIntegrationConfig } from '~/workers/integrations/jira/controller';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceGeometricCircleAlternate from '~/components/streamline/InterfaceGeometricCircleAlternate.vue';
import { CloudResponse, Tab } from '~/@types/app';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

export type IJiraUser = {
    id: string;
    integrationId: string;
    integrationType: IntegrationType.JIRA;
    type: JiraIntegrationDataType.USER;
    user: {
        accountId: string;
        accountType: string;
        active: boolean;
        avatarUrls: {
            '16x16': string;
            '24x24': string;
            '32x32': string;
            '48x48': string;
        };
        displayName: string;
        emailAddress: string;
        locale: string;
        self: string;
        timeZone: string;
    };
    vaultId: string;
};

const attachmentRegexp =
    /<img src="(?:(?:\/secure\/attachment\/([^/]+))|(?:.*\/rest\/api\/\d\/attachment\/[^/]+\/(\d+)))/g;
const videoRegexp =
    /<div.*?"embeddedObject".*?<embed.*?src="(?:(?:\/secure\/attachment\/([^/]+))|(?:.*\/rest\/api\/\d\/attachment\/[^/]+\/(\d+)))[^"]+".*?type="video\/[^"]+".*?<\/div>/g;
const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;

export const isJiraEntity = (id: string) => {
    return id.startsWith(JiraIntegrationDataType.ISSUE);
};

export class JiraController extends EntityController<any> {
    parseId(id: string) {
        const [type, cloudId, projectId, entityId] = id.split('/');
        return {
            type,
            cloudId,
            projectId,
            entityId,
        };
    }

    getAllUsers() {
        return (
            this.context.store.getters['integrationData/byType'](
                JiraIntegrationDataType.USER,
            ) || []
        );
    }

    getUsers(_projectId: string) {
        const { projectId } = this.parseId(_projectId);
        const users = this.getAllUsers();
        return users.filter((user: IJiraUser) => {
            const { projectId: userProjectId } = this.parseId(user.id);
            return projectId === userProjectId;
        });
    }

    getProjectById(id: string) {
        return this.context.store.getters['integrationData/byId'](id) || null;
    }

    getProjects() {
        return (
            this.context.store.getters['integrationData/byType'](
                JiraIntegrationDataType.PROJECT,
            ) || []
        );
    }

    getStatusProperties(status: { statusCategory: string }) {
        switch (status.statusCategory) {
            case 'TODO':
                return {
                    icon: InterfaceEditSelectAreaCircleDash,
                    color: JiraStatusColors.TODO,
                };
            case 'DONE':
                return {
                    icon: InterfaceValidationCheckCircle,
                    color: JiraStatusColors.DONE,
                };
            default:
                return {
                    icon: InterfaceGeometricCircleAlternate,
                    color: JiraStatusColors.IN_PROGRESS,
                };
        }
    }

    getById(id: string) {
        return this.context.store.getters['integrationData/byId'](id) || null;
    }

    getByKey(key: string) {
        const id = this.context.store.getters['integrationData/byKey'](key);
        if (id) {
            return this.getById(id);
        }

        return null;
    }

    getProjectByKey(projectKey: string) {
        return this.context.store.getters['integrationData/byType'](
            JiraIntegrationDataType.PROJECT,
        ).find((project: any) => project.key === projectKey);
    }

    isJiraLink(
        link: string,
        integration: IntegrationConfig<JiraIntegrationConfig>,
    ) {
        const clouds = integration.data.clouds;
        const linkCloud = clouds.some((cloud: any) => {
            return link.startsWith(cloud.url);
        });
        if (!linkCloud) return false;

        if (link.includes('/browse/')) {
            const keyRegexp = /\/browse\/.{2,}?-[0-9]+/;
            return keyRegexp.test(link);
        }
        if (link.includes('selectedIssue=')) {
            const keyRegexp = /selectedIssue=.{2,}?-[0-9]+/;
            return keyRegexp.test(link);
        }

        return false;
    }

    getJiraMatch(link: string) {
        if (link.includes('/browse/')) {
            const keyRegexp =
                /https:\/\/.*?\/browse\/(.{2,}?-[0-9]+).*?(?:\s|$)/g;
            return link.matchAll(keyRegexp);
        }
        if (link.includes('selectedIssue=')) {
            const keyRegexp =
                /https:\/\/.*?selectedIssue=(.{2,}?-[0-9]+).*?(?:\s|$)/g;
            return link.matchAll(keyRegexp);
        }
        return [];
    }

    isAuthorized() {
        const integration = this.getIntegration();
        if (!integration) return false;
        return integration.authStatus !== IntegrationAuthStatus.UNAUTHORIZED;
    }

    get integration() {
        const integrations = this.context.store.getters['integration/byType'](
            IntegrationType.JIRA,
        );

        if (!integrations.length) return null;
        return integrations[0];
    }

    getIntegration() {
        const integrations = this.context.store.getters['integration/byType'](
            IntegrationType.JIRA,
        );

        if (!integrations.length) return null;
        return integrations[0];
    }

    getCredentials() {
        const integration = this.getIntegration();
        return {
            accessToken:
                integration.data.credentials.accessToken ??
                integration.data.credentials.access_token,
            refreshToken:
                integration.data.credentials.refreshToken ??
                integration.data.credentials.refresh_token,
            expiryDate:
                integration.data.credentials.expiryDate ??
                integration.data.credentials.expiry_date,
        };
    }

    fetchIssue(
        integration: IntegrationConfig<JiraIntegrationConfig>,
        project: any,
        key: string,
        checkStore: boolean = true,
    ) {
        if (checkStore) {
            const issue = this.getByKey(key);
            if (issue) return;
        }
        const hasStatuses = this.context.store.getters['integration/byType'](
            JiraIntegrationDataType.STATUS,
        )?.find(({ id }: any) => this.parseId(id).projectId === project.id);
        const hasUsers = this.context.store.getters['integration/byType'](
            JiraIntegrationDataType.USER,
        )?.find(({ id }: any) => this.parseId(id).projectId === project.id);

        return this.context.$serviceRegistry.invoke(
            ServiceKey.INTEGRATIONS,
            JiraIntegrationAction.GET_ISSUE,
            {
                integration,
                project,
                key,
                options: {
                    fetchUsers: !hasUsers,
                    fetchStatuses: !hasStatuses,
                },
                callerContext: 'entities/jira.ts fetchIssue',
            },
        );
    }

    async fetchUser(options: {
        credentials: {
            accessToken: string;
            refreshToken: string;
            expiryDate: string;
        };
        vaultId: string;
        redirect: boolean;
    }) {
        const integration = {
            id: v4(),
            vaultId: options.vaultId,
            type: IntegrationType.JIRA,
            data: {
                id: v4(),
                vaultId: options.vaultId,
                credentials: options.credentials,
                projects: [],
                myself: {},
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const initializedIntegration =
            await this.context.$serviceRegistry.invoke(
                ServiceKey.CLOUD,
                JiraIntegrationAction.INITIALIZE_INTEGRATION,
                {
                    ...integration,
                    callerContext: 'entities/jira.ts fetchUser',
                },
            );

        const response = await this.context.$serviceRegistry.invoke<
            CloudResponse<User>
        >(ServiceKey.CLOUD, JiraIntegrationAction.GET_MYSELF, {
            integration: initializedIntegration,
            vaultId: integration.vaultId,
            integrationId: integration.id,
            callerContext: 'entities/jira.ts get myself fetchUser',
        });
        if (!response || !response.data) return null;

        return response.data;
    }

    async reauthorize(options: {
        credentials: {
            accessToken: string;
            refreshToken: string;
            expiryDate: string;
        };
        vaultId: string;
        redirect: boolean;
    }) {
        // store existing integration into variable
        const oldIntegration = this.getIntegration();

        // if not old, create?

        // try to fetch user using new creadentials
        const oldUser = this.getMyself();
        const newUser = await this.fetchUser(options);

        if (!newUser) {
            // throw new Error('Could not retrieve account');
            this.context.$notification.show({
                component: () =>
                    import('@/components/notifications/ErrorNotification.vue'),
                bind: {
                    displayText: 'Error connecting account',
                },
            });
            return;
        }

        if (oldUser && oldUser.accountId === newUser.accountId) {
            try {
                const newIntegration = {
                    ...oldIntegration,
                    data: {
                        ...oldIntegration.data,
                        credentials: options.credentials,
                    },
                    authStatus: IntegrationAuthStatus.AUTHORIZED,
                    lastRunTimestamp: 0,
                };

                const initializedIntegration =
                    await this.context.$serviceRegistry.invoke(
                        ServiceKey.CLOUD,
                        JiraIntegrationAction.INITIALIZE_INTEGRATION,
                        {
                            ...newIntegration,
                            callerContext: 'entities/jira.ts get reauthorize',
                        },
                    );
                await this.context.store.dispatch(
                    'integration/save',
                    initializedIntegration,
                );
                this.context.$serviceRegistry.emit(
                    ServiceKey.INTEGRATIONS,
                    JiraIntegrationAction.GET_METADATA,
                    {
                        config: initializedIntegration,
                    },
                );

                await this.context.$vfm.hideAll();
                if (options.redirect) {
                    this.openJiraTab();
                }

                this.fullRefresh();

                this.context.$notification.show({
                    component: () =>
                        import(
                            '@/components/notifications/MiscNotification.vue'
                        ),
                    bind: {
                        displayText: 'Jira account connected',
                    },
                });
            } catch (e) {}
        } else {
            await this.deleteIntegration();
            await this.createIntegration(options);
        }
    }

    async createIntegration(options: {
        credentials: {
            accessToken: string;
            refreshToken: string;
            expiryDate: string;
        };
        vaultId: string;
        redirect: boolean;
    }) {
        // check if integration already exists, if yes re-authorize
        const integration = this.getIntegration();

        if (integration) {
            return this.reauthorize(options);
        }

        try {
            const integration = {
                id: v4(),
                vaultId: options.vaultId,
                type: IntegrationType.JIRA,
                data: {
                    id: v4(),
                    vaultId: options.vaultId,
                    credentials: options.credentials,
                    projects: [],
                    myself: {},
                },
                authStatus: IntegrationAuthStatus.AUTHORIZED,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const initializedIntegration =
                await this.context.$serviceRegistry.invoke(
                    ServiceKey.CLOUD,
                    JiraIntegrationAction.INITIALIZE_INTEGRATION,
                    {
                        ...integration,
                        callerContext: 'entities/jira.ts get createIntegration',
                    },
                );
            await this.context.store.dispatch(
                'integration/save',
                initializedIntegration,
            );
            this.context.$serviceRegistry.emit(
                ServiceKey.INTEGRATIONS,
                JiraIntegrationAction.GET_METADATA,
                {
                    config: initializedIntegration,
                },
            );

            this.context.$tracking.trackEventV2(TrackingType.JIRA, {
                action: TrackingAction.CREATE,
            });
        } catch (e) {}
    }

    openModal(entityOrId: string | any, trackingSource?: TrackingActionSource) {
        const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
        const entity = this.getById(id);
        if (this.context.$utils.isMobile) return;

        this.context.$vfm.show({
            component: () =>
                import(
                    '@/components/integrations/jira/JiraPropertiesModal.vue'
                ),
            bind: {
                entity,
            },
            on: {
                closed: () => {
                    if (entity.notification) {
                        this.context.$entities.jira.dismissNotification(entity);
                    }
                },
            },
        });

        if (trackingSource) {
            this.context.$tracking.trackEventV2(TrackingType.JIRA, {
                action: TrackingAction.OPEN_JIRA_ISSUE_DETAIL,
                source: trackingSource,
            });
        }
    }

    openSettings(source?: TrackingActionSource) {
        // TODO: if open just switch tab
        this.context.$utils.navigation.openSettings('jira-integration', source);
    }

    getMyself() {
        const self = this.context.store.getters['integrationData/byType'](
            JiraIntegrationDataType.MYSELF,
        );

        if (self.length) {
            return self[0];
        }

        return null;
    }

    getStatusById(statusId: string) {
        return (
            this.context.store.getters['integrationData/byId'](statusId) || null
        );
    }

    normalizeIssueDescription(description: string): string {
        return description
            .replaceAll(
                attachmentRegexp,
                // @ts-ignore
                (_match: any, ...rest) => {
                    return (
                        '<img style="max-width: 400px" src="' +
                        this.getJiraAttachmentUrl(rest[0] ?? rest[1], false) +
                        '"'
                    );
                },
            )
            .replaceAll(
                videoRegexp,
                // @ts-ignore
                (_match: any, ...rest) => {
                    return (
                        '<video controls><source src="' +
                        this.getJiraAttachmentUrl(rest[0] ?? rest[1], false) +
                        '"></video>'
                    );
                },
            )
            .replace(linkRegex, (match: any, href: any) => {
                const replacement = match.replace(
                    href,
                    `${href}" target="_blank"`,
                );
                return replacement;
            });
    }

    async getIssueComments(key: string) {
        const integration = this.getIntegration();
        const cloudUrl = integration.data.clouds[0].url;
        const comments = await this.context.$serviceRegistry
            .invoke<any[]>(
                ServiceKey.CLOUD,
                JiraIntegrationAction.GET_COMMENTS,
                {
                    issueId: key,
                    integration: this.getIntegration(),
                    startAt: 0,
                    maxResults: 500,
                },
            )
            .then((res: any) => {
                if (!res.data.comments) return [];
                return (
                    res.data.comments.sort(
                        (a: any, b: any) =>
                            new Date(b.created).getTime() -
                            new Date(a.created).getTime(),
                    ) ?? []
                );
            });
        return comments.map((comment: any) => {
            return {
                ...comment,
                link: `${cloudUrl}/browse/${key}?focusedCommentId=${comment.id}`,
                renderedBody: comment.renderedBody.replaceAll(
                    attachmentRegexp,
                    (_match: any, ...rest: any[]) => {
                        return (
                            '<img style="max-width: 200px" src="' +
                            this.getJiraAttachmentUrl(rest[0] ?? rest[1]) +
                            '"'
                        );
                    },
                ),
            };
        });
    }

    getJiraAvatarUrl(iconUrl: string): string {
        const match = /universal_avatar\/view\/type\/(\w+)\/avatar\/(\d+)/.exec(
            iconUrl,
        );
        if (match) {
            const parsedUrl = new URL(iconUrl);
            return this._getJiraAvatarUrl(
                match[1],
                match[2],
                parsedUrl.search.replace('?', ''),
            );
        }
        return iconUrl;
    }

    _getJiraAvatarUrl(type: string, id: string, query: string): string {
        if (this.context.$config.platform === 'desktop') {
            return this.getElectronAvatarUrl(type, id, query);
        }
        return this.getWebAvatarUrl(type, id, query);
    }

    getElectronAvatarUrl(type: string, id: string, query: string) {
        const integration = this.getIntegration();
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        const requestQuery = [
            `token=${integrationCredentials.accessToken}`,
            query,
        ].join('&');
        return `https://api.atlassian.com/ex/jira/${cloud.id}/rest/api/2/universal_avatar/view/type/${type}/avatar/${id}?${requestQuery}`;
    }

    getWebAvatarUrl(type: string, id: string, query: string): string {
        const integration = this.getIntegration();
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        const userCredentials = this.context.store.getters['user/credentials'];
        const requestQuery = [
            `token=${userCredentials.accessToken}`,
            `accessToken=${integrationCredentials.accessToken}`,
            query,
        ].join('&');
        return `${this.context.$config.baseUrl}/proxy/jira/ex/jira/${cloud.id}/rest/api/2/universal_avatar/view/type/${type}/avatar/${id}?${requestQuery}`;
    }

    getJiraAttachmentUrl(attachmentId: string, thumbnail: boolean = true) {
        if (this.context.$config.platform === 'desktop') {
            return this.getElectronAttachmentUrl(attachmentId, thumbnail);
        }
        return this.getWebAttachmentUrl(attachmentId, thumbnail);
    }

    getElectronAttachmentUrl(attachmentId: string, thumbnail: boolean) {
        const integration = this.getIntegration();
        if (!thumbnail) {
            return this.getElectronFullContentUrl(integration, attachmentId);
        }
        return this.getElectronThumbnailUrl(integration, attachmentId);
    }

    getWebAttachmentUrl(attachmentId: string, thumbnail: boolean) {
        const integration = this.getIntegration();
        if (!thumbnail) {
            return this.getWebFullContentUrl(integration, attachmentId);
        }
        return this.getWebThumbnailUrl(integration, attachmentId);
    }

    getElectronFullContentUrl(
        integration: IntegrationConfig<any>,
        attachmentId: string,
    ) {
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        return `https://api.atlassian.com/ex/jira/${cloud.id}/rest/api/3/attachment/content/${attachmentId}?token=${integrationCredentials.accessToken}`;
    }

    getElectronThumbnailUrl(
        integration: IntegrationConfig<any>,
        attachmentId: string,
    ) {
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        return `https://api.atlassian.com/ex/jira/${cloud.id}/rest/api/3/attachment/thumbnail/${attachmentId}?token=${integrationCredentials.accessToken}`;
    }

    getWebFullContentUrl(
        integration: IntegrationConfig<any>,
        attachmentId: string,
    ) {
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        const userCredentials = this.context.store.getters['user/credentials'];
        const query = [
            `token=${userCredentials.accessToken}`,
            `accessToken=${integrationCredentials.accessToken}`,
        ].join('&');
        return `${this.context.$config.baseUrl}/proxy/jira/ex/jira/${cloud.id}/rest/api/3/attachment/content/${attachmentId}?${query}`;
    }

    getWebThumbnailUrl(
        integration: IntegrationConfig<any>,
        attachmentId: string,
    ) {
        const cloud = integration.data.clouds[0];
        const integrationCredentials = this.getCredentials();
        const userCredentials = this.context.store.getters['user/credentials'];
        const query = [
            `token=${userCredentials.accessToken}`,
            `accessToken=${integrationCredentials.accessToken}`,
        ].join('&');
        return `${this.context.$config.baseUrl}/proxy/jira/ex/jira/${cloud.id}/rest/api/3/attachment/thumbnail/${attachmentId}?${query}`;
    }

    dismissNotifications(entities: any[]) {
        const updated = entities.map((entity: any) => ({
            id: entity.id,
            notification: false,
        }));
        this.context.store.dispatch('integrationData/batchUpdate', updated);
    }

    async dismissNotification(entity: any) {
        await this.context.store.dispatch('integrationData/update', {
            id: entity.id,
            notification: false,
        });
    }

    async closeJiraTab() {
        const jiraTabs = this.context.store.getters['tabs/list'].filter(
            (tab: Tab) => tab.type === TabType.JIRA_APP,
        );

        for (const tab of jiraTabs) {
            const groupId = this.context.store.getters['tabs/groupByTabId'](
                tab.id,
            );

            await this.context.$tabs.closeTab(tab, groupId);
        }
    }

    openJiraTab() {
        const integration = this.getIntegration();
        if (!integration) return;
        const tab = this.context.$tabs.createNewTabObject(
            TabType.JIRA_APP,
            TabType.JIRA_APP,
        );
        this.context.$tabs.openTab(tab);
    }

    fullRefresh() {
        const integration = this.getIntegration();
        if (!integration) return;

        this.context.$serviceRegistry.emit(
            ServiceKey.INTEGRATIONS,
            JiraIntegrationAction.INITIALIZE,
            {
                projects: integration.data.projects.filter(
                    ({ syncEnabled }: any) => syncEnabled,
                ),
                config: integration,
                initial: true,
            },
        );
    }

    async deleteIntegration() {
        const integration = this.getIntegration();
        if (!integration) return;

        await this.closeJiraTab();
        await this.context.store.dispatch('integration/delete', integration);

        this.context.$tracking.trackEventV2(TrackingType.JIRA, {
            action: TrackingAction.DELETE,
        });
    }
}
