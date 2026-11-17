import type { ChatMessage } from '../../domain/src';

export interface MockToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

/** What the mocked assistant answers: some text, and optionally tools it wants the client to run first. */
export interface MockReply {
    text: string;
    toolCalls?: MockToolCall[];
}

const DUMMY_REPLIES = [
    'Hi there! I am Piet, a mocked assistant. I do not understand what you said, but I am happy to chat anyway. Try asking about your transactions, payouts, balance accounts, disputes or payment links.',
    'That is an interesting thought. In a real conversation I would look it up, but here I am only returning dummy text.',
    'Thanks for the message! Streaming works like this: the reply arrives word by word, just like a real chat backend would send it.',
    'I am still just a mock, but I can format my replies:\n\n- **bold** and *italic* text\n- `inline code` and [links](https://docs.adyen.com)\n\nTry stopping me halfway through a reply, or asking something else.',
];

type ToolResult = Record<string, unknown> & { error?: string };

const parseToolResult = (content: string): ToolResult => {
    try {
        return JSON.parse(content) as ToolResult;
    } catch {
        return { error: 'The tool returned an unreadable result.' };
    }
};

const formatAmount = (amount?: { value: number; currency: string }) =>
    amount ? `${(amount.value / 100).toFixed(2)} ${amount.currency}` : 'an unknown amount';

/** Appends the clickable options the real assistant would offer, in the format Piet parses (see `parseReplyOptions`). */
const withOptions = (text: string, options: Array<{ label: string; message?: string; action?: { type: string; id?: string } }>) =>
    options.length ? `${text}\n\n\`\`\`piet-options\n${JSON.stringify(options)}\n\`\`\`` : text;

