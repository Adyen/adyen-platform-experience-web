/**
 * Tells the model what day it is, and how to use dates as tool filters. Models do not know it, and make one up when asked for "30 days ago" or "last month",
 * which then ends up in tool arguments such as `createdSince`.
 *
 * Only the date is included, not the time: the system prompt then stays identical for the whole day, which keeps the
 * backend's prompt caching effective.
 */
export const getCurrentDateInstruction = (now: Date = new Date(), timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) => {
    // The `en-CA` locale formats dates as YYYY-MM-DD.
    const date = now.toLocaleDateString('en-CA', { timeZone });

    return [
        `Today's date is ${date} (time zone ${timeZone}). Use it to turn relative dates the user mentions, such as "30 days ago", "last month" or "yesterday", into exact ISO 8601 dates when calling tools. Never guess today's date.`,
        'When you filter by date, always provide both the start and the end of the period: if you set createdSince, also set createdUntil, and the other way around. For a period without an end, such as "since March", use today as the end date.',
    ].join(' ');
};
