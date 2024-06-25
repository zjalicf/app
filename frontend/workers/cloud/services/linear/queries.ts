const GetTeams = `
query GetTeamsAndStatuses {
  teams {
    nodes {
      id
      name
    }
  }
  issuePriorityValues {
    priority
    label
  }
}
`;

const GetTeamMembers = `
query GetTeamMembers($teamId: String!, $after: String, $first: Int, $filter: UserFilter) {
  team(id: $teamId) {
    members(after: $after, first: $first, filter: $filter) {
      nodes {
        id
        name
        avatarUrl
        createdAt
        displayName
        email
        updatedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;

const GetStates = `
query GetStates($filter: WorkflowStateFilter, $after: String, $first: Int) {
  workflowStates(filter: $filter, after: $after, first: $first) {
    nodes {
      id
      name
      color
      position
      type
      updatedAt
      createdAt
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

const GetProjects = `
query GetProjects($teamId: String!, $after: String, $first: Int) {
  team(id: $teamId) {
    projects(after: $after, first: $first) {
      nodes {
        id
        name
        state
        color
        icon
        url
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;

const GetIssues = `
query GetIssues($filter: IssueFilter, $first: Int, $after: String) {
  issues(filter: $filter, first: $first, after: $after) {
    pageInfo {
      hasNextPage
      hasPreviousPage
      endCursor
      startCursor
    }
    nodes {
      createdAt
      descriptionState
      id
      identifier
      labelIds
      priority
      title
      url
      updatedAt
      cycle {
        id
      }
      assignee {
        id
      }
      creator {
        id
      }
      parent {
        id
      }
      project {
        id
      }
      state {
        id
        type
      }
      team {
        id
      }
    }
  }
}
`;

const GetCommentsAndHistory = `
query Comments($issueId: String!, $first: Int) {
  issue(id: $issueId) {
    comments(first: $first) {
      nodes {
        bodyData
        id
        parent {
          id
        }
        reactionData
        user {
          id
        }
        updatedAt
        createdAt
        botActor {
          id
          type
          subType
          name
          userDisplayName
          avatarUrl
        }
        url
        resolvingComment {
          id
        }
        resolvingUser {
          id
        }
        resolvedAt
      }
    }
    history(first: $first) {
      nodes {
        actorId
        createdAt
        fromAssigneeId
        fromCycleId
        fromDueDate
        fromEstimate
        fromParentId
        fromProjectId
        fromPriority
        fromStateId
        fromTeamId
        fromTitle
        removedLabelIds
        addedLabelIds
        toAssigneeId
        toConvertedProjectId
        toParentId
        toEstimate
        toDueDate
        toCycleId
        toProjectId
        toPriority
        toStateId
        toTeamId
        toTitle
        trashed
        updatedDescription
        autoArchived
        autoClosed
        archivedAt
        archived
        botActor {
          id
          name
          userDisplayName
          avatarUrl
          type
          subType
        }
      }
    }
  }
}
`;

const GetCycles = `
query Cycles($first: Int, $filter: CycleFilter) {
  cycles(first: $first, filter: $filter) {
    nodes {
      id
      endsAt
      startsAt
      number
      name
      createdAt
      progress
      completedAt
      archivedAt
    }
  }
}
`;

export const LinearQueries = {
    GetTeams,
    GetTeamMembers,
    GetStates,
    GetProjects,
    GetCycles,
    GetIssues,
    GetCommentsAndHistory,
};
