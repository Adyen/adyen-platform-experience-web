/**
 * Flows the user can run themselves from a reply option. The assistant only suggests them: it never performs the change.
 * Each flow is an existing component (transaction details, dispute management, payment link details / creation) that
 * the host application mounts in a modal, see `PietProps.renderAction`.
 */
export const PIET_ACTION_TYPES = [
    'refundTransaction',
    'manageDispute',
    'expirePaymentLink',
    'createPaymentLink',
    'viewTransaction',
    'viewDispute',
    'viewPayout',
    'viewPaymentLink',
] as const;

export type PietActionType = (typeof PIET_ACTION_TYPES)[number];

export type PietActionRequest =
    /** Opens the transaction details, where the refund can be started. */
    | { type: 'refundTransaction'; transactionId: string }
    /** Opens the dispute, where it can be accepted or defended. */
    | { type: 'manageDispute'; disputePspReference: string }
    /** Opens the payment link, where it can be expired. */
    | { type: 'expirePaymentLink'; paymentLinkId: string }
    /** Opens the payment link creation form. */
    | { type: 'createPaymentLink' }
    /** Opens the details of one transaction, dispute, payout (a balance account and its payout date) or payment link. */
    | { type: 'viewTransaction'; transactionId: string }
    | { type: 'viewDispute'; disputePspReference: string }
    | { type: 'viewPayout'; balanceAccountId: string; date: string }
    | { type: 'viewPaymentLink'; paymentLinkId: string };

/** What the host calls to tear down what it mounted for an action. */
export type PietActionCleanup = () => void;

export const PIET_ACTION_TITLE_KEYS = {
    refundTransaction: 'piet.chat.actions.refundTransaction.title',
    manageDispute: 'piet.chat.actions.manageDispute.title',
    expirePaymentLink: 'piet.chat.actions.expirePaymentLink.title',
    createPaymentLink: 'piet.chat.actions.createPaymentLink.title',
    viewTransaction: 'piet.chat.actions.viewTransaction.title',
    viewDispute: 'piet.chat.actions.viewDispute.title',
    viewPayout: 'piet.chat.actions.viewPayout.title',
    viewPaymentLink: 'piet.chat.actions.viewPaymentLink.title',
} as const satisfies Record<PietActionType, string>;

const ID = /^[\w.-]{1,100}$/;

const DATE = /^[\w:.+-]{1,40}$/;

const readId = (value: unknown) => (typeof value === 'string' && ID.test(value.trim()) ? value.trim() : undefined);

/** Validates an action written by the model. Anything unknown or lacking its identifier is rejected. */
export const parsePietAction = (value: unknown): PietActionRequest | undefined => {
    if (typeof value !== 'object' || value === null) return undefined;

    const { type, id, date } = value as Record<string, unknown>;
    const identifier = readId(id);
    const payoutDate = typeof date === 'string' && DATE.test(date.trim()) ? date.trim() : undefined;

    switch (type) {
        case 'refundTransaction':
            return identifier ? { type, transactionId: identifier } : undefined;
        case 'manageDispute':
            return identifier ? { type, disputePspReference: identifier } : undefined;
        case 'expirePaymentLink':
            return identifier ? { type, paymentLinkId: identifier } : undefined;
        case 'createPaymentLink':
            return { type };
        case 'viewTransaction':
            return identifier ? { type, transactionId: identifier } : undefined;
        case 'viewDispute':
            return identifier ? { type, disputePspReference: identifier } : undefined;
        case 'viewPayout':
            return identifier && payoutDate ? { type, balanceAccountId: identifier, date: payoutDate } : undefined;
        case 'viewPaymentLink':
            return identifier ? { type, paymentLinkId: identifier } : undefined;
        default:
            return undefined;
    }
};

/** Instructions for the model. Add them to the system prompt only when the host provides `renderAction`. */
export const PIET_ACTION_INSTRUCTIONS = [
    'You cannot refund, accept, defend, create or expire anything yourself, but you can open a flow or the full details for the user with a button. Offer them proactively: do not wait to be asked, and do not tell the user to go find them elsewhere.',
    'Buttons go in the piet-options block at the end of your reply. For an action, give the object an "action" instead of a "message". Supported actions:',
    '{"type":"viewTransaction","id":"<transactionId>"}, {"type":"viewDispute","id":"<disputePspReference>"}, {"type":"viewPaymentLink","id":"<paymentLinkId>"} and {"type":"viewPayout","id":"<balanceAccountId>","date":"<payout createdAt>"} open the full details of one entity (a transaction id begins with "EVJN").',
    '{"type":"refundTransaction","id":"<transactionId>"} to refund a transaction; {"type":"manageDispute","id":"<disputePspReference>"} to accept or defend a dispute; {"type":"expirePaymentLink","id":"<paymentLinkId>"} to expire a payment link; {"type":"createPaymentLink"} to create a payment link (no id).',
    'When to offer them: whenever you discuss one specific transaction, dispute, payout or payment link, offer a "See details" button for it. Additionally: after the details of a single transaction offer "Refund this transaction"; for a single dispute that is still open offer "Accept or defend dispute"; for a single active payment link offer "Expire payment link"; whenever payment links come up, or the user wants to charge someone, offer "Create payment link". Also offer the matching button whenever the user says they want to refund, accept, defend, expire or create.',
    'Example: ```piet-options\n[{"label":"See details","action":{"type":"viewDispute","id":"CB1234567890ABCD"}},{"label":"Accept or defend dispute","action":{"type":"manageDispute","id":"CB1234567890ABCD"}}]\n```. Use ids only from data you retrieved, and tell the user in one sentence what the button opens.',
].join(' ');
