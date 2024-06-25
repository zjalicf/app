import { add, format } from 'date-fns';
import { v4 } from 'uuid';
import { IDocument } from '~/components/document/model';
import { PageStatus } from '~/constants';

export const welcomeToAcreomDoc = (
    vaultId: string,
    docId: string = v4(),
    tasks: string,
    integrationsDocId: string,
): Partial<IDocument> => ({
    id: docId,
    vaultId,
    icon: '👋',
    title: 'Welcome to acreom',
    status: 'new',
    projectId: null,
    updatedAt: add(new Date(), { seconds: 1 }),
    createdAt: add(new Date(), { seconds: 1 }),
    content: `<h3 data-id="${v4()}">Ship faster</h3><p>acreom is designed to make it easier to organize your work and help you ship faster.</p><p></p><h3 data-id="${v4()}">Active pages</h3><p>Use this page as a project for an issue or feature you are currently working on.<strong> Go ahead and change the status of this page</strong> to in progress. You will find all pages with a status in the Active view in the sidebar, so you can track progress easily over your workload.</p><p></p><h3 data-id="${v4()}">Break down your work using tasks</h3>${tasks}<p></p><h3 data-id="${v4()}">Create specs</h3><pre><code>if (false == true) {\n// log a message\n}</code></pre><p></p><h3 data-id="${v4()}">Schedule this page for tomorrow</h3><p>Set a date to this page for today to make sure it's in today's My Day.</p><p></p><h3 data-id="${v4()}">Integrations</h3><p>The power of acreom comes with integrations. By connecting your dev tools with acreom, you will have all of your issues and PRs in one place alongside your pages.</p><p></p><p>Start by typing <code>/jira</code> or <code>/github</code>.</p><p></p><p>Learn more in <inline-document-link id="${integrationsDocId}"></inline-document-link>.</p>`,
    pageStatus: PageStatus.TODO,
});

export const connectGithubAndJiraDoc = (
    vaultId: string,
    docId: string = v4(),
): Partial<IDocument> => ({
    id: docId,
    vaultId,
    icon: '🖥️',
    title: 'Connect Github and Jira',
    status: 'new',
    projectId: null,
    updatedAt: add(new Date(), { seconds: 5 }),
    createdAt: add(new Date(), { seconds: 5 }),
    content: `<p>Using integrations, you can:</p><p></p><ul><li><p>Add page to pull request</p></li><li><p>Link any Issues or PRs to your page</p></li><li><p>Break down Jira issues and add personal context</p></li></ul><p></p><p>Once you are done, you can easily access the linked issue and PRs, which enables you to change the status and hit merge in seconds.</p><p></p><h3 data-id="${v4()}">Suggested Workflow</h3><ol><li><p>Select an issue / PR you are working on.</p></li><li><p>Create a new page for the issue by clicking the '+' button on the issue / PR.</p></li><li><p>Break the issue / PR into smaller tasks on the page.</p></li><li><p>Use the <code>/</code> command to add relevant links and documents from your knowledge base.</p></li><li><p>Set a page status for visibility in the Active view.</p></li><li><p>Complete and archive the page upon task completion, adding it to your long-term knowledge base.</p></li></ol>`,
});

export const nextStepsDoc = (
    vaultId: string,
    docId: string = v4(),
): Partial<IDocument> => ({
    id: docId,
    vaultId,
    icon: '🚀',
    title: 'Next Steps',
    status: 'new',
    projectId: null,
    updatedAt: add(new Date(), { seconds: 6 }),
    createdAt: add(new Date(), { seconds: 6 }),
    content: `<h3 data-id="${v4()}">Import your knowledge</h3><p>If you're switching from a different tool, you can quickly import your existing knowledge into this vault and continue your work seamlessly.</p><ul><li><p>Click vault icon, then "Import"</p></li></ul><p></p><h3 data-id="${v4()}">Resources</h3><ul><li><p>Join our community on <a href="https://discord.gg/RS9ThmHhQp" target="_blank">discord.</a></p></li><li><p>Read our <a href="https://acreom.com/user-guide" target="_blank">documentation.</a></p></li><li><p>Product <a href="https://roadmap.acreom.com" target="_blank">roadmap.</a></p></li></ul><p></p><h3 data-id="${v4()}">Share Your Experience</h3><ul><li><p>If you love our product, tell a friend!</p></li><li><p>Share feedback from the app help menu.</p></li><li><p>Share your thoughts about us on <a href="https://twitter.com/acreom" target="_blank">Twitter.</a></p></li></ul><p></p><h3 data-id="${v4()}">Need help?</h3><p>Connect with us on <a href="https://discord.gg/RS9ThmHhQp" target="_blank">discord.</a></p>`,
});

export const onboardingDailyDoc = (
    vaultId: string,
    divideAndConquerDocId: string,
): Partial<IDocument> => ({
    id: v4(),
    vaultId,
    title: format(new Date(), 'EEEE, LLL d, yyyy'),
    dailyDoc: format(new Date(), 'yyyy-MM-dd'),
    status: 'new',
    projectId: null,
    updatedAt: add(new Date(), { seconds: 1 }),
    createdAt: add(new Date(), { seconds: 1 }),
    content: `<p>Welcome! This is your daily document. It is designed to be used as a daily braindump for your notes and tasks and your daily planner.</p><p></p><p>The power of acreom comes from pages which can serve as a knowledge base as well as projects. Head over to <inline-document-link id="${divideAndConquerDocId}"></inline-document-link> to learn more.</p><p></p><p>Feel free to delete this and start your day!</p>`,
});

export const mobileOnboardingDailyDoc = (
    vaultId: string,
): Partial<IDocument> => ({
    id: v4(),
    vaultId,
    title: format(new Date(), 'EEEE, LLL d, yyyy'),
    dailyDoc: format(new Date(), 'yyyy-MM-dd'),
    status: 'new',
    updatedAt: add(new Date(), { seconds: 1 }),
    createdAt: add(new Date(), { seconds: 1 }),
    content: `<p>Welcome! <a target="_blank" rel="noopener noreferrer nofollow" href="https://acreom.com">acreom</a> mobile is a markdown knowledge base with tasks in your pocket.</p><p></p><p>It's designed for a quick capture of your ideas, issues and tasks with instant access to your knowledge base and agenda while on the go.</p><p></p><ul><li><p>create new page with the <code>+</code> button, or </p></li><li><p>use long-press <code>+</code> for creating new folders</p></li><li><p>sync real-time with your acreom desktop</p></li></ul><p></p><p>If you're new to acreom try out our <a target="_blank" rel="noopener noreferrer nofollow" href="https://acreom.com/downloads">desktop</a> app to experience it's full power.</p>`,
});
