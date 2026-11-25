import { http, HttpResponse } from 'msw';
import type {
    IBalanceAccountBase,
    ICashOutAmount,
    ICashOutAvailableAmounts,
    ICashOutEligibility,
    ICashOutFees,
    ICashOutRequest,
    ICashOutResponse,
    ICashOutState,
    ISessionAccount,
} from '@integration-components/types';
import { BALANCE_ACCOUNTS, BALANCE_ACCOUNTS_SINGLE, setupBasicResponse } from '@integration-components/testing/fixtures';
import { BALANCE_ACCOUNTS_ENDPOINT, SETUP_ENDPOINT, withDelay } from '@integration-components/testing/msw';
import { uuid } from '@integration-components/utils';
import { ENDPOINTS } from '../endpoints';
import {
    ELIGIBILITY_AVAILABLE,
    ELIGIBILITY_BY_BALANCE_ACCOUNT,
    ELIGIBILITY_UNAVAILABLE,
    ELIGIBILITY_UNAVAILABLE_WITH_SINGLE_ELIGIBLE_TRANSFER_INSTRUMENT,
    MANY_BALANCE_ACCOUNTS,
    STATE_RESTRICTED,
    STATE_WITHOUT_RESTRICTIONS,
} from '../mock-data/cashOut';

const REQUEST_ID = '769ac4ce59f0f159ad672d38d3291e93';
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
// Java's `\p{Alnum}` in the backend pattern is ASCII-only.
const TRANSFER_INSTRUMENT_ID_PATTERN = /^[A-Za-z0-9]+$/;

const NOT_NULL_MESSAGE = 'Required parameter. Must not be null';
const POSITIVE_MESSAGE = 'Must be a positive number';
const POSITIVE_OR_ZERO_MESSAGE = 'Must be a non-negative number';
const CURRENCY_CODE_MESSAGE = 'Must be a valid ISO 4217 currency code';

type InvalidField = { name: string; value: string; message: string };

type FeesOf = (value: number, currency: string) => ICashOutFees;

const calculateFees: FeesOf = (value, currency) => {
    // An arbitrary rule (0.50 + 1.5%): the component only reads the response, never how the fee was derived.
    const feeValue = Math.min(value, 50 + Math.round((value * 150) / 10_000));

    return {
        amount: { currency, value },
        fee: { currency, value: feeValue },
        payoutAmount: { currency, value: value - feeValue },
    };
};

// Like a fee configuration without a fixed amount nor a percentage.
const freeFeesOf: FeesOf = (value, currency) => ({
    amount: { currency, value },
    fee: { currency, value: 0 },
    payoutAmount: { currency, value },
});

// The fee configuration once changed: 1.00 instead of 0.50, plus 1.5%.
const changedFeesOf: FeesOf = (value, currency) => {
    const feeValue = Math.min(value, 100 + Math.round((value * 150) / 10_000));
    return { amount: { currency, value }, fee: { currency, value: feeValue }, payoutAmount: { currency, value: value - feeValue } };
};

const getAmountErrors = (amount: number | undefined): InvalidField[] => {
    if (amount === undefined) return [{ name: 'amount', value: '', message: NOT_NULL_MESSAGE }];
    if (!Number.isInteger(amount) || amount <= 0) return [{ name: 'amount', value: String(amount), message: POSITIVE_MESSAGE }];
    return [];
};

const getCurrencyErrors = (currency: string | undefined): InvalidField[] => {
    if (currency === undefined) return [{ name: 'currency', value: '', message: NOT_NULL_MESSAGE }];
    if (!CURRENCY_CODE_PATTERN.test(currency)) return [{ name: 'currency', value: currency, message: CURRENCY_CODE_MESSAGE }];
    return [];
};

const getExpectedFeeErrors = (expectedFee: number | undefined): InvalidField[] => {
    if (expectedFee === undefined) return [{ name: 'expectedFee', value: '', message: NOT_NULL_MESSAGE }];
    if (!Number.isInteger(expectedFee) || expectedFee < 0)
        return [{ name: 'expectedFee', value: String(expectedFee), message: POSITIVE_OR_ZERO_MESSAGE }];
    return [];
};

