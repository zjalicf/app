import { createDecorator } from 'vue-class-component';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingProperties,
    TrackingType,
} from '~/@types/tracking';

export const ProRequired = createDecorator((options, key) => {
    const originalMethod = options.methods![key];

    options.methods![key] = function wrapperMethod(...args) {
        if (this.$accessControl.readOnlyAccess) {
            this.$accessControl.readOnlyDeny();
            return;
        }
        originalMethod.apply(this, args);
    };
});

export const FocusEditor = createDecorator((options, key) => {
    const originalMethod = options.methods![key];

    options.methods![key] = function wrapperMethod(...args) {
        this.$nextTick(() => {
            if (this.$vfm.openedModals.length) {
                return originalMethod.apply(this, args);
            }
            const activeGroup = this.$store.getters['tabs/activeGroup'];
            this.$nuxt.$emit(
                `sidebar:focus-document-${activeGroup.id}-${activeGroup.activeTab}`,
            );
            originalMethod.apply(this, args);
        });
    };
});

export const TrackEvent = (
    eventType: TrackingType,
    properties: TrackingProperties,
) => {
    return createDecorator((options, key) => {
        const originalMethod = options.methods![key];
        options.methods![key] = function wrapperMethod(...args) {
            this.$tracking.trackEventV2(eventType, properties);
            originalMethod.apply(this, args);
        };
    });
};
