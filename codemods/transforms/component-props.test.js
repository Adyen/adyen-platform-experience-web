import { test, expect } from 'vitest';
import { runTransform } from '../helpers.js';
import transform from './component-props.cjs';

test('Transactions Overview: converts hideTitle, removes showDetails/onFiltersChanged', () => {
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
    expect(output, 'removes showDetails').not.toContain('showDetails');
    expect(output, 'removes onFiltersChanged').not.toContain('onFiltersChanged');
    expect(output, 'keeps onRecordSelection').toContain('onRecordSelection');
    expect(output, 'keeps other props').toContain('preferredLimit: 20');
    // No marker needed: onRecordSelection takes over selection.
    expect(output, 'no TODO comment needed').not.toContain('TODO(v2-migration)');
    expect(notes.some(note => note.includes('hideTitle')), 'notes the hideTitle change').toBe(true);
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

test('Capital Offer: removes onOfferSelect and externalCapitalState, keeps the rest', () => {
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
    expect(output, 'keeps onOfferDismiss').toContain('onOfferDismiss');
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

test('Pay by Link Overview: renames sub-config callbacks and hoists storeIds', () => {
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

    expect(output, 'renames onCreationDismiss').toContain('paymentLinkCreation: {\n        onDismiss: () => closeCreation(),\n    },');
    expect(output).not.toContain('onCreationDismiss');
    expect(output, 'removes sub-config hideTitle').not.toContain('hideTitle');
    expect(!output.match(/paymentLinkSettings: \{\n {8}hideTitle|paymentLinkSettings: \{[^}]*storeIds/), 'sub-config is cleaned').toBe(true);
    expect(output, 'hoists storeIds to the top level').toContain("storeIds: ['store-1']");
    expect(output, 'flags the required onDismiss').toContain("TODO(v2-migration): paymentLinkSettings now requires 'onDismiss'");
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

test('element.update() calls are migrated through instance tracking', () => {
    const input = `
const transactionsOverview = new TransactionsOverview({ core, hideTitle: true });
transactionsOverview.update({ hideTitle: false, preferredLimit: 50 });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'converts the constructor prop').toContain("titles: 'hidden'");
    expect(output, 'converts the update prop too').not.toContain('hideTitle');
    expect(output, 'keeps other update props').toContain('preferredLimit: 50');
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
    onRecordSelection: ({ id, showModal }) => showModal(),
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
        "TODO(v2-migration): this .update() call sets 'hideTitle', which was removed or renamed for at least one component in V2, and the component behind 'overview' could not be identified"
    );
    expect(output, 'does not modify the props (comment only)').toContain('hideTitle: true');
    expect(output, 'keeps valid props untouched').toContain('preferredLimit: 50');
    expect(notes.some(note => note.includes('flagged unattributed .update() setting: hideTitle'))).toBe(true);
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
    window.component.update({ preferredLimit: 50, appearance: { titles: 'hidden' } });
}
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});
