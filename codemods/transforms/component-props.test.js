import { test, expect } from 'vitest';
import { runTransform } from '../helpers.js';
import transform from './component-props.cjs';

test('Transactions Overview: converts hideTitle, groups pagination props, removes showDetails/onFiltersChanged', () => {
    const input = `
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';

const transactionsOverview = new TransactionsOverview({
    core,
    hideTitle: true,
    showDetails: false,
    onFiltersChanged: filters => console.log(filters),
    onRecordSelection: ({ id, showModal }) => navigateToMyPage(id),
    allowLimitSelection: false,
    preferredLimit: 20,
});
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'adds appearance.titles').toContain("titles: 'hidden'");
    expect(output, 'removes hideTitle').not.toContain('hideTitle');
    expect(output, 'removes the showDetails option').not.toMatch(/^[ \t]*showDetails:/m);
    expect(output, 'removes onFiltersChanged').not.toContain('onFiltersChanged');
    expect(output, 'keeps onRecordSelection').toContain('onRecordSelection');
    expect(output, 'renames the selection callback field').toContain('({ id, showDetails })');
    expect(output, 'drops the old selection field name').not.toContain('showModal');
    expect(output, 'creates one pagination object').toContain('pagination: {');
    expect(output, 'moves preferredLimit').toContain('defaultLimit: 20');
    expect(output, 'converts allowLimitSelection: false').toContain('disableLimitSelection: true');
    expect(output, 'drops the old pagination prop names').not.toContain('preferredLimit');
    expect(output).not.toContain('allowLimitSelection');
    // No marker needed: onRecordSelection takes over selection.
    expect(output, 'no TODO comment needed').not.toContain('TODO(v2-migration)');
    expect(notes.some(note => note.includes('hideTitle')), 'notes the hideTitle change').toBe(true);
    expect(notes.some(note => note.includes('pagination')), 'notes the pagination change').toBe(true);
});

test('showDetails: false without onRecordSelection gets a TODO comment', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    showDetails: false,
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'removes the showDetails prop').not.toMatch(/^[ \t]*showDetails:/m);
    expect(output, 'flags the behavioral change').toContain(
        "TODO(v2-migration): TransactionsOverview: 'showDetails: false' has no direct V2 equivalent"
    );
});

test('Capital Overview: removes all flow-control props', () => {
    const input = `
const capitalOverview = new CapitalOverview({
    core,
    onFundsRequest: (grant, renewsGrantId) => requestFunds(grant, renewsGrantId),
    onOfferDismiss: () => closeOffer(),
    onOfferOptionsRequest: () => openOptions(),
    skipPreQualifiedIntro: true,
});
`;
    const { output } = runTransform(transform, input);

    expect(output).not.toContain('onFundsRequest');
    expect(output).not.toContain('onOfferDismiss');
    expect(output).not.toContain('onOfferOptionsRequest');
    expect(output).not.toContain('skipPreQualifiedIntro');
    expect(output, 'keeps the core prop').toContain('core');
    expect(output, 'no TODO comment needed').not.toContain('TODO(v2-migration)');
});

test('Capital Offer: removes onOfferSelect and externalCapitalState, renames onOfferDismiss', () => {
    const input = `
const capitalOffer = new CapitalOffer({
    core,
    onFundsRequest: (grant, renewsGrantId) => requestFunds(grant, renewsGrantId),
    onOfferSelect: offer => openOwnSummary(offer),
    externalCapitalState: cachedState,
    onOfferDismiss: () => closeOffer(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output).not.toContain('onOfferSelect');
    expect(output).not.toContain('externalCapitalState');
    expect(output, 'keeps onFundsRequest').toContain('onFundsRequest');
    expect(output, 'renames onOfferDismiss to onDismiss').toContain('onDismiss: () => closeOffer()');
    expect(output).not.toContain('onOfferDismiss');
});

test('Capital Offer: an already-set onDismiss wins with a TODO', () => {
    const input = `
const capitalOffer = new CapitalOffer({
    core,
    onFundsRequest: async () => {},
    onOfferDismiss: () => closeOffer(),
    onDismiss: () => close(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops onOfferDismiss anyway').not.toMatch(/^[ \t]*onOfferDismiss:/m);
    expect(output, 'keeps the explicit onDismiss').toContain('onDismiss: () => close()');
    expect(output, 'flags the conflicting rename').toContain(
        "TODO(v2-migration): CapitalOffer: dropped 'onOfferDismiss' — renamed to 'onDismiss', which is already provided"
    );
});

test('per-component onError is removed with a TODO comment', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onError: error => reportError(error),
});
`;
    const { output } = runTransform(transform, input);

    expect(!output.match(/onError:/), 'removes per-component onError').toBe(true);
    expect(output, 'flags the manual move to core-level onError').toContain(
        "per-component 'onError' no longer takes effect in V2"
    );
});

test('Pay by Link Overview: drops the now-internal sub-configurations and hoists storeIds', () => {
    const input = `
const paymentLinksOverview = new PaymentLinksOverview({
    core,
    paymentLinkCreation: {
        onCreationDismiss: () => closeCreation(),
    },
    paymentLinkSettings: {
        hideTitle: true,
        storeIds: ['store-1'],
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'removes the paymentLinkCreation property').not.toMatch(/^[ \t]*paymentLinkCreation:/m);
    expect(output, 'removes the paymentLinkSettings property').not.toMatch(/^[ \t]*paymentLinkSettings:/m);
    expect(output, 'hoists storeIds to the top level').toContain("storeIds: ['store-1']");
    expect(output, 'flags the dropped creation sub-config').toContain(
        "TODO(v2-migration): PaymentLinksOverview: 'paymentLinkCreation' is no longer a public prop"
    );
    expect(output, 'names what the creation sub-config carried').toContain("It carried 'onCreationDismiss'");
    expect(output, 'names what the settings sub-config carried').toContain("It carried 'hideTitle'");
});

test('PaymentLinkCreation: renames onCreationDismiss to onDismiss', () => {
    const input = `
const creation = new PaymentLinkCreation({
    core,
    onCreationDismiss: () => closeCreation(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain('onDismiss: () => closeCreation()');
    expect(output).not.toContain('onCreationDismiss');
});

test('DisputeManagement: renames the dispute callbacks to onAccept and onDefend', () => {
    const input = `
const disputeManagement = new DisputeManagement({
    core,
    id: 'd-1',
    onDisputeAccept: dispute => acceptDispute(dispute),
    onDisputeDefend: dispute => defendDispute(dispute),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the accept callback').toContain('onAccept: dispute => acceptDispute(dispute)');
    expect(output, 'renames the defend callback').toContain('onDefend: dispute => defendDispute(dispute)');
    expect(output, 'leaves no old accept name').not.toContain('onDisputeAccept');
    expect(output, 'leaves no old defend name').not.toContain('onDisputeDefend');
});

test('PaymentLinkCreation: renames onPaymentLinkCreated to onCreate', () => {
    const input = `
const creation = new PaymentLinkCreation({
    core,
    onPaymentLinkCreated: link => trackLink(link),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the created callback').toContain('onCreate: link => trackLink(link)');
    expect(output, 'leaves no old created name').not.toContain('onPaymentLinkCreated');
});

test('Pay by Link Overview: removes balanceAccountId and keeps storeIds', () => {
    const input = `
const paymentLinksOverview = new PaymentLinksOverview({
    core,
    balanceAccountId: 'BA-1',
    storeIds: ['store-9'],
});
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'removes the balance account scope').not.toMatch(/^[ \t]*balanceAccountId:/m);
    expect(output, 'keeps the store scope').toContain("storeIds: ['store-9']");
    expect(notes.some(note => note.includes('balanceAccountId')), 'notes the removal').toBe(true);
});

test('PaymentLinkDetails: removes the internal onUpdate callback', () => {
    const input = `
const paymentLinkDetails = new PaymentLinkDetails({
    core,
    id: 'pl-1',
    onUpdate: () => refreshList(),
});
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'removes the internal callback').not.toMatch(/^[ \t]*onUpdate:/m);
    expect(notes.some(note => note.includes('onUpdate')), 'notes the removal reason').toBe(true);
});

test('PaymentLinkSettings: removes the internal-only props', () => {
    const input = `
const paymentLinkSettings = new PaymentLinkSettings({
    core,
    storeIds: ['store-3'],
    settingsItems: ['theme'],
    embeddedInOverview: true,
    navigateBack: () => goBack(),
});
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'removes settingsItems').not.toMatch(/^[ \t]*settingsItems:/m);
    expect(output, 'removes embeddedInOverview').not.toMatch(/^[ \t]*embeddedInOverview:/m);
    expect(output, 'removes navigateBack').not.toMatch(/^[ \t]*navigateBack:/m);
    expect(output, 'keeps the public store scope').toContain("storeIds: ['store-3']");
    expect(notes.some(note => note.includes('navigateBack')), 'notes the navigateBack removal').toBe(true);
});

test('Pay by Link Overview: a sub-config built elsewhere is reported as unverified', () => {
    const input = `
const paymentLinksOverview = new PaymentLinksOverview({
    core,
    paymentLinkSettings: settingsOptions,
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'removes the sub-config anyway').not.toMatch(/^[ \t]*paymentLinkSettings:/m);
    expect(output, 'does not claim it was empty').not.toContain('Nothing inside it needed hoisting');
    expect(output, 'says the contents could not be checked').toContain('Its value is not an object literal in this file');
});

test('Pay by Link Overview: a spread sub-config is reported as unverified', () => {
    const input = `
const paymentLinksOverview = new PaymentLinksOverview({
    core,
    paymentLinkSettings: { ...settingsDefaults },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'removes the sub-config').not.toMatch(/^[ \t]*paymentLinkSettings:/m);
    expect(output, 'does not claim it was empty').not.toContain('Nothing inside it needed hoisting');
    expect(output, 'names the spread').toContain('spread or computed entries');
});

test('onRecordSelection: Payouts destructuring renames balanceAccountId to id', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    onRecordSelection: ({ balanceAccountId, date, showModal }) => {
        navigateToBalanceAccount(balanceAccountId);
        showModal();
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the selection field').toContain('{ id, date, showDetails }');
    expect(output, 'renames the body reference').toContain('navigateToBalanceAccount(id)');
    expect(output, 'renames the callback call').toContain('showDetails()');
    expect(output, 'leaves no old field name').not.toContain('balanceAccountId');
});

test('element.update() calls are migrated through instance tracking', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({ core, hideTitle: true });
transactionsOverview.update({ hideTitle: false, preferredLimit: 50 });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'converts the constructor prop').toContain("titles: 'hidden'");
    expect(output, 'converts the update prop too').not.toContain('hideTitle');
    expect(output, 'migrates the pagination prop in update calls too').toContain('defaultLimit: 50');
    expect(output).not.toContain('preferredLimit');
});

test('props objects declared in the same file are migrated too', () => {
    const input = `
const props = {
    core,
    hideTitle: true,
    onFiltersChanged: () => {},
};

const overview = new TransactionsOverview(props);
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain("titles: 'hidden'");
    expect(output).not.toContain('hideTitle');
    expect(output).not.toContain('onFiltersChanged');
});

test('aliases and destructuring are resolved', () => {
    const input = `
const { TransactionsOverview: Overview } = AdyenPlatformExperienceWeb;
const TO = TransactionsOverview;

const a = new Overview({ core, hideTitle: true });
const b = new TO({ core, hideTitle: true });
`;
    const { output } = runTransform(transform, input);

    expect((output.match(/titles: 'hidden'/g) || []).length).toBe(2);
});

test('already-V2 code is left untouched', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    appearance: { titles: 'hidden' },
    onRecordSelection: ({ id, showDetails }) => showDetails(),
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('hideTitle: false is removed without adding appearance', () => {
    const input = `
const reports = new ReportsOverview({
    core,
    hideTitle: false,
    onFiltersChanged: () => {},
});
`;
    const { output } = runTransform(transform, input);

    expect(output).not.toContain('hideTitle');
    expect(output).not.toContain('appearance');
    expect(output).not.toContain('onFiltersChanged');
});

test('existing appearance is merged instead of duplicated', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    appearance: { illustrations: 'hidden' },
    hideTitle: true,
});
`;
    const { output } = runTransform(transform, input);

    expect(output).not.toContain('hideTitle');
    expect(output, 'keeps the existing appearance fields').toContain("illustrations: 'hidden',");
    expect(output, 'merges titles into the existing appearance object').toContain("titles: 'hidden'");
    expect((output.match(/appearance:/g) || []).length, 'does not duplicate the appearance prop').toBe(1);
});

test('preferredLimit alone moves into a new pagination object', () => {
    const input = `
const payouts = new PayoutsOverview({ core, preferredLimit: 50 });
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'moves the value as-is').toContain('defaultLimit: 50');
    expect(output, 'creates a single pagination object').toContain('pagination:');
    expect(output, 'drops the old prop').not.toMatch(/^[ \t]*preferredLimit:/m);
});

test('dynamic preferredLimit values move without a marker', () => {
    const input = `
const disputes = new DisputesOverview({ core, preferredLimit: initialLimit });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'moves dynamic values as-is').toContain('defaultLimit: initialLimit');
    expect(output, 'drops the old prop').not.toMatch(/^[ \t]*preferredLimit:/m);
    expect(output).not.toContain('TODO(v2-migration)');
});

test('allowLimitSelection: true is dropped without creating a pagination object', () => {
    const input = `
const reports = new ReportsOverview({ core, allowLimitSelection: true });
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'drops the default').not.toContain('allowLimitSelection');
    expect(output, 'creates no empty pagination object').not.toContain('pagination');
    expect(notes.some(note => note.includes("removed 'allowLimitSelection: true'")), 'notes the drop').toBe(true);
});

test('existing pagination objects are merged per field', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    pagination: { disableLimitSelection: true },
    preferredLimit: 20,
});
`;
    const { output } = runTransform(transform, input);

    expect((output.match(/pagination:/g) || []).length, 'keeps a single pagination object').toBe(1);
    expect(output, 'keeps the existing field').toContain('disableLimitSelection: true');
    expect(output, 'adds the migrated field').toContain('defaultLimit: 20');
});

test('an already-set pagination field wins with a TODO', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    pagination: { defaultLimit: 10 },
    preferredLimit: 20,
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the old prop anyway').not.toMatch(/^[ \t]*preferredLimit:/m);
    expect(output, 'keeps the existing field').toContain('defaultLimit: 10');
    expect(output, 'flags the conflict').toContain(
        "TODO(v2-migration): TransactionsOverview: 'preferredLimit' was dropped — 'pagination.defaultLimit' is already set and wins"
    );
});

test('a dynamic existing pagination value gets a TODO', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({ core, pagination: dynamicPagination, preferredLimit: 20 });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the old prop').not.toMatch(/^[ \t]*preferredLimit:/m);
    expect(output, 'flags the dynamic pagination').toContain(
        "TODO(v2-migration): TransactionsOverview: 'preferredLimit' was dropped — the existing 'pagination' value is dynamic; add 'defaultLimit' to it manually"
    );
});

test('a dynamic allowLimitSelection gets a TODO about the negation', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({ core, allowLimitSelection: disableSelection });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the old prop').not.toMatch(/^[ \t]*allowLimitSelection:/m);
    expect(output, 'flags the manual negation').toContain(
        "TODO(v2-migration): TransactionsOverview: 'allowLimitSelection' was removed. Its value was dynamic; set 'pagination.disableLimitSelection' to its negation manually"
    );
});

test('Transactions Overview: renames dataCustomization.list to dataCustomization.dataGrid', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    dataCustomization: {
        list: { columns: [customColumn] },
        details: { fields: [customField] },
    },
});
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'renames the list key').toContain('dataGrid: {');
    expect(output, 'keeps the details key').toContain('details: {');
    expect(output, 'drops the list key').not.toMatch(/^[ \t]*list:/m);
    expect(
        notes.some(note => note.includes("renamed 'dataCustomization.list' → 'dataCustomization.dataGrid'")),
        'notes the rename'
    ).toBe(true);
});

test('Pay by Link Overview keeps dataCustomization.list', () => {
    const input = `
const paymentLinksOverview = new PaymentLinksOverview({
    core,
    dataCustomization: { list: { columns: [customColumn] } },
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('an already-set dataGrid key wins with a TODO', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    dataCustomization: { list: { columns: [a] }, dataGrid: { columns: [b] } },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the list key anyway').not.toMatch(/^[ \t]*list:/m);
    expect(output, 'keeps the existing dataGrid key').toContain('dataGrid: { columns: [b] }');
    expect(output, 'flags the conflict').toContain(
        'TODO(v2-migration): dataCustomization.list was dropped — renamed to dataCustomization.dataGrid, which is already provided'
    );
});

test('dataCustomization: removes align from custom column entries', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    dataCustomization: {
        list: {
            fields: [
                { key: 'adjustmentAmount', visibility: 'hidden' },
                { key: '_sendEmail', align: 'right' },
                { key: '_country', flex: 0.5 },
            ],
        },
    },
});
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed, 'changes the file').toBe(true);
    expect(output, 'removes align').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'keeps the cleaned-up column entry').toContain("key: '_sendEmail'");
    expect(output, 'keeps flex').toContain('flex: 0.5');
    expect(output, 'keeps visibility').toContain("visibility: 'hidden'");
    expect(
        notes.some(note => note.includes("PayoutsOverview dataCustomization.dataGrid: removed 'align' from a column entry")),
        'notes the removal against the migrated sub-config key'
    ).toBe(true);
});