const describeResult = (tool: string, result: ToolResult): string => {
    if (result.error) return `I could not retrieve that: ${result.error}`;

    const balanceAccounts = (result.balanceAccounts ?? []) as Array<{ id: string; description?: string }>;
    const transactions = (result.transactions ?? []) as Array<{
        id: string;
        category: string;
        status: string;
        netAmount: { value: number; currency: string };
    }>;
    const payouts = (result.payouts ?? []) as Array<{ createdAt: string; payoutAmount: { value: number; currency: string } }>;
    const disputes = (result.disputes ?? []) as Array<{
        disputePspReference: string;
        status: string;
        amount: { value: number; currency: string };
        reason: { title: string };
    }>;
    const paymentLinks = (result.paymentLinks ?? []) as Array<{
        status: string;
        merchantReference: string;
        amount: { value: number; currency: string };
    }>;

    switch (tool) {
        case 'listBalanceAccounts':
            return `You have ${balanceAccounts.length} balance accounts, for example "${balanceAccounts[0]?.description ?? balanceAccounts[0]?.id}".`;
        case 'listTransactions':
            return transactions[0]
                ? withOptions(
                      `I found ${transactions.length} transactions. The most recent is a ${transactions[0].status.toLowerCase()} ${transactions[0].category.toLowerCase()} of ${formatAmount(transactions[0].netAmount)}. Do you want to see more about a specific transaction?`,
                      [
                          ...transactions.slice(0, 3).map(({ id }) => ({ label: id, message: `Show me the details of transaction ${id}` })),
                          { label: 'Refund the first one', action: { type: 'refundTransaction', id: transactions[0].id } },
                      ]
                  )
                : 'I did not find any transactions.';
        case 'listPayouts':
            return payouts[0]
                ? withOptions(
                      `I found ${payouts.length} payouts. The most recent is ${formatAmount(payouts[0].payoutAmount)}. Do you want to see the breakdown of a specific payout?`,
                      payouts.slice(0, 3).map(({ createdAt }) => ({
                          label: createdAt.slice(0, 10),
                          message: `Show me the details of the payout of ${createdAt.slice(0, 10)}`,
                      }))
                  )
                : 'I did not find any payouts.';
        case 'getCapitalState': {
            const { grants, availableOffer } = result as unknown as {
                grants?: Array<{
                    status: string;
                    grantAmount: { value: number; currency: string };
                    remainingTotalAmount: { value: number; currency: string };
                }>;
                availableOffer?: { maxAmount: { value: number; currency: string } };
            };
            if (grants?.[0]) {
                return `You have ${grants.length} capital loan(s). The first is ${grants[0].status.toLowerCase()}: ${formatAmount(grants[0].grantAmount)} granted, ${formatAmount(grants[0].remainingTotalAmount)} left to repay.`;
            }
            return availableOffer
                ? `You have no active loans, but you can currently borrow up to ${formatAmount(availableOffer.maxAmount)}.`
                : 'You have no active capital loans.';
        }
        case 'getPayoutDetails': {
            const { payout, fundsCapturedBreakdown } = result as unknown as {
                payout?: { payoutAmount: { value: number; currency: string } };
                fundsCapturedBreakdown?: unknown[];
            };
            return payout
                ? `This payout was ${formatAmount(payout.payoutAmount)}, made up of ${fundsCapturedBreakdown?.length ?? 0} categories of captured funds.`
                : 'I could not find that payout.';
        }
        case 'listDisputes':
            return disputes[0]
                ? withOptions(
                      `I found ${disputes.length} disputes. The most recent is ${disputes[0].status.toLowerCase()} for ${formatAmount(disputes[0].amount)} (${disputes[0].reason.title}). Do you want to see more about a specific dispute?`,
                      [
                          ...disputes.slice(0, 3).map(({ disputePspReference }) => ({
                              label: disputePspReference,
                              message: `Show me the details of dispute ${disputePspReference}`,
                          })),
                          { label: 'Accept or defend the first one', action: { type: 'manageDispute', id: disputes[0].disputePspReference } },
                      ]
                  )
                : 'I did not find any disputes.';
        case 'listPaymentLinks':
            return paymentLinks[0]
                ? withOptions(
                      `I found ${paymentLinks.length} payment links. The most recent is ${paymentLinks[0].status} (reference ${paymentLinks[0].merchantReference}) for ${formatAmount(paymentLinks[0].amount)}.`,
                      [{ label: 'Create a payment link', action: { type: 'createPaymentLink' } }]
                  )
                : 'I did not find any payment links.';
        case 'getTransactionTotals': {
            const [totals] = (result.totals ?? []) as Array<{
                incomings: { value: number; currency: string };
                expenses: { value: number; currency: string };
            }>;
            return totals
                ? `In that period ${formatAmount(totals.incomings)} came in and ${formatAmount(totals.expenses)} went out.`
                : 'There were no transactions in that period.';
        }
        case 'getTransactionDetails': {
            const { category, status, netAmount, events } = result as unknown as {
                category: string;
                status: string;
                netAmount: { value: number; currency: string };
                events?: unknown[];
            };
            return `This ${status.toLowerCase()} ${category.toLowerCase()} has a net amount of ${formatAmount(netAmount)} and ${events?.length ?? 0} events.`;
        }
        case 'getDisputeDetails': {
            const { dispute } = result as unknown as { dispute: { status: string; defensibility: string; reason: { title: string } } };
            return `This dispute is ${dispute.status.toLowerCase()} (${dispute.reason.title}) and its defensibility is ${dispute.defensibility.toLowerCase().replaceAll('_', ' ')}.`;
        }
        default:
            return 'Done.';
    }
};

const DETAIL_PATTERN = /detail|more about|tell me more|look into/i;

/** Which tools the mocked assistant calls, in order, for a message. Each step can use the results of the earlier ones. */
const TOOL_INTENTS: Array<{ pattern: RegExp; steps: string[] }> = [
    { pattern: /(dispute|chargeback).*(detail|more)|(detail|more).*(dispute|chargeback)/i, steps: ['listDisputes', 'getDisputeDetails'] },
    { pattern: /dispute|chargeback/i, steps: ['listDisputes'] },
    { pattern: /capital|loan|financing|grant/i, steps: ['getCapitalState'] },
    { pattern: /payment link|pay by link/i, steps: ['listPaymentLinks'] },
    {
        pattern: /payout.*(detail|more|breakdown)|(detail|more|breakdown).*payout/i,
        steps: ['listBalanceAccounts', 'listPayouts', 'getPayoutDetails'],
    },
    { pattern: /payout/i, steps: ['listBalanceAccounts', 'listPayouts'] },
    { pattern: /total|incoming|outgoing|expense|earned|spent/i, steps: ['listBalanceAccounts', 'getTransactionTotals'] },
    {
        pattern: new RegExp(`transaction.*(${DETAIL_PATTERN.source})|(${DETAIL_PATTERN.source}).*transaction`, 'i'),
        steps: ['listBalanceAccounts', 'listTransactions', 'getTransactionDetails'],
    },
    { pattern: /transaction/i, steps: ['listBalanceAccounts', 'listTransactions'] },
    { pattern: /balance/i, steps: ['listBalanceAccounts'] },
];

