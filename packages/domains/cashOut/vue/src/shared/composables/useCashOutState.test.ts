import { effectScope, ref } from 'vue';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ICashOutEligibility, ICashOutResponse } from '@integration-components/types';
import { useCashOutState } from './useCashOutState';

const endpoints: {
    getAccounts?: ReturnType<typeof vi.fn>;
    getBalanceAccounts?: ReturnType<typeof vi.fn>;
    getCashOutAvailableAmounts?: ReturnType<typeof vi.fn>;
    getCashOutEligibility?: ReturnType<typeof vi.fn>;
} = {};

// The texts show their key and values, and the amounts their value and currency, so the tests can tell what is shown.
const core = {
    externalErrorHandler: undefined as ReturnType<typeof vi.fn> | undefined,
    i18n: {
        get: (key: string, options?: { values?: Record<string, string> }) => `${key} ${JSON.stringify(options?.values ?? {})}`,
        amount: (value: number, currency: string) => `${value} ${currency}`,
    },
};

vi.mock('@integration-components/core/vue', () => ({
    useConfigContext: () => ({ endpoints }),
    useCoreContext: () => core,
}));

const transferInstrumentOf = (eligible: boolean) => ({ eligible, transferInstrumentId: eligible ? 'TI1' : 'TI2' });

const eligibilityOf = (value: number, transferInstruments = [transferInstrumentOf(true)]) =>
    ({
        isCashoutAvailable: true,
        availableForCashOutBalance: { value, currency: 'USD' },
        transferInstruments,
        unavailableReasons: [],
    }) as unknown as ICashOutEligibility;

let ELIGIBILITY_BY_BALANCE_ACCOUNT: Record<string, ICashOutEligibility>;

const renderCashOutState = (...args: Parameters<typeof useCashOutState>) => {
    const scope = effectScope();
    const state = scope.run(() => useCashOutState(...args))!;
    return { state, stop: () => scope.stop() };
};

// The account keys come from the balance accounts endpoint; they deliberately don't follow from the ids.
const ACCOUNT_KEYS: Record<string, string> = { BA1: 'BalanceAccount.KEY1', BA2: 'BalanceAccount.KEY2' };
const balanceAccountIdOf = (accountKey: string) => Object.keys(ACCOUNT_KEYS).find(id => ACCOUNT_KEYS[id] === accountKey)!;

// What the dropdown shows under a balance account, with what it can cash out once known
const AVAILABLE = 'cashOut.common.balanceAccount.availableForCashOut';
const AVAILABLE_WITH_ID = 'cashOut.common.balanceAccount.availableForCashOutWithId';
const descriptionOf = (state: ReturnType<typeof useCashOutState>, id: string) =>
    state.balanceAccountOptions.value.find(({ value }) => value === id)?.description;

const requestedBalanceAccountIds = () =>
    endpoints.getCashOutEligibility!.mock.calls.map(([, params]) => balanceAccountIdOf((params as { path: { accountKey: string } }).path.accountKey));