test('dataCustomization: removes align from a separately declared grid customization', () => {
    const input = `
const columns: PayoutsListCustomization = {
    fields: [
        { key: 'adjustmentAmount', visibility: 'hidden' },
        { key: '_sendEmail', align: 'right' },
    ],
    onDataRetrieve: async data => data,
};

const payoutsOverview = new PayoutsOverview({ core, dataCustomization: { list: columns } });
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed, 'rewrites the declaration').toBe(true);
    expect(output, 'drops align from the declaration').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'keeps the other column entries').toContain("visibility: 'hidden'");
    expect(output, 'keeps the rest of the customization').toContain('onDataRetrieve');
    expect(
        notes.some(note => note.includes("PayoutsListCustomization: removed 'align' from a column entry")),
        'notes the removal against the annotated type'
    ).toBe(true);
});

test('dataCustomization: a separately declared details customization is left alone', () => {
    const input = `
const detailFields: PayoutDetailsCustomization = {
    fields: [{ key: 'beneficiary', align: 'right' }],
};
`;
    const { changed } = runTransform(transform, input);

    expect(changed, 'touches nothing outside grid customizations').toBe(false);
});

test('dataCustomization: removes align from entries under the dataGrid key too', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    dataCustomization: { dataGrid: { fields: [{ key: '_country', align: 'right' }] } },
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'rewrites the file').toBe(true);
    expect(output, 'drops align under dataGrid').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'keeps the cleaned-up column entry').toContain("key: '_country'");
});

test('dataCustomization: details fields never had align and are untouched', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    dataCustomization: { details: { fields: [{ key: 'beneficiary', visibility: 'hidden' }] } },
});
`;
    const { changed, notes } = runTransform(transform, input);

    expect(changed, 'changes nothing').toBe(false);
    expect(notes.some(note => note.includes('column entry')), 'notes no column entry').toBe(false);
});

