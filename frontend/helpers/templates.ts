import { sub } from 'date-fns';
import { IEvent } from '~/@types';
import {
    extractDate,
    formatRelativeToDate,
    DateTimeOptions,
} from '~/helpers/date';

const emptyLine = '<p></p>';
const listStart = '<ul>';
const listEnd = '</ul>';
const horizontalRule = '<hr>';

export const createMeetingNotes = (
    event: IEvent,
    dateTimeOptions: DateTimeOptions,
): string => {
    const label = `<p>#meeting-notes</p>`;
    const heading = `${
        event.acreomRecurringId
            ? '<p>' +
              formatRelativeToDate(
                  event,
                  sub(extractDate(event.start), { months: 1 }),
                  true,
                  dateTimeOptions,
              ) +
              '</p>'
            : ''
    }<p><inline-event id='${event.id}'></inline-event></p>`;
    const output = [label, heading, emptyLine];

    const notes = `<h2>Notes:</h2>`;
    output.push(notes, emptyLine, emptyLine);

    const actionPoints = `<h2>Action items:</h2>`;
    const emptyPoint = `<li><p></p></li>`;

    output.push(actionPoints, listStart, emptyPoint, listEnd, emptyLine);

    if (event.attendees && event.attendees.length > 0) {
        const attendeesHeading = `<h2>Attendees:</h2>`;
        const attendeesList =
            event.attendees?.map(
                attendee => `<li><p>${attendee.email}</p></li>`,
            ) ?? [];
        output.push(
            horizontalRule,
            attendeesHeading,
            listStart,
            ...attendeesList,
            listEnd,
            emptyLine,
        );
    }

    return output.join('');
};
