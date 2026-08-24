/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Compile-only type assertions for the @adyen/adyen-platform-experience-web public API.
 *
 * This file is NOT executed — it is only type-checked via `tsc --noEmit`.
 * If this file compiles, the published package's types are correct.
 */

// ── CSS import ─────────────────────────────────────────────────────────────────

import '@adyen/adyen-platform-experience-web/adyen-platform-experience-web.css';
import {
    AdyenPlatformExperience,
    CapitalOverview,
    CapitalOffer,
    type CapitalComponentState,
    type CapitalOverviewProps,
    type CapitalOfferProps,
    TransactionsOverview,
    TransactionDetails,
    type TransactionsOverviewComponentProps,
    type TransactionDetailsProps,
    PayoutsOverview,
    PayoutDetails,
    type PayoutsOverviewProps,
    type PayoutDetailsProps,
    ReportsOverview,
    type ReportsOverviewProps,
    DisputesOverview,
    DisputeManagement,
    type DisputesOverviewProps,
    type DisputeManagementProps,
    PaymentLinksOverview,
    PaymentLinkCreation,
    PaymentLinkDetails,
    PaymentLinkSettings,
    type PaymentLinksOverviewProps,
    type PaymentLinkCreationProps,
    type PaymentLinkDetailsProps,
    type PaymentLinkSettingsProps,
} from '@adyen/adyen-platform-experience-web';

// ── Core factory ───────────────────────────────────────────────────────────────

async function testCoreFactory() {
    const core = await AdyenPlatformExperience({
        availableTranslations: [],
        onSessionCreate: async () => ({ id: 'test', token: 'test' }),
        locale: 'en-US',
    });
    return core;
}

// ── Capital ────────────────────────────────────────────────────────────────────

async function testCapital() {
    const core = await testCoreFactory();

    const overview = new CapitalOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const offer = new CapitalOffer({
        core,
        onFundsRequest: () => {},
    });
    offer.mount('#container');
    offer.unmount();

    const state: CapitalComponentState = { state: 'isPreQualified' };

    const _overviewProps: CapitalOverviewProps = {};
    const _offerProps: CapitalOfferProps = { onFundsRequest: () => {} };
}

// ── Transactions ───────────────────────────────────────────────────────────────

async function testTransactions() {
    const core = await testCoreFactory();

    const overview = new TransactionsOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const details = new TransactionDetails({ core, id: 'tx-123' });
    details.mount('#container');
    details.unmount();

    const _overviewProps: TransactionsOverviewComponentProps = {};
    const _detailsProps: TransactionDetailsProps = { id: 'tx-123' };
}

// ── Payouts ────────────────────────────────────────────────────────────────────

async function testPayouts() {
    const core = await testCoreFactory();

    const overview = new PayoutsOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const details = new PayoutDetails({
        core,
        id: 'BA32CKZ223227T5L6834T3LBX',
        date: '2025-06-13T00:00:00.000+00:00',
    });
    details.mount('#container');
    details.unmount();

    const _overviewProps: PayoutsOverviewProps = {};
    const _detailsProps: PayoutDetailsProps = {
        id: 'BA32CKZ223227T5L6834T3LBX',
        date: '2025-06-13T00:00:00.000+00:00',
    };
}

// ── Reports ────────────────────────────────────────────────────────────────────

async function testReports() {
    const core = await testCoreFactory();

    const overview = new ReportsOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const _props: ReportsOverviewProps = {};
}

// ── Disputes ───────────────────────────────────────────────────────────────────

async function testDisputes() {
    const core = await testCoreFactory();

    const overview = new DisputesOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const management = new DisputeManagement({ core, id: 'D2CT6C4NZM27Z5V5' });
    management.mount('#container');
    management.unmount();

    const _overviewProps: DisputesOverviewProps = {};
    const _managementProps: DisputeManagementProps = { id: 'D2CT6C4NZM27Z5V5' };
}

// ── Pay by Link ────────────────────────────────────────────────────────────────

async function testPayByLink() {
    const core = await testCoreFactory();

    const overview = new PaymentLinksOverview({ core });
    overview.mount('#container');
    overview.unmount();

    const creation = new PaymentLinkCreation({ core });
    creation.mount('#container');
    creation.unmount();

    const details = new PaymentLinkDetails({ core, id: 'PL123' });
    details.mount('#container');
    details.unmount();

    const settings = new PaymentLinkSettings({ core });
    settings.mount('#container');
    settings.unmount();

    const _overviewProps: PaymentLinksOverviewProps = {};
    const _creationProps: PaymentLinkCreationProps = {};
    const _detailsProps: PaymentLinkDetailsProps = { id: 'PL123' };
    const _settingsProps: PaymentLinkSettingsProps = {};
}

export { testCoreFactory, testCapital, testTransactions, testPayouts, testReports, testDisputes, testPayByLink };