test('dataCustomization: a fields array built elsewhere is flagged, not rewritten', () => {
    const input = `
const reportsOverview = new ReportsOverview({
    core,
    dataCustomization: { list: { fields: customFields } },
});
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'renames the key but keeps the dynamic fields').toContain('dataGrid: { fields: customFields }');
    expect(notes.some(note => note.includes('column entry')), 'does not note any column entry').toBe(false);
    expect(output, 'flags the unreachable column entries').toContain(
        "ReportsOverview dataCustomization.dataGrid.fields is not a literal in this file, so 'align' could not be removed"
    );
});

test('dataCustomization: a customization referenced in the same file is migrated', () => {
    const input = `
const columns = {
    fields: [{ key: '_sendEmail', align: 'right' }],
};

const payoutsOverview = new PayoutsOverview({ core, dataCustomization: { list: columns } });
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'resolves the reference').toBe(true);
    expect(output, 'cleans the referenced declaration').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'renames the sub-config key at the call site').toContain('dataGrid: columns');
    expect(output, 'needs no marker').not.toMatch(/TODO\(v2-migration\)/);
});

test('dataCustomization: an as-cast customization is migrated through its annotation', () => {
    const input = `
const columns = {
    fields: [{ key: '_country', align: 'center' }],
} as PayoutsListCustomization;
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'reads the cast annotation').toBe(true);
    expect(output, 'drops align').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'keeps the cast').toContain('as PayoutsListCustomization');
});

test('dataCustomization: a whole customization referenced in the same file gets both migrations', () => {
    const input = `
const customization = {
    list: { fields: [{ key: '_summary', align: 'right' }] },
};

const disputesOverview = new DisputesOverview({ core, dataCustomization: customization });
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'resolves the reference').toBe(true);
    expect(output, 'applies the sub-config rename inside the declaration').toMatch(/^[ \t]*dataGrid:/m);
    expect(output, 'drops the V1 key').not.toMatch(/^[ \t]*list:/m);
    expect(output, 'removes align too').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'needs no marker either').not.toMatch(/TODO\(v2-migration\)/);
});

