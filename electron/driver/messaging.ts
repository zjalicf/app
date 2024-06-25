import { WebContents } from 'electron';

export const sendMessage = (view: WebContents, action: string, data: any) => {
    view.send(action, data);
};

export const broadcastMessage = (
    views: WebContents[],
    action: string,
    data: any,
) => {
    views.forEach(view => {
        view.send(action, data);
    });
};
