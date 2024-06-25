import { IntegrationType } from '~/constants';
import { IntegrationAuthStatus } from '~/workers/integrations/base';

export enum GithubIntegrationAction {
    REQUEST = 'github integration request',
    GET_MYSELF = 'github integration get myself',
    GET_REPOSITORIES = 'github integration get repositories',
    INITIALIZE = 'github integration initialize',
    EXECUTE = 'github integration initialize short',
    FETCH_REPOSITORY = 'github integration fetch repository',
    FETCH_ISSUE = 'github integration fetch issue',
    FETCH_PR = 'github integration fetch pr',
    FETCH_COMMIT_STATUSES = 'github integration fetch commit statuses',
    FETCH_COMMIT_CHECKS = 'github integration fetch commit checks',
    FETCH_TIMELINE = 'github integration fetch timeline',
    INITIAL_LOAD_REPOSITORY = 'github integration initial load repository',
    PROCESS_REMOTE_CHANGE = 'github integration process remote change',
    POST_COMMENT = 'github integration post comment',
    REMOVE_REPOSITORY = 'github integration remove repository',
    LOAD_TEAMS = 'github integration load teams',
    LOAD_ORGANIZATIONS = 'github integration load organizations',
    LOAD_REPOSITORIES = 'github integration load repositories',
}

export enum GithubLoadingState {
    NOT_STARTED = 'not started',
    DONE = 'done',
    IN_PROGRESS = 'loading',
    ERROR = 'error',
}

export enum GithubEventTypes {
    COMMITED = 'committed',
    COMMENTED = 'commented',
    REVIEWED = 'reviewed',
    ASSIGNED = 'assigned',
    CLOSED = 'closed',
    LABELED = 'labeled',
    CROSS_REFERENCED = 'cross-referenced',
}

export enum GithubIssueState {
    OPEN = 'open',
    CLOSED = 'closed',
}

export enum GithubIntegrationDataType {
    ISSUE = 'github_Issue',
    PR = 'github_PullRequest',
    REPOSITORY = 'github_Repository',
    TEAM = 'github_Team',
    ORGANIZATION = 'github_Organization',
}

export const GithubSymbols = {
    VIEW_CONTEXT: Symbol('viewContext'),
    TRACKING_ACTION_SOURCE: Symbol('trackingSource'),
};

export type GithubUser = {
    id: number;
    avatar_url: string;
    login: string;
    name: string;
    type: string;
};

export type GithubOrganizationDetail = {
    login: string;
    integrationId: string;
    integrationType: IntegrationType.GITHUB;
    id: number | string;
    avatar_url: string;
    description: string;
    name: string;
};

export type GithubOrganization = {
    login: string;
    integrationId: string;
    integrationType: IntegrationType.GITHUB;
    type: GithubIntegrationDataType;
    id: number | string;
    avatar_url: string;
    description: string;
};

export type GithubTeam = {
    id: number;
    name: string;
    description: string;
    slug: string;
    members_url: string;
    url: string;
    organization: GithubOrganizationDetail;
    created_at: string;
    updated_at: string;
    html_url: string;
    members_count: number;
};

export type GithubReactions = {
    '+1': number;
    '-1': number;
    confused: number;
    eyes: number;
    heart: number;
    hooray: number;
    laugh: number;
    rocket: number;
    total_count: number;
    url: string;
};

export type GithubLabel = {
    color: string;
    default: boolean;
    description: string;
    id: number;
    name: string;
    url: string;
};

export enum GithubStateReason {
    COMPLETED = 'completed',
    NOT_PLANNED = 'not_planned',
    REOPENED = 'reopened',
}

export type GithubAuthor = {
    name: string;
    email: string;
    date: string;
};

export type GithubEventCommited = {
    sha: string;
    html_url: string;
    message: string;
    author: GithubAuthor;
    committer: GithubAuthor;
    event: GithubEventTypes.COMMITED;
};

export type GithubEventReviewed = {
    user: GithubUser;
    id: number;
    html_url: string;
    updated_at: string;
    body?: string;
    event: GithubEventTypes.REVIEWED;
    created_at: string;
    submitted_at: string;
};

export type GithubEventAssigned = {
    id: number;
    url: string;
    actor: GithubUser;
    assignee: GithubUser;
    event: GithubEventTypes.ASSIGNED;
    created_at: string;
};

export type GithubEventClosed = {
    id: number;
    url: string;
    actor: GithubUser;
    event: GithubEventTypes.CLOSED;
    created_at: string;
};

export type GithubEventLabeled = {
    id: number;
    url: string;
    actor: GithubUser;
    label: GithubLabel;
    event: GithubEventTypes.LABELED;
    created_at: string;
};

export type GithubEventCommented = {
    user: GithubUser;
    id: number;
    html_url: string;
    updated_at: string;
    reactions: GithubReactions;
    body: string;
    body_html: string;
    event: GithubEventTypes.COMMENTED;
    submitted_at: string;
    created_at: string;
};

export type CrossReferenceSource = {
    type: string;
    issue: any;
};

export type GithubEventCrossReferenced = {
    actor: GithubUser;
    created_at: string;
    updated_at: string;
    source: CrossReferenceSource;
    event: GithubEventTypes.CROSS_REFERENCED;
};

