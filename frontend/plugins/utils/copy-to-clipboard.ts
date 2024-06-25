import copyToClipboard from 'copy-to-clipboard';
import { Context } from '@nuxt/types';

export const copy = (
    context: Context,
    text: string,
    message: string,
    options?: {
        debug?: boolean;
        message?: string;
        format?: string; // MIME type
        onCopy?: (clipboardData: object) => void;
    },
) => {
    try {
        const result = copyToClipboard(text, options);

        if (result && message) {
            context.$notification.show({
                component: () =>
                    import('@/components/notifications/MiscNotification.vue'),
                bind: {
                    displayText: message,
                },
            });
        }

        return result;
    } catch (err) {
        return false;
    }
};