test('dataCustomization: a customization imported from another file is flagged', () => {
    const input = `
import { importedCustomization } from './customization';

const payoutsOverview = new PayoutsOverview({ core, dataCustomization: importedCustomization });
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'marks the call site').toBe(true);
    expect(output, 'flags the unapplied sub-config rename').toContain(
        "PayoutsOverview: 'dataCustomization' is not an object literal in this file"
    );
    expect(output, 'names the removed column option as well').toContain(
        "PayoutsOverview dataCustomization is not a literal in this file, so 'align' could not be removed"
    );
});

test('dataCustomization: removes align from update calls too', () => {
    const input = `
const disputesOverview = new DisputesOverview({ core });
disputesOverview.update({
    dataCustomization: { list: { fields: [{ key: '_summary', align: 'right' }] } },
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed, 'migrates the update call').toBe(true);
    expect(output, 'removes align in the update call').not.toMatch(/^[ \t]*align:/m);
    expect(output, 'renames the sub-config key').toContain('dataGrid: {');
    expect(output, 'keeps the column entry').toContain("key: '_summary'");
});

test('onRecordSelection: renames the destructured showModal field to showDetails', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => navigateToMyPage(id),
});
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'renames the destructured field').toContain('({ id, showDetails })');
    expect(output, 'drops the old field name').not.toContain('showModal');
    expect(
        notes.some(note => note.includes("renamed the 'onRecordSelection' selection field 'showModal' → 'showDetails'")),
        'notes the rename'
    ).toBe(true);
});