const getTransferInstrumentIdErrors = (transferInstrumentId: string | undefined): InvalidField[] => {
    const name = 'counterparty.transferInstrumentId';
    if (transferInstrumentId === undefined) return [{ name, value: '', message: NOT_NULL_MESSAGE }];
    if (!TRANSFER_INSTRUMENT_ID_PATTERN.test(transferInstrumentId)) return [{ name, value: transferInstrumentId, message: 'Must be alphanumeric' }];
    return [];
};

// Mirrors `RestServiceErrors.VALIDATION`, which the backend returns for bean validation failures.
const getValidationErrorResponse = (invalidFields: InvalidField[]) =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '29_001',
            title: 'The request is missing required fields or contains invalid data.',
            status: 422,
            requestId: REQUEST_ID,
            invalidFields,
        },
        { status: 422 }
    );

// The account key of a balance account, as the balance accounts endpoint returns it.
const BALANCE_ACCOUNT_KEY_PREFIX = 'BalanceAccount.';
const getBalanceAccountId = (accountKey: string) =>
    accountKey.startsWith(BALANCE_ACCOUNT_KEY_PREFIX) ? accountKey.slice(BALANCE_ACCOUNT_KEY_PREFIX.length) : undefined;

// Like the API, which only takes a balance account key in the path.
const getInvalidAccountKeyResponse = () =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/validation',
            errorCode: '00_400',
            title: 'Not a valid requested resource',
            status: 400,
            requestId: REQUEST_ID,
        },
        { status: 400 }
    );

const getInternalServerErrorResponse = () =>
    HttpResponse.json(
        {
            type: 'https://docs.adyen.com/errors/internal',
            errorCode: '00_500',
            title: 'An internal error happened',
            status: 500,
            requestId: REQUEST_ID,
        },
        { status: 500 }
    );

// What each balance account cashed out since the page loaded, so the eligibility fetched after a cashOut has less available to cash out.
const cashedOutByBalanceAccount = new Map<string, number>();

const deductCashedOut = (accountKey: string, eligibility: ICashOutEligibility): ICashOutEligibility => {
    const cashedOut = cashedOutByBalanceAccount.get(accountKey);
    if (!cashedOut) return eligibility;

    const deduct = ({ currency, value }: ICashOutAmount): ICashOutAmount => ({ currency, value: Math.max(0, value - cashedOut) });
    const availableForCashOutBalance = deduct(eligibility.availableForCashOutBalance);
    if (availableForCashOutBalance.value > 0) return { ...eligibility, availableForCashOutBalance };
    return { ...eligibility, availableForCashOutBalance, isCashoutAvailable: false, transferInstruments: [], unavailableReasons: ['zeroBalance'] };
};

// Like a session for an account holder, whose balance accounts can be picked from.
const SESSION_ACCOUNT_HOLDER: ISessionAccount = { accountKey: 'BalanceAccountHolder.AH32272223222B5CTDQPM6W2H', accountType: 'BalanceAccountHolder' };

// Like the API, which tells the state for the account of the session: an account holder, or a balance account for its account holder.
const isSessionAccountKey = (accountKey: string) => accountKey.startsWith('BalanceAccountHolder.') || !!getBalanceAccountId(accountKey);

// The eligibility of a balance account: its own, or the default one.
const eligibilityOf = (balanceAccountId: string) => ELIGIBILITY_BY_BALANCE_ACCOUNT[balanceAccountId] ?? ELIGIBILITY_AVAILABLE.default;

// What it can cash out now, as its eligibility tells it once what it cashed out since the page loaded is deducted.
const availableNowOf = (balanceAccountId: string) => deductCashedOut(balanceAccountId, eligibilityOf(balanceAccountId)).availableForCashOutBalance;

