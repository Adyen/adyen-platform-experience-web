import { expect, type Page } from '@playwright/test';

export const getFormattedPayoutDate = (() => {
    const MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ] as const;

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

    return (payoutDate = new Date()) => {
        const date = payoutDate.getUTCDate()!;
        const day = DAYS[payoutDate.getUTCDay()]!;
        const month = MONTHS[payoutDate.getUTCMonth()]!;
        const year = payoutDate.getUTCFullYear();

        const withoutDay = `${month} ${date}, ${year}`;
        const withDay = `${day}, ${withoutDay}`;

        return { withDay, withoutDay } as const;
    };
})();

export const createPayoutBreakdownGroup = (page: Page, name: string, expanded = false) => {
    const buttonCollapsed = page.getByRole('button', { name, exact: true, disabled: false, expanded: false });
    const buttonExpanded = page.getByRole('button', { name, exact: true, disabled: false, expanded: true });
    const breakdownRegion = page.getByRole('region', { name, exact: true });

    let isExpanded = expanded;

    const expectToBeCollapsed = () =>
        Promise.all([expect(buttonCollapsed).toBeVisible(), expect(buttonExpanded).toBeHidden(), expect(breakdownRegion).toBeHidden()]);

    const expectToBeExpanded = () =>
        Promise.all([expect(buttonCollapsed).toBeHidden(), expect(buttonExpanded).toBeVisible(), expect(breakdownRegion).toBeVisible()]);

    const toggleBreakdown = async () => {
        await ((isExpanded = !isExpanded) ? buttonCollapsed : buttonExpanded).click();
    };

    return { expectToBeCollapsed, expectToBeExpanded, toggleBreakdown };
};
