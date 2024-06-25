import { Context } from '@nuxt/types';
import { Tracker } from '~/plugins/tracking/tracking';
import { AnalyticsAction } from '~/constants';

export class TrackingAdapter {
    tracking!: Tracker;

    constructor(ctx: Context) {
        this.tracking = ctx.$tracking;
    }

    execute(operation: string, payload: any) {
        try {
            if (operation === AnalyticsAction.TRACK_EVENT) {
                this.tracking.trackEvent(payload.eventType, payload.properties);
            }

            if (operation === AnalyticsAction.PING) {
                this.tracking.activityPing(payload);
            }
        } catch (e) {
            console.log(e);
        }
    }
}