// Balance accounts as the balance accounts endpoint returns them, with their account key.
const withAccountKeys = (balanceAccounts: readonly IBalanceAccountBase[]) =>
    balanceAccounts.map(account => ({ ...account, accountKey: `${BALANCE_ACCOUNT_KEY_PREFIX}${account.id}` }));

// The available amounts of these balance accounts, like the API, which takes them from their eligibility.
const availableAmountsOf = (balanceAccounts: readonly IBalanceAccountBase[], availableOf: (balanceAccountId: string) => ICashOutAmount) =>
    ({
        balanceAccounts: balanceAccounts.map(({ id }) => ({ balanceAccountId: id, availableForCashOut: availableOf(id) })),
    }) satisfies ICashOutAvailableAmounts;

// The eligibility of each balance account, with these bank accounts. Keeps the balances of each balance account, so multiple
// balance accounts still differ from each other.
const withTransferInstrumentsHandler = (transferInstruments: ICashOutEligibility['transferInstruments']) =>
    http.get<{ accountKey: string }>(
        ENDPOINTS.eligibility,
        withDelay(({ params }) => {
            const balanceAccountId = getBalanceAccountId(params.accountKey);
            if (!balanceAccountId) return getInvalidAccountKeyResponse();
            return HttpResponse.json(deductCashedOut(balanceAccountId, { ...eligibilityOf(balanceAccountId), transferInstruments }));
        })
    );

// Every balance account with the same eligibility, and the available amounts as it tells them, like the API, so the component
// and the list of balance accounts agree on what each one can cash out.
const sameEligibilityHandlers = (eligibility: ICashOutEligibility) => [
    http.get(
        ENDPOINTS.eligibility,
        withDelay(() => HttpResponse.json(eligibility))
    ),
    http.get(
        ENDPOINTS.availableAmounts,
        withDelay(() => HttpResponse.json(availableAmountsOf(BALANCE_ACCOUNTS, () => eligibility.availableForCashOutBalance)))
    ),
];

const stateHandler = (state: ICashOutState) =>
    http.get<{ accountKey: string }>(
        ENDPOINTS.state,
        withDelay(({ params }) => (isSessionAccountKey(params.accountKey) ? HttpResponse.json(state) : getInvalidAccountKeyResponse()))
    );

// Cashes out what the request tells, its fee being what `feesOf` tells for its amount.
const instructHandler = (feesOf: FeesOf = calculateFees) =>
    http.post<{ accountKey: string }, Partial<ICashOutRequest>>(
        ENDPOINTS.instruct,
        withDelay(
            async ({ params, request }) => {
                const balanceAccountId = getBalanceAccountId(params.accountKey);
                if (!balanceAccountId) return getInvalidAccountKeyResponse();
                const { amount, counterparty, currency, description, expectedFee, referenceForBeneficiary } = await request.json();
                const transferInstrumentId = counterparty?.transferInstrumentId;
                const invalidFields = [
                    ...getAmountErrors(amount),
                    ...getCurrencyErrors(currency),
                    ...getExpectedFeeErrors(expectedFee),
                    ...getTransferInstrumentIdErrors(transferInstrumentId),
                ];

                if (
                    amount === undefined ||
                    currency === undefined ||
                    expectedFee === undefined ||
                    transferInstrumentId === undefined ||
                    invalidFields.length > 0
                ) {
                    return getValidationErrorResponse(invalidFields);
                }

                // Like the API, which calculates the fee again and rejects the cashOut when it is not the one shown for the amount: the fee
                // configuration changed since. cashout-ui answers it like the other cashOuts it can't carry out, without telling why.
                const { fee } = feesOf(amount, currency);
                if (fee.value !== expectedFee) return getValidationErrorResponse([]);

                const response: ICashOutResponse = {
                    id: uuid(),
                    balanceAccount: balanceAccountId,
                    amount: { currency, value: amount },
                    fee,
                    counterparty: { transferInstrumentId },
                    ...(description === undefined ? {} : { description }),
                    ...(referenceForBeneficiary === undefined ? {} : { referenceForBeneficiary }),
                };

                cashedOutByBalanceAccount.set(balanceAccountId, (cashedOutByBalanceAccount.get(balanceAccountId) ?? 0) + amount);

                return HttpResponse.json(response);
            },
            undefined,
            // Also in tests, so specs can check what the components do while the cashOut is sent
            500
        )
    );