test('onRecordSelection: renames showModal references in the callback body', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => {
        if (shouldOpenDetails(id)) {
            showModal();
        } else {
            navigateToMyPage(id);
        }
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the call').toContain('showDetails();');
    expect(output, 'renames the destructured field').toContain('({ id, showDetails })');
    expect(output, 'drops the old field name').not.toContain('showModal');
});

test('onRecordSelection: nested closures over the binding are renamed too', () => {
    const input = `
const disputesOverview = new DisputesOverview({
    core,
    onRecordSelection: ({ id, showModal }) => {
        later(() => showModal());
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain('() => showDetails()');
    expect(output).not.toContain('showModal');
});

test('onRecordSelection: shadowed showModal in a nested function keeps its binding', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => {
        const handler = ({ showModal }) => showModal();
        handler({ showModal: showModal });
        showModal();
    },
});
`;
    const { output } = runTransform(transform, input);

    // The nested destructure keeps its own binding and references; the
    // callback's own binding and references are renamed.
    expect(output, 'renames the outer binding call').toContain('showDetails();');
    expect(output, 'keeps the nested destructure').toContain('({ showModal }) => showModal()');
    expect(output, 'keeps the consumer key, renames its value').toContain('showModal: showDetails');
});

test('onRecordSelection: aliased destructuring keeps the local name', () => {
    const input = `
const disputesOverview = new DisputesOverview({
    core,
    onRecordSelection: ({ id, showModal: openDetails }) => openDetails(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the source key only').toContain('showDetails: openDetails');
    expect(output, 'keeps the local reference').toContain('=> openDetails()');
});

test('onRecordSelection: defaulted destructuring renames the binding and its references', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    onRecordSelection: ({ balanceAccountId, date, showModal = noop }) => showModal(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the defaulted binding').toContain('showDetails = noop');
    expect(output, 'renames the reference').toContain('=> showDetails()');
    expect(output).not.toContain('showModal');
});

test('onRecordSelection: shorthand objects keep their key, rename the value', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => ({ id, showModal }),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the destructured field').toContain('({ id, showDetails })');
    expect(output, 'keeps the returned key, renames its value').toContain('({ id, showModal: showDetails })');
});

test('onRecordSelection: member access on other objects is untouched', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => {
        legacyApi.showModal(id);
        showModal();
    },
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'keeps the unrelated member access').toContain('legacyApi.showModal(id)');
    expect(output, 'renames the binding call').toContain('showDetails();');
});

test('onRecordSelection: an already-destructured showDetails wins with a TODO', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: ({ id, showModal, showDetails }) => showDetails(),
});
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the old field anyway').not.toContain('({ id, showModal');
    expect(output, 'flags the conflict').toContain(
        "TODO(v2-migration): TransactionsOverview: dropped 'showModal' from the 'onRecordSelection' selection destructuring — 'showDetails' is already destructured and wins"
    );
    expect(output, 'keeps the existing binding call').toContain('=> showDetails()');
});

test('onRecordSelection: whole-selection handlers using the old field get a TODO', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    onRecordSelection: selection => selection.showModal(),
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'leaves the handler untouched').toContain('selection.showModal()');
    expect(output, 'flags the manual rename').toContain(
        "TODO(v2-migration): PayoutsOverview: 'onRecordSelection's selection object renamed 'balanceAccountId' → 'id', 'showModal' → 'showDetails' in V2 — this handler takes the selection as a whole"
    );
});

test('onRecordSelection: whole-selection handlers without a renamed field are left alone', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    onRecordSelection: selection => navigateToMyPage(selection.id, selection.date),
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('onRecordSelection: Payouts handlers using the renamed balanceAccountId field get a TODO', () => {
    const input = `
const payoutsOverview = new PayoutsOverview({
    core,
    onRecordSelection: selection => navigateToMyPage(selection.balanceAccountId, selection.date),
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'leaves the handler untouched').toContain('selection.balanceAccountId');
    expect(output, 'flags the field rename').toContain(
        "TODO(v2-migration): PayoutsOverview: 'onRecordSelection's selection object renamed 'balanceAccountId' → 'id', 'showModal' → 'showDetails' in V2"
    );
});

test('onRecordSelection: handlers defined elsewhere get a TODO', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({
    core,
    onRecordSelection: handleRecordSelection,
});
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'keeps the handler reference').toContain('onRecordSelection: handleRecordSelection');
    expect(output, 'flags the external handler').toContain(
        "TODO(v2-migration): TransactionsOverview: 'onRecordSelection's selection object renamed 'showModal' → 'showDetails' in V2 — the handler is defined elsewhere"
    );
});

