import { DeviceAdapter } from './device';
import { StoreAdapter } from './store';
import { SentryAdapter } from './sentry';
import { TrackingAdapter } from './tracking';
import { NuxtAdapter } from './nuxt';
import { ToastAdapter } from './toast';
import { VfmAdapter } from './vfm';
import { ServiceKey } from '~/constants';

export const Adapters = [
    { key: ServiceKey.STORE, Service: StoreAdapter },
    { key: ServiceKey.DEVICE, Service: DeviceAdapter },
    { key: ServiceKey.SENTRY, Service: SentryAdapter },
    { key: ServiceKey.ANALYTICS, Service: TrackingAdapter },
    { key: ServiceKey.NUXT, Service: NuxtAdapter },
    { key: ServiceKey.TOAST, Service: ToastAdapter },
    { key: ServiceKey.VFM, Service: VfmAdapter },
];
