export const TabSymbols = {
    TAB_ID: Symbol('tabId'),
    TAB_GROUP_ID: Symbol('tabGroupId'),
    ENTITY_ID: Symbol('entityId'),
    ENTITY_TYPE: Symbol('entityType'),
    IS_ACTIVE: Symbol('isActive'),
    TAB_WIDTH: Symbol('tabWidth'),
    TAB_DATA: Symbol('tabData'),
    SET_SCROLL_POSITION: Symbol('setScrollPosition'),
    GET_SCROLL_POSITION: Symbol('getScrollPositionById'),

    ON: Symbol('tab-on'),
    OFF: Symbol('tab-off'),
    EMIT: Symbol('tab-emit'),

    UPDATE_TAB_DATA: Symbol('updateTabData'),
};

export const CalendarSymbols = {
    CALENDAR: Symbol('calendar'),
    EVENT: Symbol('event'),
    CAN_MODIFY: Symbol('canModify'),
    EVENT_ATTENDEES: Symbol('eventAttendees'),
    DEFAULT_CALENDAR: Symbol('defaultCalendar'),
    CALENDAR_OWNER_EMAIL: Symbol('calendarOwnerEmail'),
    IS_READER: Symbol('isReader'),
    CAN_INVITE_OTHERS: Symbol('canInviteOthers'),
    CAN_SEE_OTHER_GUESTS: Symbol('canSeeOthers'),
    CAN_UPDATE_ATTENDANCE: Symbol('canUpdateAttendance'),
    HAS_CONFERENCING: Symbol('hasConferencing'),
};

export const PageListSymbols = {
    TYPE: Symbol('pageListType'),
};