test('onRecordSelection: .update() calls get the selection-field rename too', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({ core });
transactionsOverview.update({ onRecordSelection: ({ id, showModal }) => showModal() });
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain('({ id, showDetails })');
    expect(output).not.toContain('showModal');
});

test('Reports Overview: removes onRecordSelection', () => {
    const input = `
const reportsOverview = new ReportsOverview({
    core,
    onRecordSelection: ({ id, showModal }) => openReport(id),
});
`;
    const { output, notes } = runTransform(transform, input);

    expect(output, 'removes the prop with its callback').not.toContain('onRecordSelection');
    expect(output).not.toContain('showModal');
    expect(
        notes.some(note => note.includes("removed 'onRecordSelection' (report rows are not selectable")),
        'notes the removal'
    ).toBe(true);
});

test('unknown components and unrelated objects are ignored', () => {
    const input = `
const myThing = new MyComponent({ core, hideTitle: true, showDetails: false });
const config = { onError: () => {}, hideTitle: true };
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('JSX/TSX React integrations are supported', () => {
    const input = `
import { TransactionsOverview } from '@adyen/adyen-platform-experience-web';

export function App({ hideTitle }) {
    const overview = new TransactionsOverview({ core, hideTitle: true });
    return <div ref={el => el && overview.mount(el)} />;
}
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output).toContain("titles: 'hidden'");
    expect(output).not.toContain('hideTitle: true');
    expect(output, 'preserves the JSX').toContain('return <div');
});

