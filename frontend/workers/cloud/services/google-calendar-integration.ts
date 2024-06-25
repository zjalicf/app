import { AxiosError, AxiosInstance } from 'axios';
import { ServiceBase } from './base';
import { IEvent } from '~/@types';
import { WorkerContext } from '~/@types/app';
import { IntegrationType } from '~/constants';

type CalendarRange = { start: Date; end: Date };

export class GoogleCalendarIntegrationService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, IntegrationType.GOOGLE_CALENDAR, ctx);
    }

    get APIRoot() {
        return (vaultId?: string) => {
            return `${this.apiRoot}/${vaultId}/integrations/${this.entity}`;
        };
    }

    async createWatch(
        vaultId: string,
        integrationId: string,
        calendarId: string,
    ) {
        const url = [this.APIRoot(vaultId), integrationId, 'watch'].join('/');
        const params: Record<string, any> = { calendarId };
        const response = await this.axiosInstance
            .get(url, {
                params,
            })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async getEvents(
        vaultId: string,
        integrationId: string,
        calendarId: string,
        range: CalendarRange | null,
        syncToken: string | null,
        pageToken: string | null,
    ) {
        const url = [this.APIRoot(vaultId), integrationId, 'range'].join('/');
        const params: Record<string, any> = { calendarId };
        if (pageToken) {
            params.pageToken = pageToken;
        }
        if (syncToken) {
            params.syncToken = syncToken;
        } else if (range) {
            params.timeMin = range.start.getTime();
            params.timeMax = range.end.getTime();
        }
        const response = await this.axiosInstance
            .get(url, {
                params,
            })
            .catch((err: AxiosError) => {
                return {
                    data: [],
                    status: err.response?.status || null,
                    statusText: err.response?.statusText || null,
                };
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async retrieveRecurringInstance(
        vaultId: string,
        integrationId: string,
        calendarId: string,
        event: IEvent,
    ) {
        const url = [this.APIRoot(vaultId), integrationId].join('/instance');
        const params: Record<string, any> = { calendarId };
        if (event.id) {
            event.id = event.id.split('/').pop()!;
        }
        if (event.recurringEventId) {
            event.recurringEventId = event.recurringEventId.split('/').pop()!;
        }
        if (event.acreomRecurringId) {
            event.acreomRecurringId = event.acreomRecurringId.split('/').pop()!;
        }
        const response = await this.axiosInstance
            .post(url, event, { params })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async saveEvent(
        vaultId: string,
        integrationId: string,
        calendarId: string,
        event: IEvent,
    ) {
        const url = [this.APIRoot(vaultId), integrationId].join('/');
        const params: Record<string, any> = { calendarId };
        delete (event as any).sessionId;
        if (event.id) {
            event.id = event.id.split('/').pop()!.replace(/-/g, 'g');
        }
        if (event.remoteId) {
            event.remoteId = event.remoteId
                .split('/')
                .pop()!
                .replace(/-/g, 'g');
        }
        if (event.recurringEventId) {
            event.recurringEventId = event.recurringEventId
                .split('/')
                .pop()!
                .replace(/-/g, 'g');
        }
        if (event.acreomRecurringId) {
            event.acreomRecurringId = event.acreomRecurringId
                .split('/')
                .pop()!
                .replace(/-/g, 'g');
        }
        const response = await this.axiosInstance
            .post(url, event, { params })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async moveEvent(
        vaultId: string,
        integrationId: string,
        calendarId: string,
        destination: string,
        eventId: string,
    ) {
        const url = [this.APIRoot(vaultId), integrationId, 'move'].join('/');
        eventId = eventId.split('/').pop()!;

        const params: Record<string, any> = {
            calendarId,
            destination,
            eventId,
        };
        const response = await this.axiosInstance
            .put(url, undefined, { params })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }

    async deleteEvent(
        vaultId: string,
        integrationId: string,
        calendarId: string,
        eventId: string,
    ) {
        const url = [this.APIRoot(vaultId), integrationId].join('/');
        const params: Record<string, any> = {
            calendarId,
            eventId,
        };
        const response = await this.axiosInstance
            .delete(url, { params })
            .catch((err: AxiosError) => {
                return err.response!;
            });
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    }
}
