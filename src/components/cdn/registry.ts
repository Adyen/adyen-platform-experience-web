/**
 * CDN Component Registry
 *
 * Maps component names to their prop types and dynamic import loaders for type-safe CDN component loading.
 *
 * IMPORTANT: When adding a new CDN component, add its entry here:
 * 1. Import the component's props type
 * 2. Add the component name and props type to CdnComponentRegistry
 * 3. Add the component's loader function to CDN_COMPONENT_LOADERS
 *
 * Example:
 * ```typescript
 * import type { MyNewComponentProps } from './MyNewComponent';
 *
 * export interface CdnComponentRegistry {
 *     MyNewComponent: MyNewComponentProps;
 *     // ... other components
 * }
 *
 * const CDN_COMPONENT_LOADERS = {
 *     MyNewComponent: () => import('./MyNewComponent'),
 *     // ... other loaders
 * } as const satisfies Record<CdnComponentName, () => Promise<any>>;
 * ```
 */
import type { HelloWorldProps } from './HelloWorld';
import type { PaymentMethodCellProps } from './PaymentMethodCell';
import type { TransactionsExportPopoverProps } from './TransactionsExportPopover';

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface CdnComponentRegistry {
    HelloWorld: HelloWorldProps;
    PaymentMethodCell: PaymentMethodCellProps;
    TransactionsExportPopover: TransactionsExportPopoverProps;
}

export type CdnComponentName = keyof CdnComponentRegistry;

/**
 * Static import loaders for CDN components.
 * These static paths allow Vite to create separate bundles for each component.
 *
 * IMPORTANT: This object must contain loaders for ALL components in CdnComponentRegistry.
 * TypeScript will enforce this via the `satisfies` constraint.
 */
const CDN_COMPONENT_LOADERS = {
    HelloWorld: () => import('./HelloWorld'),
    PaymentMethodCell: () => import('./PaymentMethodCell'),
    TransactionsExportPopover: () => import('./TransactionsExportPopover'),
} as const satisfies Record<CdnComponentName, () => Promise<any>>;

/**
 * Dynamically loads a CDN component using static import paths.
 * Vite will create separate bundles for each component at build time.
 *
 * @returns A promise that resolves to a module with a default export
 */
export const loadCdnComponent = (name: CdnComponentName): Promise<{ default: any }> => (CDN_COMPONENT_LOADERS as any)[name]();