describe('useCashOutState', () => {
    beforeEach(() => {
        core.externalErrorHandler = vi.fn();
        ELIGIBILITY_BY_BALANCE_ACCOUNT = { BA1: eligibilityOf(100), BA2: eligibilityOf(200) };
        // A new endpoint for every test, because the balance accounts are cached per endpoint.
        endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({
            data: [
                { id: 'BA1', accountKey: ACCOUNT_KEYS.BA1 },
                { id: 'BA2', accountKey: ACCOUNT_KEYS.BA2 },
            ],
        });
        endpoints.getAccounts = vi
            .fn()
            .mockResolvedValue({ data: [{ accountKey: 'BalanceAccountHolder.AH1', accountType: 'BalanceAccountHolder' }] });
        // A new response for every request, like the API's.
        endpoints.getCashOutAvailableAmounts = vi.fn(async () => ({
            balanceAccounts: [
                { balanceAccountId: 'BA1', availableForCashOut: { value: 100, currency: 'USD' } },
                { balanceAccountId: 'BA2', availableForCashOut: { value: 200, currency: 'USD' } },
            ],
        }));
        endpoints.getCashOutEligibility = vi.fn(async (_: unknown, { path }: { path: { accountKey: string } }) => {
            return ELIGIBILITY_BY_BALANCE_ACCOUNT[balanceAccountIdOf(path.accountKey)];
        });
    });

    test('should not report anything to the onError of the SDK when everything loads', async () => {
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
        expect(core.externalErrorHandler).not.toHaveBeenCalled();

        stop();
    });

    test('should fetch the eligibility of the first balance account', async () => {
        const { state, stop } = renderCashOutState();

        expect(state.shellState.value).toBe('loading');

        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
        expect(state.selectedBalanceAccountId.value).toBe('BA1');
        expect(state.selectedAccountKey.value).toBe('BalanceAccount.KEY1');
        expect(state.eligibility.value).toEqual(ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1);
        expect(endpoints.getCashOutEligibility).toHaveBeenCalledWith(expect.anything(), { path: { accountKey: 'BalanceAccount.KEY1' } });

        stop();
    });

    test('should use the given eligibility of the given balance account without fetching it', async () => {
        // Available amounts arriving after it would tell what it can cash out instead
        endpoints.getCashOutAvailableAmounts = vi.fn(() => new Promise(() => {}));
        const eligibility = eligibilityOf(300);
        const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA2', eligibility });

        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
        expect(state.selectedBalanceAccountId.value).toBe('BA2');
        expect(state.eligibility.value).toBe(eligibility);
        expect(endpoints.getCashOutEligibility).not.toHaveBeenCalled();

        stop();
    });

    // Such as the request in the Overview's modal, refreshed: the eligibility it was given is what it showed until then
    test('should fetch the eligibility of the given balance account on refresh', async () => {
        const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA2', eligibility: eligibilityOf(300) });
        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

        state.refresh();

        await vi.waitFor(() => expect(state.eligibility.value).toEqual(ELIGIBILITY_BY_BALANCE_ACCOUNT.BA2));
        expect(requestedBalanceAccountIds()).toEqual(['BA2']);

        stop();
    });

    test('should fetch the eligibility when another balance account is selected', async () => {
        const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA2', eligibility: eligibilityOf(300) });
        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

        state.selectedBalanceAccountId.value = 'BA1';

        await vi.waitFor(() => expect(state.eligibility.value).toEqual(ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1));
        expect(state.shellState.value).toBe('ready');
        expect(state.selectedAccountKey.value).toBe('BalanceAccount.KEY1');
        expect(endpoints.getCashOutEligibility).toHaveBeenCalledWith(expect.anything(), { path: { accountKey: 'BalanceAccount.KEY1' } });

        stop();
    });

    test('should fetch the eligibility of the selected balance account again when refreshed', async () => {
        const { state, stop } = renderCashOutState();
        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

        ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(50);
        state.refreshEligibility();

        await vi.waitFor(() => expect(state.eligibility.value).toEqual(eligibilityOf(50)));
        expect(requestedBalanceAccountIds()).toEqual(['BA1', 'BA1']);

        stop();
    });

    describe('Available amounts of the balance accounts', () => {
        // The account of the session needs no balance account, so it's asked for at the same time as them.
        test('should ask for the account of the session at the same time as the balance accounts', () => {
            endpoints.getBalanceAccounts = vi.fn(() => new Promise(() => {}));
            const { stop } = renderCashOutState();

            expect(endpoints.getAccounts).toHaveBeenCalledOnce();

            stop();
        });

        test('should request the available amounts for the account holder of the session', async () => {
            const { stop } = renderCashOutState();

            await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledOnce());
            expect(endpoints.getCashOutAvailableAmounts!.mock.lastCall?.[1]?.path).toEqual({ accountKey: 'BalanceAccountHolder.AH1' });

            stop();
        });

        // A session for a balance account has only that one, so nothing to pick from.
        test('should not request the available amounts for a session for a balance account', async () => {
            endpoints.getAccounts = vi.fn().mockResolvedValue({ data: [{ accountKey: ACCOUNT_KEYS.BA1, accountType: 'BalanceAccount' }] });
            endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({ data: [{ id: 'BA1', accountKey: ACCOUNT_KEYS.BA1 }] });
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            await vi.waitFor(() => expect(endpoints.getAccounts).toHaveBeenCalledOnce());
            await new Promise(resolve => setTimeout(resolve));
            expect(endpoints.getCashOutAvailableAmounts).not.toHaveBeenCalled();

            stop();
        });

        // The selected balance account is shown as soon as its eligibility arrives, whatever the amounts take.
        test('should not wait for the available amounts, showing the balance accounts without them until they arrive', async () => {
            let resolveAvailableAmounts!: (amounts: unknown) => void;
            endpoints.getCashOutAvailableAmounts = vi.fn(() => new Promise(resolve => (resolveAvailableAmounts = resolve)));
            endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({
                data: [
                    { id: 'BA1', accountKey: ACCOUNT_KEYS.BA1, description: 'Main' },
                    { id: 'BA2', accountKey: ACCOUNT_KEYS.BA2 },
                ],
            });
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            expect(state.eligibility.value).toEqual(eligibilityOf(100));
            expect(descriptionOf(state, 'BA1')).toBe('BA1');
            expect(descriptionOf(state, 'BA2')).toBeUndefined();

            resolveAvailableAmounts({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: { value: 100, currency: 'USD' } },
                    { balanceAccountId: 'BA2', availableForCashOut: { value: 200, currency: 'USD' } },
                ],
            });

            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE_WITH_ID} {"balanceAccountId":"BA1","amount":"100 USD"}`);
            expect(state.shellState.value).toBe('ready');

            stop();
        });

        test('should show what each balance account can cash out, after its id when it is named', async () => {
            endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({
                data: [
                    { id: 'BA1', accountKey: ACCOUNT_KEYS.BA1, description: 'Main' },
                    { id: 'BA2', accountKey: ACCOUNT_KEYS.BA2 },
                ],
            });
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE_WITH_ID} {"balanceAccountId":"BA1","amount":"100 USD"}`);

            stop();
        });

        // The selected one is shown as its eligibility tells it, so the dropdown and the component agree.
        test('should show the selected balance account with what its eligibility can cash out', async () => {
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(90);
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            await vi.waitFor(() => expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE} {"amount":"90 USD"}`));
            expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`);

            stop();
        });

        test('should show no amount for a balance account the API has none for, and still show it for the others', async () => {
            endpoints.getCashOutAvailableAmounts = vi.fn().mockResolvedValue({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: { value: 100, currency: 'USD' } },
                    { balanceAccountId: 'BA2', availableForCashOut: null },
                ],
            });
            endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({
                data: [
                    { id: 'BA1', accountKey: ACCOUNT_KEYS.BA1 },
                    { id: 'BA2', accountKey: ACCOUNT_KEYS.BA2, description: 'Savings' },
                ],
            });
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE} {"amount":"100 USD"}`));
            expect(descriptionOf(state, 'BA2')).toBe('BA2');

            stop();
        });

        // So the list never shows an amount for the selected balance account only, which would look like the others have none.
        test.each([
            ['the endpoint is not there', () => delete endpoints.getCashOutAvailableAmounts],
            ['they fail to load', () => (endpoints.getCashOutAvailableAmounts = vi.fn().mockRejectedValue(new Error('Internal error')))],
        ])('should show no amounts at all, not even for the selected balance account, when %s', async (_, setUp) => {
            setUp();
            endpoints.getBalanceAccounts = vi.fn().mockResolvedValue({
                data: [
                    { id: 'BA1', accountKey: ACCOUNT_KEYS.BA1, description: 'Main' },
                    { id: 'BA2', accountKey: ACCOUNT_KEYS.BA2 },
                ],
            });
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            expect(descriptionOf(state, 'BA1')).toBe('BA1');
            expect(descriptionOf(state, 'BA2')).toBeUndefined();
            expect(core.externalErrorHandler).not.toHaveBeenCalled();

            stop();
        });
    });

    test('should load the available amounts again when asked to, such as once the list of balance accounts closes', async () => {
        const { state, stop } = renderCashOutState();
        await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

        state.refreshAvailableAmounts();

        await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
        expect(requestedBalanceAccountIds()).toEqual(['BA1']);

        stop();
    });

    // So the component and the dropdown agree on what the selected balance account can cash out, as the newest of the two tells it.
    describe('Available amounts loaded after the eligibility', () => {
        // The amounts are shared per endpoint, so the endpoint stays the same and only what it responds changes
        const respondWithAmountForSelected = (selected: number) =>
            endpoints.getCashOutAvailableAmounts!.mockImplementation(async () => ({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: { value: selected, currency: 'USD' } },
                    { balanceAccountId: 'BA2', availableForCashOut: { value: 200, currency: 'USD' } },
                ],
            }));
        const renderReady = async () => {
            const view = renderCashOutState();
            await vi.waitFor(() => expect(view.state.shellState.value).toBe('ready'));
            await vi.waitFor(() => expect(descriptionOf(view.state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            return view;
        };

        test('should show what they tell for the selected balance account, in the eligibility and next to it, when it differs', async () => {
            const { state, stop } = await renderReady();
            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 100, currency: 'USD' });

            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));
            expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE} {"amount":"80 USD"}`);
            // Only what is available changes, the rest of the eligibility stays as it was
            expect(state.eligibility.value).toEqual({ ...eligibilityOf(100), availableForCashOutBalance: { value: 80, currency: 'USD' } });

            stop();
        });

        test('should show what the eligibility tells again once it is loaded again after them', async () => {
            const { state, stop } = await renderReady();
            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));

            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(120);
            state.refreshEligibility();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 120, currency: 'USD' }));

            stop();
        });

        test('should show the eligibility of another balance account once it is selected, loaded after them', async () => {
            const { state, stop } = await renderReady();
            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));

            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA2 = eligibilityOf(250);
            state.selectedBalanceAccountId.value = 'BA2';

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 250, currency: 'USD' }));

            stop();
        });

        // As newest, they no longer tell anything for it, so its eligibility tells it again
        test('should show what the eligibility tells again once they are loaded again without the selected balance account', async () => {
            const { state, stop } = await renderReady();
            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));

            endpoints.getCashOutAvailableAmounts!.mockImplementation(async () => ({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: null },
                    { balanceAccountId: 'BA2', availableForCashOut: { value: 210, currency: 'USD' } },
                ],
            }));
            state.refreshAvailableAmounts();

            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"210 USD"}`));
            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 100, currency: 'USD' });
            expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE} {"amount":"100 USD"}`);

            stop();
        });

        // Its fees, daily limit and bank accounts are in the currency of its eligibility, so an amount in another one can't replace it
        test('should keep what the eligibility tells when they tell an amount in another currency', async () => {
            const { state, stop } = await renderReady();
            endpoints.getCashOutAvailableAmounts!.mockImplementation(async () => ({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: { value: 80, currency: 'EUR' } },
                    { balanceAccountId: 'BA2', availableForCashOut: { value: 210, currency: 'USD' } },
                ],
            }));
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"210 USD"}`));

            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 100, currency: 'USD' });
            expect(descriptionOf(state, 'BA1')).toBe(`${AVAILABLE} {"amount":"100 USD"}`);

            stop();
        });

        // Like the request in the Overview's modal, given the eligibility of the Overview, which loads it again
        test('should show a given eligibility again once it is given again after them', async () => {
            const givenEligibility = ref(eligibilityOf(100));
            const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA1', eligibility: givenEligibility });
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));

            givenEligibility.value = eligibilityOf(120);

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 120, currency: 'USD' }));

            stop();
        });

        // Right after a cashOut the API may still show what was available before it
        test('should still show what is expected after a cashOut, when they show more', async () => {
            const { state, stop } = await renderReady();
            state.recordCashOut({ balanceAccount: 'BA1', amount: { value: 40, currency: 'USD' } } as ICashOutResponse);
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 60, currency: 'USD' }));

            respondWithAmountForSelected(90);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
            await new Promise(resolve => setTimeout(resolve));

            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 60, currency: 'USD' });

            stop();
        });

        test('should not load the eligibility again for a balance account with something to cash out', async () => {
            const { state, stop } = await renderReady();

            respondWithAmountForSelected(80);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 80, currency: 'USD' }));

            expect(endpoints.getCashOutEligibility).toHaveBeenCalledOnce();

            stop();
        });

        // An amount alone can't make a cashOut available: its bank accounts and the other checks of the API come with its eligibility
        describe('For a balance account with nothing to cash out', () => {
            const NOTHING_TO_CASH_OUT = {
                ...eligibilityOf(0, []),
                isCashoutAvailable: false,
                unavailableReasons: ['zeroBalance'],
            } as unknown as ICashOutEligibility;

            beforeEach(() => {
                ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = NOTHING_TO_CASH_OUT;
                respondWithAmountForSelected(0);
            });

            test('should load its eligibility again, instead of showing what they tell, once they tell more than nothing', async () => {
                const { state, stop } = await renderReady();
                expect(state.eligibility.value).toEqual(NOTHING_TO_CASH_OUT);
                let resolveEligibility!: (eligibility: ICashOutEligibility) => void;
                endpoints.getCashOutEligibility!.mockImplementationOnce(() => new Promise(resolve => (resolveEligibility = resolve)));

                respondWithAmountForSelected(150);
                state.refreshAvailableAmounts();

                await vi.waitFor(() => expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(2));
                expect(requestedBalanceAccountIds()).toEqual(['BA1', 'BA1']);
                // Like a refresh, it loads, so the amount it told isn't shown with a cashOut that can't be started
                expect(state.eligibility.value).toBeUndefined();

                resolveEligibility(eligibilityOf(150));
                await vi.waitFor(() => expect(state.eligibility.value).toEqual(eligibilityOf(150)));

                stop();
            });

            // Like the request in the Overview's modal, given the eligibility of the Overview: it can't load that one again itself
            test('should load its eligibility itself once they tell more than nothing, when it was given one, until it is given another', async () => {
                const givenEligibility = ref(NOTHING_TO_CASH_OUT);
                const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA1', eligibility: givenEligibility });
                await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
                expect(state.eligibility.value).toEqual(NOTHING_TO_CASH_OUT);
                ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(150);

                respondWithAmountForSelected(150);
                state.refreshAvailableAmounts();

                await vi.waitFor(() => expect(state.eligibility.value).toEqual(eligibilityOf(150)));
                expect(requestedBalanceAccountIds()).toEqual(['BA1']);

                givenEligibility.value = eligibilityOf(170);

                await vi.waitFor(() => expect(state.eligibility.value).toEqual(eligibilityOf(170)));
                expect(requestedBalanceAccountIds()).toEqual(['BA1']);

                stop();
            });

            test('should not load its eligibility again while they still tell nothing', async () => {
                const { state, stop } = await renderReady();

                state.refreshAvailableAmounts();
                await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
                await new Promise(resolve => setTimeout(resolve));

                expect(endpoints.getCashOutEligibility).toHaveBeenCalledOnce();

                stop();
            });

            // Right after a cashOut that left nothing, the API may still show what was available before it
            test('should not load its eligibility again while a cashOut that left nothing is expected', async () => {
                ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(100);
                respondWithAmountForSelected(100);
                const { state, stop } = await renderReady();
                state.recordCashOut({ balanceAccount: 'BA1', amount: { value: 100, currency: 'USD' } } as ICashOutResponse);
                await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 0, currency: 'USD' }));

                state.refreshAvailableAmounts();
                await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
                await new Promise(resolve => setTimeout(resolve));

                expect(endpoints.getCashOutEligibility).toHaveBeenCalledOnce();

                stop();
            });
        });
    });

    describe('After a cashOut', () => {
        const cashOutFrom = (balanceAccount: string) => ({ balanceAccount, amount: { value: 40, currency: 'USD' } }) as ICashOutResponse;
        const CASH_OUT = cashOutFrom('BA1');
        // While the API processes the cashOut it locks the balance account, and its eligibility tells so.
        const inProgressEligibilityOf = (value: number) =>
            ({ ...eligibilityOf(value), isCashoutAvailable: false, unavailableReasons: ['cashOutInProgress'] }) as unknown as ICashOutEligibility;
        const settle = async (state: ReturnType<typeof useCashOutState>, calls: number) => {
            await vi.waitFor(() => expect(endpoints.getCashOutEligibility).toHaveBeenCalledTimes(calls));
            await vi.waitFor(() => expect(state.isFetchingEligibility.value).toBe(false));
        };

        // Right after a cashOut the API still shows what was available before it.
        test('should show what is expected to be left, in the eligibility and next to the balance account, also once another is selected', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

            state.recordCashOut(CASH_OUT);
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = inProgressEligibilityOf(100);
            state.refreshEligibility();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 60, currency: 'USD' }));
            state.selectedBalanceAccountId.value = 'BA2';
            await vi.waitFor(() =>
                expect(state.balanceAccountOptions.value.find(({ value }) => value === 'BA1')?.description).toBe(`${AVAILABLE} {"amount":"60 USD"}`)
            );

            stop();
        });

        // The request opened from the overview can cash out from another balance account than the one selected in the overview
        test('should keep a cashOut from another balance account to that one, leaving the selected one as it is', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));

            state.recordCashOut(cashOutFrom('BA2'));
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA2 = inProgressEligibilityOf(200);

            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 100, currency: 'USD' });
            expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"160 USD"}`);
            state.selectedBalanceAccountId.value = 'BA2';
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 160, currency: 'USD' }));

            stop();
        });

        test('should not expect anything for another balance account whose amount is not known', async () => {
            endpoints.getCashOutAvailableAmounts = vi.fn().mockResolvedValue({
                balanceAccounts: [{ balanceAccountId: 'BA1', availableForCashOut: { value: 100, currency: 'USD' } }],
            });
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));

            state.recordCashOut(cashOutFrom('BA2'));
            state.selectedBalanceAccountId.value = 'BA2';

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 200, currency: 'USD' }));

            stop();
        });

        // Once the API shows no more than expected, it has the cashOut, so what it shows next counts again, also when it grows.
        test('should show what the API shows once it has caught up with the cashOut, also when it grows again', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            state.recordCashOut(CASH_OUT);

            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = inProgressEligibilityOf(60);
            state.refreshEligibility();
            await settle(state, 2);
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = inProgressEligibilityOf(150);
            state.refreshEligibility();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 150, currency: 'USD' }));

            stop();
        });

        test('should keep showing what is expected while the API still processes the cashOut and shows more', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            state.recordCashOut(CASH_OUT);

            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = inProgressEligibilityOf(100);
            state.refreshEligibility();
            await settle(state, 2);

            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 60, currency: 'USD' });

            stop();
        });

        // Once processed, the API has the cashOut: more than expected then is money that came in since.
        test('should show what the API shows once it no longer processes the cashOut, also when that is more than expected', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            state.recordCashOut(CASH_OUT);

            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = inProgressEligibilityOf(100);
            state.refreshEligibility();
            await settle(state, 2);
            expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 60, currency: 'USD' });
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(150);
            state.refreshEligibility();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance).toEqual({ value: 150, currency: 'USD' }));
            expect(state.eligibility.value?.isCashoutAvailable).toBe(true);

            stop();
        });

        test('should show what the API shows for another balance account once it has caught up, also when it grows again', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            state.recordCashOut(cashOutFrom('BA2'));
            const amountsOf = (value: number) => ({
                balanceAccounts: [
                    { balanceAccountId: 'BA1', availableForCashOut: { value: 100, currency: 'USD' } },
                    { balanceAccountId: 'BA2', availableForCashOut: { value, currency: 'USD' } },
                ],
            });

            endpoints.getCashOutAvailableAmounts!.mockResolvedValue(amountsOf(160));
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"160 USD"}`));
            endpoints.getCashOutAvailableAmounts!.mockResolvedValue(amountsOf(300));
            state.refreshAvailableAmounts();

            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"300 USD"}`));

            stop();
        });

        // The available amounts don't tell whether the cashOut is processed, but the API locks the balance account for at most 10
        // minutes while it processes it.
        test('should show what the API shows for another balance account once its cashOut is surely processed', async () => {
            const start = Date.now();
            const now = vi.spyOn(Date, 'now').mockReturnValue(start);
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));
            state.recordCashOut(cashOutFrom('BA2'));
            expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"160 USD"}`);

            now.mockReturnValue(start + 10 * 60 * 1000 - 1);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledTimes(2));
            await new Promise(resolve => setTimeout(resolve));
            expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"160 USD"}`);

            now.mockReturnValue(start + 10 * 60 * 1000);
            state.refreshAvailableAmounts();
            await vi.waitFor(() => expect(descriptionOf(state, 'BA2')).toBe(`${AVAILABLE} {"amount":"200 USD"}`));

            now.mockRestore();
            stop();
        });

        // Refresh is about the selected balance account; the amounts of all of them are loaded again when the list closes.
        test('should show what the API shows again once refreshed, without loading the available amounts again', async () => {
            const { state, stop } = renderCashOutState();
            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            state.recordCashOut(CASH_OUT);
            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance.value).toBe(60));

            state.refresh();

            await vi.waitFor(() => expect(state.eligibility.value?.availableForCashOutBalance.value).toBe(100));
            expect(requestedBalanceAccountIds()).toEqual(['BA1', 'BA1']);
            expect(endpoints.getCashOutAvailableAmounts).toHaveBeenCalledOnce();

            stop();
        });
    });

    describe('Without an account to receive the cashOut', () => {
        test.each([
            ['no transfer instruments', []],
            ['only ineligible transfer instruments', [transferInstrumentOf(false)]],
        ])('should treat an available cashOut with %s as unavailable', async (_, transferInstruments) => {
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = eligibilityOf(100, transferInstruments);
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            expect(state.eligibility.value).toMatchObject({
                isCashoutAvailable: false,
                availableForCashOutBalance: { value: 100, currency: 'USD' },
                unavailableReasons: ['noInstantReachableTransferInstruments'],
            });

            stop();
        });

        test('should treat the given eligibility the same way', async () => {
            const { state, stop } = renderCashOutState({ initialBalanceAccountId: 'BA1', eligibility: eligibilityOf(300, []) });

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            expect(state.eligibility.value).toMatchObject({
                isCashoutAvailable: false,
                unavailableReasons: ['noInstantReachableTransferInstruments'],
            });

            stop();
        });

        test('should keep an unavailable cashOut as the API sent it', async () => {
            const unavailable = {
                ...eligibilityOf(0, []),
                isCashoutAvailable: false,
                unavailableReasons: ['dailyLimitReached'],
            } as ICashOutEligibility;
            ELIGIBILITY_BY_BALANCE_ACCOUNT.BA1 = unavailable;
            const { state, stop } = renderCashOutState();

            await vi.waitFor(() => expect(state.shellState.value).toBe('ready'));
            expect(state.eligibility.value).toEqual(unavailable);
            // Unavailability is an answer of the API, not an error.
            expect(core.externalErrorHandler).not.toHaveBeenCalled();

            stop();
        });
    });

    test('should be in an error state when the eligibility fails to load, and report it to the onError of the SDK', async () => {
        const error = new Error('error');
        endpoints.getCashOutEligibility!.mockRejectedValue(error);
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));
        expect(state.errorInfo.value.refreshComponent).toBe(true);
        expect(core.externalErrorHandler).toHaveBeenCalledExactlyOnceWith(error);

        stop();
    });

    test('should be in an error state when the balance accounts fail to load, and report it to the onError of the SDK', async () => {
        const error = new Error('error');
        endpoints.getBalanceAccounts!.mockRejectedValue(error);
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));
        expect(core.externalErrorHandler).toHaveBeenCalledExactlyOnceWith(error);

        stop();
    });

    test('should be in an error state when there are no balance accounts', async () => {
        endpoints.getBalanceAccounts!.mockResolvedValue({ data: [] });
        const { state, stop } = renderCashOutState();

        await vi.waitFor(() => expect(state.shellState.value).toBe('error'));
        expect(endpoints.getCashOutEligibility).not.toHaveBeenCalled();

        stop();
    });
});