export const cashOutMocks = [
    http.get(
        ENDPOINTS.accounts,
        withDelay(() => HttpResponse.json({ data: [SESSION_ACCOUNT_HOLDER] }))
    ),
    // What each balance account of the account holder can cash out, as its eligibility tells it.
    http.get(
        ENDPOINTS.availableAmounts,
        withDelay(() => HttpResponse.json(availableAmountsOf(BALANCE_ACCOUNTS, availableNowOf)))
    ),
    http.get<{ accountKey: string }>(
        ENDPOINTS.eligibility,
        withDelay(({ params }) => {
            const balanceAccountId = getBalanceAccountId(params.accountKey);
            if (!balanceAccountId) return getInvalidAccountKeyResponse();
            return HttpResponse.json(deductCashedOut(balanceAccountId, eligibilityOf(balanceAccountId)));
        })
    ),
    http.get(
        ENDPOINTS.fees,
        withDelay(({ request }) => {
            const { searchParams } = new URL(request.url);
            const amountParam = searchParams.get('amount');
            const amount = amountParam === null ? undefined : Number(amountParam);
            const currency = searchParams.get('currency') ?? undefined;
            const invalidFields = [...getAmountErrors(amount), ...getCurrencyErrors(currency)];

            if (amount === undefined || currency === undefined || invalidFields.length > 0) {
                return getValidationErrorResponse(invalidFields);
            }

            return HttpResponse.json(calculateFees(amount, currency));
        })
    ),
    stateHandler(STATE_WITHOUT_RESTRICTIONS),
    instructHandler(),
];

// The first balance account can cash out `changedTo` once the amounts are loaded again, such as when the list of balance accounts closes,
// while its eligibility still tells what it told before. At first, it can cash out `initially`, or what its eligibility tells.
const availableAmountsChangedHandlers = (changedTo: ICashOutAmount, initially?: ICashOutAmount) => {
    let requests = 0;
    return [
        http.get(
            ENDPOINTS.availableAmounts,
            withDelay(() => {
                const isFirst = requests++ === 0;
                return HttpResponse.json(
                    availableAmountsOf(BALANCE_ACCOUNTS, id => {
                        if (id !== BALANCE_ACCOUNTS[0].id) return eligibilityOf(id).availableForCashOutBalance;
                        return isFirst ? (initially ?? eligibilityOf(id).availableForCashOutBalance) : changedTo;
                    })
                );
            })
        ),
    ];
};

// The first balance account has nothing to cash out at first, as its eligibility and the amounts tell; once the amounts are loaded again,
// it can cash out what its eligibility tells by then.
const availableAmountsChangedFromNothingHandlers = () => {
    const balanceAccountId = BALANCE_ACCOUNTS[0].id;
    const available = eligibilityOf(balanceAccountId);
    const nothing: ICashOutEligibility = {
        ...available,
        availableForCashOutBalance: { ...available.availableForCashOutBalance, value: 0 },
        isCashoutAvailable: false,
        transferInstruments: [],
        unavailableReasons: ['zeroBalance'],
    };
    let eligibilityRequests = 0;
    return [
        ...availableAmountsChangedHandlers(available.availableForCashOutBalance, nothing.availableForCashOutBalance),
        http.get<{ accountKey: string }>(
            ENDPOINTS.eligibility,
            withDelay(({ params }) => {
                const id = getBalanceAccountId(params.accountKey);
                if (!id) return getInvalidAccountKeyResponse();
                if (id !== balanceAccountId) return HttpResponse.json(eligibilityOf(id));
                return HttpResponse.json(eligibilityRequests++ === 0 ? nothing : available);
            })
        ),
    ];
};

