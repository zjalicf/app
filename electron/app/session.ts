import { session } from 'electron';

export const registerRequestModifiers = () => {
    jiraAttachmentRequestModifier();
};

const jiraAttachmentRequestModifier = () => {
    const filter = {
        urls: [
            'https://*.atlassian.com/*/attachment/*',
            'https://*.atlassian.net/*/attachment/*',
            'https://*.atlassian.com/*/universal_avatar/view/type/*/avatar/*',
        ],
    };

    session.defaultSession.webRequest.onBeforeSendHeaders(
        filter,
        (details, callback: any) => {
            const tokenMatch = details.url.match(/\?token=([^&]+)?(?:&|$)/);
            if (!tokenMatch) {
                // eslint-disable-next-line node/no-callback-literal
                callback({
                    cancel: false,
                    requestHeaders: details.requestHeaders,
                });
                return;
            }
            details.url = details.url.replace(/\?token=([^&]+)?(?:&|$)/, '');
            details.requestHeaders.Authorization = `Bearer ${tokenMatch[1]}`;
            // eslint-disable-next-line node/no-callback-literal
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        },
    );
};
