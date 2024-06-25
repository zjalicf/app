// @ts-ignore
const service = require('wdio-electron-service');
// @ts-ignore
const utils = require('./utils');

describe('Task Schedule', function () {
    const testUtils = new utils.TestUtils(service, this);

    before(async () => {
        await testUtils.setupVault();
        await service.browser.switchWindow('acreom');
        await testUtils.createAndOpenVault();
    });

    it('my day task should create task in my day', async () => {
        const taskText = '1';
        await testUtils.controls.openMyDay();
        await testUtils.taskUtils.createTask(taskText);
        const task = await testUtils.taskUtils.existsInMyDay(taskText, 0);
        await expect(task).toEqual(true);
    });

    it('page task should not create task in my day', async () => {
        const taskText = 'task in page';
        await testUtils.pageUtils.openPage('task test page');
        await testUtils.taskUtils.createTask(taskText);
        await testUtils.controls.openMyDay();
        const task = await testUtils.taskUtils.existsInMyDay(taskText, 0);
        await expect(task).toEqual(false);
    });

    it('schedule from page should not move task between my days', async () => {
        const taskText = 'from page';
        const page = 'task test page';
        await testUtils.pageUtils.openPage(page);
        await testUtils.taskUtils.createTask(taskText);
        await testUtils.taskUtils.scheduleContextMenu(taskText, 0);
        const taskInPage = await testUtils.taskUtils.existsInPage(
            taskText,
            page,
        );
        await testUtils.controls.openMyDay();
        const taskInMyDay = await testUtils.taskUtils.existsInMyDay(
            taskText,
            0,
        );
        const taskInAgenda = await testUtils.taskUtils.existsInAgenda(
            taskText,
            0,
        );
        await expect(taskInPage && !taskInMyDay && taskInAgenda).toEqual(true);
    });

    it('reschedule should move task between my days', async () => {
        const taskText = 'task';
        const yesterday = -1;
        const today = 0;
        // go to yesterday
        await testUtils.controls.openMyDaySpecific(yesterday);
        // add task
        await testUtils.taskUtils.createTask(taskText);
        // check task in yesterday
        const taskToday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            today,
        );
        // check task in today (leaves today open)
        const taskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        // schedule the created task for today
        await testUtils.taskUtils.scheduleContextMenu(taskText, today);
        // check the task exists yesterday / today
        const movedTaskTodayMyDay = await testUtils.taskUtils.existsInMyDay(
            taskText,
            today,
        );
        // const movedTaskTodayAgenda = await testUtils.taskUtils.existsInAgenda(taskText, today);
        const movedTaskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        await expect(
            taskYesterday &&
                !taskToday &&
                !movedTaskYesterday &&
                movedTaskTodayMyDay,
        ).toEqual(true);
    });

    it('schedule task for today from review panel', async () => {
        const taskText = 'review';
        const yesterday = -1;
        const today = 0;
        // go to yesterday
        await testUtils.controls.openMyDaySpecific(yesterday);
        // add task
        await testUtils.taskUtils.createTask(taskText);
        // check task in yesterday
        const taskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        // check tas kin today (leaves today open)
        const taskToday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            today,
        );
        // go back to yesterday
        await testUtils.controls.openMyDaySpecific(today);
        // open review dropdown
        await testUtils.controls.openReview();
        // schedule the created task for today
        await testUtils.taskUtils.scheduleFromReview(taskText, today);
        // close review
        await testUtils.controls.closeReview();
        // check the task exists yesterday / today
        const movedTaskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        const movedTaskToday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            today,
        );
        await expect(
            taskYesterday &&
                !taskToday &&
                !movedTaskYesterday &&
                movedTaskToday,
        ).toEqual(true);
    });

    it('schedule task for a day in the future from review panel', async () => {
        const taskText = 'future review';
        const yesterday = -1;
        const tomorrow = 1;
        // go to yesterday
        await testUtils.controls.openMyDaySpecific(yesterday);
        // add task
        await testUtils.taskUtils.createTask(taskText);
        // check task in yesterday
        const taskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        // check tas kin today (leaves today open)
        const taskTomorrow = await testUtils.taskUtils.existsInMyDay(
            taskText,
            tomorrow,
        );
        // go back to yesterday
        await testUtils.controls.openMyDaySpecific(tomorrow);
        // open review dropdown
        await testUtils.controls.openReview();
        // schedule the created task for today
        await testUtils.taskUtils.scheduleFromReview(taskText, -1);
        // close review
        await testUtils.controls.closeReview();
        // check the task exists yesterday / today
        const movedTaskYesterday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            yesterday,
        );
        const movedTaskToday = await testUtils.taskUtils.existsInMyDay(
            taskText,
            tomorrow,
        );
        await expect(
            taskYesterday &&
                !taskTomorrow &&
                !movedTaskYesterday &&
                movedTaskToday,
        ).toEqual(true);
    });

    it('convert to task in my day should have date', async () => {
        const taskText = 'my day convert';
        await testUtils.controls.openMyDay();
        await testUtils.pageUtils.replaceCurrentContent(taskText);
        await testUtils.controls.ctrlA();
        await testUtils.controls.openConvertMenu();
        await testUtils.controls.selectConvertToTask();
        const taskCreated = await testUtils.taskUtils.existsInMyDay(
            taskText,
            0,
        );
        await testUtils.pageUtils.replaceCurrentContent(' ');
        // if the task had date, after deleting from page it will show in agenda
        const taskHasDate = await testUtils.taskUtils.existsInAgenda(
            taskText,
            0,
        );
        await expect(taskCreated && taskHasDate).toEqual(true);
    });
});