export type GithubTimelineEvent =
    | GithubEventCommited
    | GithubEventCommented
    | GithubEventReviewed
    | GithubEventAssigned
    | GithubEventClosed
    | GithubEventLabeled
    | GithubEventCrossReferenced;

export type GithubRepositoryPermissions = {
    admin: boolean;
    push: boolean;
    pull: boolean;
    triage: boolean;
    maintain: boolean;
};

export type GithubRepository = {
    id: string;
    vaultId: string;
    integrationId: string;
    integrationType: IntegrationType.GITHUB;
    html_url: string;
    owner: GithubUser;
    name: string;
    full_name: string;
    permissions: GithubRepositoryPermissions;
    private: boolean;
    visibility: string;
    archived: boolean;
    description: string;
    created_at: string;
    updated_at: string;
    open_issues_count: number;
    type: GithubIntegrationDataType;
};

export type GithubCommitCheckOutput = {
    annotations_count: number;
    annotations_url: string;
    summary: string;
    text?: string;
    title: string;
};

export type GithubCommitCheckApp = {
    name: string;
    owner: GithubUser;
    id: number;
};

export type GithubCommitCheck = {
    app: GithubCommitCheckApp;
    check_suite: any;
    completed_at: string;
    conclusion: // neutral icon
    | 'neutral'
        | 'skipped'
        | 'stale'
        // success icon
        | 'success'
        // failure icon
        | 'failure'
        | 'cancelled'
        | 'timed_out'
        | 'action_required'
        | null;
    details_url: string;
    external_id: string;
    head_sha: string;
    html_url: string;
    id: number;
    name: string;
    output: GithubCommitCheckOutput;
    pull_requests: any[];
    started_at: string;
    status: 'queued' | 'in_progress' | 'completed';
    url: string;
};

export type GithubCommitStatusesResponse = {
    avatar_url: string;
    context: string;
    created_at: string;
    updated_at: string;
    creator: GithubUser;
    description: string;
    id: number;
    state: 'error' | 'failure' | 'pending' | 'success';
    target_url: string;
    url: string;
};

export type GithubPullRequest = {
    assignee: GithubUser;
    assignees: GithubUser[];
    base: any;
    body: string | null;
    body_html: string | null;
    closed_at: string | null;
    comments: number;
    created_at: string;
    draft: boolean;
    html_url: string;
    id: string;
    isMention?: boolean;
    integrationId: string;
    integrationType: IntegrationType.GITHUB;
    labels: GithubLabel[];
    locked: boolean;
    repository?: GithubRepository;
    repository_url?: string;
    head?: {
        repo: GithubRepository;
        ref: string;
        sha: string;
    };
    pull_request: any;
    merge_commit_sha: string | null;
    merged: boolean;
    merged_at: string | null;
    number: number;
    requested_reviewers: GithubUser[];
    requested_teams: GithubTeam[];
    review_comments: number;
    state: GithubIssueState;
    title: string;
    updated_at: string;
    user: GithubUser;
    vaultId: string;
    type: GithubIntegrationDataType;
    timeline?: GithubTimelineEvent[];
    commitStatuses?: GithubCommitStatusesResponse[];
    commitChecks?: GithubCommitCheck[];
    acreomMeta: Record<string, any>;
    repositoryId: string;
};

export type GithubIssue = {
    assignee: GithubUser;
    assignees: GithubUser[];
    body: string | null;
    body_html: string | null;
    closed_at: string | null;
    comments: number;
    comments_url: string;
    created_at: string;
    html_url: string;
    id: string;
    isMention?: boolean;
    integrationId: string;
    integrationType: IntegrationType.GITHUB;
    labels: GithubLabel[];
    locked: boolean;
    number: number;
    reactions: GithubReactions;
    repository: GithubRepository;
    repository_url: string;
    state: GithubIssueState;
    updated_at: string;
    state_reason: GithubStateReason | null;
    timeline_url: string;
    title: string;
    url: string;
    user: GithubUser;
    vaultId: string;
    type: GithubIntegrationDataType;
    timeline?: GithubTimelineEvent[];
    acreomMeta: Record<string, any>;
    repositoryId: string;
};

export type GithubIntegrationData = {
    credentials: string;
    account: GithubUser;
    baseUrl?: string;
    repositories: string[];
};

export type GithubIntegration = {
    id: string;
    vaultId: string;
    type: IntegrationType.GITHUB;
    data: GithubIntegrationData;
    authStatus: IntegrationAuthStatus;
    loading: {
        organizations: GithubLoadingState;
        teams: GithubLoadingState;
        repositories: GithubLoadingState;
        [key: string]: GithubLoadingState;
    };
};

export type GithubCommitChecksResponse = {
    total_count: number;
    check_runs: GithubCommitCheck[];
};

export type GithubListRequestParams = {
    state?: 'open' | 'closed' | 'all';
    filter?: 'assigned' | 'created' | 'mentioned' | 'subscribed' | 'all';
    since?: string;
    direction?: 'asc' | 'desc';
    sort?: 'created' | 'updated' | 'comments';
    pulls?: boolean;
};

export type GithubListRequestOptions = {
    query: GithubListRequestParams;
    initialLoad: boolean;
    isMention: boolean;
};

export type GithubPageFetchResponse<T> = {
    data: T[];
    prevUrl: string | null;
    lastUrl: string | null;
    nextUrl: string | null;
};
