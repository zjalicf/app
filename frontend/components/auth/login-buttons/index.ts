import { resolvePlatform } from '~/helpers';

export default resolvePlatform({
    mobile: () => import('./LoginButtons.mobile.vue'),
    desktop: () => import('./LoginButtons.desktop.vue'),
    default: () => import('./LoginButtons.default.vue'),
});