export const CASH_OUT_HANDLERS = {
    default: { handlers: cashOutMocks },
    availableAmountsChanged: { handlers: availableAmountsChangedHandlers({ value: 15000, currency: 'USD' }) },
    // Nothing left to cash out, such as after a cashOut from somewhere else
    availableAmountsChangedToNothing: { handlers: availableAmountsChangedHandlers({ value: 0, currency: 'USD' }) },
    // Something to cash out again, such as once money came in
    availableAmountsChangedFromNothing: { handlers: availableAmountsChangedFromNothingHandlers() },
    // The API has an amount for the first balance account only: none for the second, and the third is left out.
    someAvailableAmountsMissing: {
        handlers: [
            http.get(
                ENDPOINTS.availableAmounts,
                withDelay(() =>
                    HttpResponse.json({
                        balanceAccounts: [
                            {
                                balanceAccountId: BALANCE_ACCOUNTS[0].id,
                                availableForCashOut: ELIGIBILITY_BY_BALANCE_ACCOUNT[BALANCE_ACCOUNTS[0].id]!.availableForCashOutBalance,
                            },
                            // Not as the type allows, but as the component has to handle anyway.
                            { balanceAccountId: BALANCE_ACCOUNTS[1].id, availableForCashOut: null },
                        ],
                    })
                )
            ),
        ],
    },
    // Like the API right after a cashOut: still processing it, with what is available to cash out not lowered yet.
    cashOutStillProcessing: {
        handlers: [
            http.get<{ accountKey: string }>(
                ENDPOINTS.eligibility,
                withDelay(({ params }) => {
                    const balanceAccountId = getBalanceAccountId(params.accountKey);
                    if (!balanceAccountId) return getInvalidAccountKeyResponse();
                    const eligibility = eligibilityOf(balanceAccountId);
                    if (!cashedOutByBalanceAccount.has(balanceAccountId)) return HttpResponse.json(eligibility);
                    return HttpResponse.json({
                        ...eligibility,
                        isCashoutAvailable: false,
                        transferInstruments: [],
                        unavailableReasons: ['cashOutInProgress'],
                    } satisfies ICashOutEligibility);
                })
            ),
            ...cashOutMocks,
        ],
    },
    // Like a session for a single balance account, which has nothing to pick from.
    singleBalanceAccount: {
        handlers: [
            http.get(
                ENDPOINTS.accounts,
                withDelay(() =>
                    HttpResponse.json({
                        data: [{ accountKey: `${BALANCE_ACCOUNT_KEY_PREFIX}${BALANCE_ACCOUNTS_SINGLE[0]!.id}`, accountType: 'BalanceAccount' }],
                    })
                )
            ),
            http.get(
                BALANCE_ACCOUNTS_ENDPOINT,
                withDelay(() => HttpResponse.json({ data: withAccountKeys(BALANCE_ACCOUNTS_SINGLE) }))
            ),
        ],
    },
    singleTransferInstrument: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_AVAILABLE.singleTransferInstrument),
    },
    singleEligibleTransferInstrument: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_AVAILABLE.singleEligibleTransferInstrument),
    },
    withIneligibleTransferInstruments: {
        handlers: [withTransferInstrumentsHandler(ELIGIBILITY_AVAILABLE.withIneligibleTransferInstruments.transferInstruments)],
    },
    // Enough bank accounts for their dropdown to be searched.
    manyTransferInstruments: {
        handlers: [withTransferInstrumentsHandler(ELIGIBILITY_AVAILABLE.manyTransferInstruments.transferInstruments)],
    },
    // Enough balance accounts for their dropdown to be searched, each with what it can cash out.
    manyBalanceAccounts: {
        handlers: [
            http.get(
                BALANCE_ACCOUNTS_ENDPOINT,
                withDelay(() => HttpResponse.json({ data: withAccountKeys(MANY_BALANCE_ACCOUNTS) }))
            ),
            http.get(
                ENDPOINTS.availableAmounts,
                withDelay(() => HttpResponse.json(availableAmountsOf(MANY_BALANCE_ACCOUNTS, availableNowOf)))
            ),
        ],
    },
    zeroBalance: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.zeroBalance),
    },
    unavailableSingleEligibleTransferInstrument: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE_WITH_SINGLE_ELIGIBLE_TRANSFER_INSTRUMENT),
    },
    noInstantReachableTransferInstruments: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.noInstantReachableTransferInstruments),
    },
    cashOutInProgress: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.cashOutInProgress),
    },
    dailyLimitReached: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.dailyLimitReached),
    },
    sendToBalanceAccountNotAllowed: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.sendToBalanceAccountNotAllowed),
    },
    receiveFromBalanceAccountNotAllowed: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.receiveFromBalanceAccountNotAllowed),
    },
    sendToTransferInstrumentNotAllowed: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.sendToTransferInstrumentNotAllowed),
    },
    riskRestricted: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.riskRestricted),
    },
    cashOutNotConfigured: {
        handlers: sameEligibilityHandlers(ELIGIBILITY_UNAVAILABLE.cashOutNotConfigured),
    },
    freeFees: {
        handlers: [
            // A fee structure without a fixed amount nor a percentage, like the free fees below.
            http.get<{ accountKey: string }>(
                ENDPOINTS.eligibility,
                withDelay(({ params }) => {
                    const balanceAccountId = getBalanceAccountId(params.accountKey);
                    if (!balanceAccountId) return getInvalidAccountKeyResponse();
                    const eligibility = eligibilityOf(balanceAccountId);
                    const { currency } = eligibility.availableForCashOutBalance;
                    return HttpResponse.json({ ...eligibility, feeStructure: { fixedAmount: { currency, value: 0 }, variableBasisPoints: 0 } });
                })
            ),
            http.get(
                ENDPOINTS.fees,
                withDelay(({ request }) => {
                    const { searchParams } = new URL(request.url);
                    return HttpResponse.json(freeFeesOf(Number(searchParams.get('amount')), searchParams.get('currency') ?? ''));
                })
            ),
            instructHandler(freeFeesOf),
        ],
    },
    // The fee configuration changes after the fee of the amount is shown, so the cashOut is rejected.
    feeChanged: {
        handlers: [instructHandler(changedFeesOf)],
    },
    // A session with the view role only, so it can't instruct a cashOut.
    instructRoleNotAssigned: {
        handlers: [
            http.post(
                SETUP_ENDPOINT,
                withDelay(() => {
                    const { instructCashOut, ...endpoints } = setupBasicResponse.endpoints;
                    return HttpResponse.json({ endpoints });
                })
            ),
        ],
    },
    balanceAccountsInternalServerError: { handlers: [http.get(BALANCE_ACCOUNTS_ENDPOINT, withDelay(getInternalServerErrorResponse))] },
    eligibilityInternalServerError: { handlers: [http.get(ENDPOINTS.eligibility, withDelay(getInternalServerErrorResponse))] },
    eligibilityNetworkError: {
        handlers: [
            http.get(
                ENDPOINTS.eligibility,
                withDelay(() => HttpResponse.error())
            ),
        ],
    },
    feesInternalServerError: { handlers: [http.get(ENDPOINTS.fees, withDelay(getInternalServerErrorResponse))] },
    // An account holder that can't cash out at all, for reasons of its own and of its platform.
    stateRestricted: { handlers: [stateHandler(STATE_RESTRICTED)] },
    stateInternalServerError: { handlers: [http.get(ENDPOINTS.state, withDelay(getInternalServerErrorResponse))] },
    instructInternalServerError: { handlers: [http.post(ENDPOINTS.instruct, withDelay(getInternalServerErrorResponse))] },
    instructNetworkError: {
        handlers: [
            http.post(
                ENDPOINTS.instruct,
                withDelay(() => HttpResponse.error())
            ),
        ],
    },
};
