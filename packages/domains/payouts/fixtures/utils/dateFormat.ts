const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

export const getFormattedPayoutDate = (payoutDate = new Date()) => {
    const date = payoutDate.getUTCDate();
    const day = DAYS[payoutDate.getUTCDay()]!;
    const month = MONTHS[payoutDate.getUTCMonth()]!;
    const year = payoutDate.getUTCFullYear();

    const withoutDay = `${month} ${date}, ${year}`;
    const withDay = `${day}, ${withoutDay}`;

    return { withDay, withoutDay } as const;
};
