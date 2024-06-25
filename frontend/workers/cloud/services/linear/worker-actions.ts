import { LinearIntegrationActions } from '~/constants/linear';
import { LinearIntegrationService } from '~/workers/cloud/services/linear/linear-integration';

export class LinearWorkerActions {
    static execute(
        client: LinearIntegrationService,
        operation: LinearIntegrationActions,
        payload: any,
    ) {
        switch (operation) {
            case LinearIntegrationActions.GET_MYSELF:
                return client.getMyself(payload.integration);
            case LinearIntegrationActions.GET_ORGANIZATION:
                return client.getOrganization(payload.integration);
            case LinearIntegrationActions.GET_PRIORITIES:
                return client.getPriorities(payload.integration);
            case LinearIntegrationActions.GET_TEAMS:
                return client.getTeams(
                    payload.integration,
                    payload.first,
                    payload.after,
                    payload.filter,
                );
            case LinearIntegrationActions.GET_CYCLES:
                return client.getCycles(
                    payload.integration,
                    payload.first,
                    payload.after,
                    payload.filter,
                );
            case LinearIntegrationActions.GET_PROJECTS:
                return client.getProjects(
                    payload.integration,
                    payload.teamId,
                    payload.filter,
                    payload.first,
                    payload.after,
                );
            case LinearIntegrationActions.GET_STATES:
                return client.getStates(
                    payload.integration,
                    payload.filter,
                    payload.first,
                    payload.after,
                );
            case LinearIntegrationActions.GET_LABELS:
                return client.getLabels(
                    payload.integration,
                    payload.filter,
                    payload.first,
                    payload.after,
                );
            case LinearIntegrationActions.GET_USERS:
                return client.getUsers(
                    payload.integration,
                    payload.teamId,
                    payload.filter,
                    payload.first,
                    payload.after,
                );
            case LinearIntegrationActions.GET_ISSUE:
                return client.getIssue(
                    payload.integration,
                    payload.issueId,
                    payload.identifier,
                );
            case LinearIntegrationActions.SEARCH_ISSUES:
                return client.searchIssues(
                    payload.integration,
                    payload.query,
                    payload.filter,
                );
            case LinearIntegrationActions.GET_ISSUES:
                return client.getIssues(
                    payload.integration,
                    payload.filter,
                    payload.first,
                    payload.after,
                );
            case LinearIntegrationActions.GET_COMMENTS_AND_HISTORY:
                return client.getCommentsAndHistory(
                    payload.integration,
                    payload.issueId,
                );
            case LinearIntegrationActions.UPDATE_ISSUE:
                return client.updateIssue(
                    payload.integration,
                    payload.issueId,
                    payload.issue,
                );
            default:
                return null;
        }
    }
}
