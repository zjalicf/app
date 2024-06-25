import { app, ipcMain } from 'electron';

export const registerTestUtil = () => {
  ipcMain.on('get-test-path', async (event, _val) => {
    event.returnValue = app.getPath('documents');
  });
};
