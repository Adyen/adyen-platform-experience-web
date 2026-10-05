import { test, expect } from 'vitest';
import { runTransform } from '../helpers.js';
import transform from './fix-imports.cjs';

test('renames ComponentProps types and removes unused removed-export imports', () => {
    const input = `
import {
    Core,
    TransactionsOverview,
    TransactionsOverviewComponentProps,
    TransactionsFilters,
    http,
    type TranslationKey,
} from '@adyen/adyen-platform-experience-web';

export const props: TransactionsOverviewComponentProps = { core: null as any };
export type Filters = TransactionsFilters | undefined;
export const version = Core.version;
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(true);
    expect(output, 'renames the type').toContain('TransactionsOverviewProps');
    expect(output).not.toContain('TransactionsOverviewComponentProps');
    expect(output, 'drops the unused removed export').not.toContain('http,');
    // Core and TransactionsFilters are still referenced: kept with a marker comment.
    expect(output, 'keeps referenced removed export').toContain('Core,');
    expect(output, 'keeps referenced removed export').toContain('TransactionsFilters,');
    expect(output, 'flags them').toContain("TODO(v2-migration): 'Core', 'TransactionsFilters' are no longer exported");
    expect(output, 'keeps valid exports').toContain('TransactionsOverview,');
    expect(output, 'keeps valid type exports').toContain('type TranslationKey');
});

test('removes import specifiers that are no longer published and unused', () => {
    const input = `
import { TransactionsOverview, http, httpGet } from '@adyen/adyen-platform-experience-web';

const overview = new TransactionsOverview({ core: null as any });
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops unused removed exports').not.toContain('http');
    expect(output).toContain('TransactionsOverview');
    expect(output, 'no TODO for unused removals').not.toContain('TODO(v2-migration)');
});

test('drops the whole import when everything in it was unused and removed', () => {
    const input = `
import { Assets, AuthSession, Analytics } from '@adyen/adyen-platform-experience-web';

console.log('nothing used');
`;
    const { output } = runTransform(transform, input);

    expect(output).not.toContain('Assets');
    expect(output, 'drops the empty import').not.toContain('@adyen/adyen-platform-experience-web');
    expect(output, 'keeps the rest of the file').toContain("console.log('nothing used');");
});

test('renames ExternalCapitalState to CapitalState everywhere', () => {
    const input = `
import { CapitalOffer, type ExternalCapitalState } from '@adyen/adyen-platform-experience-web';

export function stateOf(offer: CapitalOffer): ExternalCapitalState | undefined {
    return offer.getState();
}
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the import').toContain('type CapitalState');
    expect(output, 'renames the reference').toContain('): CapitalState | undefined');
    expect(output).not.toContain('ExternalCapitalState');
});

test('aliased imports keep their local name', () => {
    const input = `
import { TransactionsOverviewComponentProps as Props } from '@adyen/adyen-platform-experience-web';

export const x: Props = { core: null as any };
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames only the imported name').toContain('TransactionsOverviewProps as Props');
    expect(output, 'keeps the local alias references').toContain(': Props =');
});

test('renames onErrorHandler to ErrorHandler', () => {
    const input = `
import { type onErrorHandler } from '@adyen/adyen-platform-experience-web';

const handler: onErrorHandler = error => console.error(error);
`;
    const { output } = runTransform(transform, input);

    expect(output).toContain('type ErrorHandler');
    expect(output).toContain(': ErrorHandler =');
    expect(output).not.toContain('onErrorHandler');
});

test('require destructuring gets the same treatment', () => {
    const input = `
const { CapitalOffer, Core, CapitalOfferComponentProps } = require('@adyen/adyen-platform-experience-web');

const offer = new CapitalOffer({ core: null as any, onFundsRequest: async () => {} });
const state: CapitalOfferComponentProps['core'] = offer;

module.exports = { offer, state, core: Core };
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the type binding').toContain('CapitalOfferProps');
    expect(output, 'keeps the referenced removed export').toContain('Core,');
    expect(output, 'flags it').toContain('TODO(v2-migration)');
});

test('require destructuring removes unused removed exports', () => {
    const input = `
const { TransactionsOverview, Localization } = require('@adyen/adyen-platform-experience-web');

const overview = new TransactionsOverview({ core: null as any });
module.exports = { overview };
`;
    const { output } = runTransform(transform, input);

    expect(output, 'drops the unused binding').not.toContain('Localization');
    expect(output).toContain('TransactionsOverview');
});

test('dynamic import destructuring is handled', () => {
    const input = `
const { TransactionsOverviewComponentProps, httpPost } = await import('@adyen/adyen-platform-experience-web');

export const x: TransactionsOverviewComponentProps = { core: null as any };
`;
    const { output } = runTransform(transform, input);

    expect(output, 'renames the type').toContain('TransactionsOverviewProps');
    expect(output, 'drops the unused binding').not.toContain('httpPost');
});

test('imports from other packages are ignored', () => {
    const input = `
import { Core } from '@adyen/some-other-package';
import { httpGet } from './local-file';
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});

test('valid V2 imports are untouched', () => {
    const input = `
import {
    AdyenPlatformExperience,
    TransactionsOverview,
    type TransactionsOverviewProps,
    type CustomTheme,
    type TranslationKey,
    type ErrorHandler,
} from '@adyen/adyen-platform-experience-web';
`;
    const { output, changed } = runTransform(transform, input);

    expect(changed).toBe(false);
    expect(output).toBe(input);
});