test('unattributed .update() calls with V1-only props get a TODO flag (comment only)', () => {
    const input = `
const overview = createOverview();

export function disableTitle() {
    overview.update({ hideTitle: true, preferredLimit: 50 });
}
`;
    const { output, changed, notes } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'flags the unattributed update call').toContain(
        "TODO(v2-migration): this .update() call sets 'hideTitle', 'preferredLimit', which were removed or renamed for at least one component in V2, and the component behind 'overview' could not be identified"
    );
    expect(output, 'does not modify the props (comment only)').toContain('hideTitle: true');
    expect(output, 'leaves the V1-only prop untouched (comment only)').toContain('preferredLimit: 50');
    expect(
        notes.some(note => note.includes('flagged unattributed .update() setting: hideTitle, preferredLimit')),
        'notes both flagged props'
    ).toBe(true);
});

test('unattributed .update() calls on member receivers are flagged too', () => {
    const input = `
export function dismiss({ store }) {
    store.links.update({ onCreationDismiss: () => {} });
}
`;
    const { output } = runTransform(transform, input);

    expect(output, 'names the receiver in the flag').toContain("the component behind 'store.links' could not be identified");
    expect(output, 'does not modify the props (comment only)').toContain('onCreationDismiss: () => {}');
});

test('unattributed .update() calls with only valid V2 props are not flagged', () => {
    const input = `
const core = await AdyenPlatformExperience({ onSessionCreate: handleSessionCreate });

export function setLocale() {
    core.update({ locale: 'de-DE' });
    window.component.update({ pagination: { defaultLimit: 50 }, appearance: { titles: 'hidden' } });
}
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});
