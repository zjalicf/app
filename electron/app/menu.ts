import { app, BrowserWindow, MenuItem } from 'electron';
import { isMac } from '../helpers';
import { appWindows } from './windows';

const template = () =>
    [
        ...((isMac
            ? ([
                  {
                      label: app.name,
                      submenu: [
                          { role: 'about' } as MenuItem,
                          {
                              label: 'Release Notes',
                              click: async () => {
                                  const { shell } = require('electron');
                                  await shell.openExternal(
                                      'https://acreom.com/change-log',
                                  );
                              },
                          },
                          { type: 'separator' } as MenuItem,
                          {
                              label: 'Settings',
                              accelerator: 'Cmd+,',
                              click: () => {
                                  appWindows.main?.webContents.send(
                                      'open-preferences',
                                  );
                              },
                          },
                          { type: 'separator' } as MenuItem,
                          { role: 'hide' } as MenuItem,
                          { role: 'hideOthers' } as MenuItem,
                          { role: 'unhide' } as MenuItem,
                          { type: 'separator' } as MenuItem,
                          {
                              label: 'Quit',
                              accelerator: 'Cmd+Q',
                              click: () => {
                                  app.quit();
                              },
                          },
                      ],
                  },
              ] as any)
            : ([] as MenuItem[])) as any),
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Page',
                    accelerator: 'CommandOrControl+N',
                    click: () => {
                        appWindows.main?.webContents.send('new-document');
                    }
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac
                    ? [
                          { role: 'pasteAndMatchStyle' },
                          { role: 'delete' },
                          { role: 'selectAll' },
                          { type: 'separator' },
                      ]
                    : [
                          { role: 'delete' },
                          { type: 'separator' },
                          { role: 'selectAll' },
                      ]),
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn', accelerator: 'CommandOrControl+=' },
                { role: 'zoomOut' },
                { type: 'separator' },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac
                    ? [
                          {
                              label: 'Close',
                              accelerator: 'Cmd+W',
                              click: () => {
                                  const window = Object.values(appWindows).find(
                                      (window: BrowserWindow) =>
                                          window.isFocused(),
                                  );

                                  if (!window) return;
                                  window.hide();
                              },
                          },
                          { type: 'separator' },
                          { role: 'front' },
                          { type: 'separator' },
                          { role: 'window' },
                      ]
                    : []),
            ],
        },
    ] as MenuItem[];

export const defaultMenu = template;
