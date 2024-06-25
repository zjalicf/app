import { Table } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import has from 'lodash/has';
import { acreomVaultIndexedDB } from './connector';
import { IndexedDBBase } from './base';
import { IEvent } from '~/@types';
import { WorkerContext } from '~/@types/app';
import {
    AnalyticsAction,
    GoogleCalendarIntegrationAction,
    SearchIndex,
    ServiceKey,
} from '~/constants';

export class GoogleCalendarEventsIndexedDB extends IndexedDBBase<IEvent> {
    shouldStoreLocally = false;
    protected entity = 'event';
    protected platform: string;
    protected context: WorkerContext;
    public searchIndex = SearchIndex.EVENT;

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.clientId = ctx.$config.clientId;
        this.platform = ctx.$config.platform;
        this.context = ctx;
    }

    table(vaultId: string): Table<IEvent, string> {
        return acreomVaultIndexedDB(vaultId).GoogleCalendarEvents;
    }

    async subprocessLocalChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(
            ServiceKey.ANALYTICS,
            AnalyticsAction.PING,
            this.table(vaultId).name,
        );

        this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
            vaultId,
            change,
        });
        let createChange: ICreateChange;
        let updateChange: IUpdateChange;
        let deleteChange: IDeleteChange;

        let calendar: any = null;
        if ((change as ICreateChange)?.obj?.integrationId) {
            const integration =
                await this.context.$deviceService.Integrations.retrieve(
                    vaultId,
                    (change as ICreateChange).obj.integrationId,
                );
            calendar = integration.data.calendars.find(
                ({ id }: any) =>
                    id === (change as ICreateChange).obj.calendarId,
            );
        }
        const canModify = () => {
            return ['writer', 'owner'].includes(calendar?.accessRole);
        };

        switch (change.type) {
            case 1:
                createChange = change as ICreateChange;
                if (!canModify()) break;
                await this.context.invoke(
                    ServiceKey.CLOUD,
                    GoogleCalendarIntegrationAction.SAVE_EVENT,
                    {
                        vaultId: createChange.obj.vaultId,
                        integrationId: createChange.obj.integrationId,
                        calendarId: createChange.obj.calendarId,
                        event: createChange.obj,
                        callerContext:
                            'indexeddb/google-calendar.ts/subprocessLocalChanges',
                    },
                );
                break;
            case 2:
                updateChange = change as IUpdateChange;
                // @ts-ignore
                if (has(updateChange.mods, 'calendarId')) {
                    // if (updateChange.mods.calendarId === 'acreom') {
                    //     await this.context.invoke(
                    //         ServiceKey.CLOUD,
                    //         GoogleCalendarIntegrationAction.DELETE_EVENT,
                    //         {
                    //             vaultId: updateChange.oldObj.vaultId,
                    //             integrationId:
                    //                 updateChange.oldObj.integrationId,
                    //             calendarId: updateChange.oldObj.calendarId,
                    //             eventId: updateChange.oldObj.id,
                    //         },
                    //     );
                    //     break;
                    // }
                    await this.context.invoke(
                        ServiceKey.CLOUD,
                        GoogleCalendarIntegrationAction.MOVE_EVENT,
                        {
                            vaultId: updateChange.obj.vaultId,
                            integrationId: updateChange.obj.integrationId,
                            calendarId: updateChange.oldObj.calendarId,
                            destination: updateChange.obj.calendarId,
                            eventId: updateChange.obj.id,
                            callerContext:
                                'indexeddb/google-calendar.ts/subprocessLocalChanges',
                        },
                    );
                }
                const modKeys = Object.keys(updateChange.mods);
                if (modKeys.length < 2 && modKeys.includes('updatedAt')) break;
                if (
                    modKeys.length === 2 &&
                    modKeys.includes('updatedAt') &&
                    modKeys.includes('calendarId')
                )
                    break;

                if (!canModify()) break;
                await this.context.invoke(
                    ServiceKey.CLOUD,
                    GoogleCalendarIntegrationAction.SAVE_EVENT,
                    {
                        vaultId: updateChange.obj.vaultId,
                        integrationId: updateChange.obj.integrationId,
                        calendarId: updateChange.obj.calendarId,
                        event: updateChange.obj,
                        callerContext:
                            'indexeddb/google-calendar.ts/subprocessLocalChanges',
                    },
                );
                break;
            case 3:
                deleteChange = change as IDeleteChange;
                // await this.context.invoke(
                //     ServiceKey.CLOUD,
                //     GoogleCalendarIntegrationAction.DELETE_EVENT,
                //     {
                //         vaultId: deleteChange.oldObj.vaultId,
                //         integrationId: deleteChange.oldObj.integrationId,
                //         calendarId: deleteChange.oldObj.calendarId,
                //         eventId: deleteChange.oldObj.id,
                //     },
                // );
                break;
        }
    }

    async subprocessRemoteChanges(
        vaultId: string,
        change: IDatabaseChange,
    ): Promise<void> {
        this.context.emit(ServiceKey.DEVICE, 'notification:updateEvent', {
            vaultId,
            change,
        });
    }
}