type Results = Map<string, ToolResult>;

/** The record of an earlier result that the user's message names (e.g. after clicking its option), otherwise the first one. */
const getFirst = <T extends object>(results: Results, tool: string, key: string, userText = '', dateKeys: string[] = []) => {
    const records = (results.get(tool)?.[key] ?? []) as T[];
    const isNamed = (record: T) =>
        Object.entries(record).some(
            ([field, value]) => typeof value === 'string' && !!value && userText.includes(dateKeys.includes(field) ? value.slice(0, 10) : value)
        );
    return records.find(isNamed) ?? records[0];
};

/** Arguments of a step, taken from what the earlier steps found. */
const getStepArguments = (tool: string, results: Results, userText: string): Record<string, unknown> => {
    const balanceAccountId = getFirst<{ id: string }>(results, 'listBalanceAccounts', 'balanceAccounts')?.id;

    switch (tool) {
        case 'listTransactions':
        case 'getTransactionTotals':
        case 'listPayouts':
            return { balanceAccountId, limit: 10 };
        case 'listDisputes':
            return { statusGroup: 'CHARGEBACKS', limit: 10 };
        case 'listPaymentLinks':
            return { limit: 10 };
        case 'getCapitalState':
            return {};
        case 'getPayoutDetails':
            return {
                balanceAccountId,
                createdAt: getFirst<{ createdAt: string }>(results, 'listPayouts', 'payouts', userText, ['createdAt'])?.createdAt,
            };
        case 'getTransactionDetails':
            return { transactionId: getFirst<{ id: string }>(results, 'listTransactions', 'transactions', userText)?.id };
        case 'getDisputeDetails':
            return {
                disputePspReference: getFirst<{ disputePspReference: string }>(results, 'listDisputes', 'disputes', userText)?.disputePspReference,
            };
        default:
            return {};
    }
};

/**
 * Plays the part of a chat backend with tool calling. A message about transactions, payouts, balance accounts, disputes or
 * payment links makes the assistant call the matching tools one after the other, using what each one found (for example the
 * balance account, then the transactions of that account), and then describe the final result. Asking for "details" of
 * transactions or disputes adds a step that looks at the first record. Any other message gets a canned reply that rotates
 * with every user message.
 */
export const getMockReply = (messages: ChatMessage[]): MockReply => {
    const lastUserIndex = messages.map(({ role }) => role).lastIndexOf('user');
    const userText = messages[lastUserIndex]?.content ?? '';
    const turn = messages.slice(lastUserIndex + 1);

    const toolNameById = new Map(turn.flatMap(({ tool_calls: toolCalls }) => toolCalls ?? []).map(call => [call.id, call.function.name]));
    const results: Results = new Map(
        turn
            .filter(({ role }) => role === 'tool')
            .map(({ tool_call_id: toolCallId, content }) => [toolNameById.get(toolCallId ?? '') ?? '', parseToolResult(content)])
    );

    const steps = TOOL_INTENTS.find(({ pattern }) => pattern.test(userText))?.steps;

    if (!steps) {
        const userMessageCount = messages.filter(({ role }) => role === 'user').length;
        return { text: DUMMY_REPLIES[Math.max(userMessageCount - 1, 0) % DUMMY_REPLIES.length]! };
    }

    const failed = [...results.values()].find(result => result.error);
    if (failed) return { text: describeResult(steps.at(-1)!, failed) };

    const nextStep = steps.find(step => !results.has(step));
    if (!nextStep) return { text: describeResult(steps.at(-1)!, results.get(steps.at(-1)!)!) };

    return {
        text: results.size === 0 ? 'Let me look that up.' : 'One moment, checking the details.',
        toolCalls: [{ name: nextStep, arguments: getStepArguments(nextStep, results, userText) }],
    };
};
