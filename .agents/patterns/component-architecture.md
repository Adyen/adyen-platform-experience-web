# src/components/ — Component Architecture

## Package Identity

All UI components for the library. Split into **external** (public API, consumed by integrators)
and **internal** (reusable UI primitives shared across external components).

## Architecture: Render Chain

External components follow a strict layered architecture:

```
BaseElement → UIElement → {Name}Element → Container → Presentational
```

### 1. BaseElement (`external/BaseElement.ts`)

Abstract base class. Handles mount/unmount/update lifecycle on real DOM nodes.
All external components inherit from this. Provides `mount(domNode)`, `unmount()`, `update(props)`.

### 2. UIElement (`external/UIElement/UIElement.tsx`)

Extends `BaseElement`. Wraps component output in the **provider stack**:

```
ConfigProvider → CoreProvider → AnalyticsProvider → <section> → componentToRender()
```

Provides session, i18n, CDN assets, analytics, and error handling to all descendants.

### 3. {Name}Element (`external/{Name}/{Name}Element.tsx`)

Concrete element class. Sets `static type`, assigns `componentToRender`, and applies
`customClassNames`. Example: `CapitalOverviewElement`, `TransactionsOverviewElement`.

```typescript
// ✅ Pattern: see src/components/external/CapitalOverview/CapitalOverviewElement.tsx
export class CapitalOverviewElement extends UIElement<CapitalOverviewProps> {
    public static type: ExternalComponentType = 'capitalOverview';
    constructor(props) {
        super(props);
        this.componentToRender = () => <CapitalOverview {...this.props} />;
        this.customClassNames = 'adyen-pe-capital-overview-component';
    }
}
```

### 4. Container Components

Fetch data, manage state, wire up hooks. Pass data down to presentational components.
Located in `external/{Name}/components/{Name}Container/` or similar.

### 5. Presentational Components

Pure rendering. Receive data via props, no direct data fetching.
Built from internal UI primitives (`Button`, `DataGrid`, `Modal`, etc.).

## External Components

Each lives in `src/components/external/{Name}/` with this structure:

```
{Name}/
├── {Name}Element.tsx      # Element class (extends UIElement)
├── components/            # Container + presentational components
├── hooks/                 # Component-specific hooks (colocated)
├── constants.ts           # CSS class names + analytics constants
├── types.ts               # Component-specific types
└── index.ts               # Public exports
```

**Current external components** (see `ExternalComponentType` in `src/components/types.ts`):
`capitalOffer`, `capitalOverview`, `disputes`, `disputesManagement`,
`paymentLinkCreation`, `paymentLinkDetails`, `paymentLinksOverview`, `paymentLinkSettings`,
`payouts`, `payoutDetails`, `reports`, `transactions`, `transactionDetails`

## Internal Components

Reusable UI primitives in `src/components/internal/`. Each has its own directory.
**Full index with usage examples**: [internal-components.md](internal-components.md)

**Key components**: `Button`, `DataGrid`, `Modal`, `FilterBar`, `Calendar`, `DatePicker`,
`FormFields`, `Pagination`, `Popover`, `SearchBar`, `Tabs`, `Tag`, `Timeline`, `Tooltip`

```
{Component}/
├── {Component}.tsx        # Component implementation
├── {Component}.scss       # Styles (BEM with adyen-pe- prefix)
├── constants.ts           # CSS class name constants
└── types.ts               # Props/types
```

## CSS Class Naming

All classes use `adyen-pe-` prefix with BEM-like structure:

```typescript
// ✅ Pattern: object map in constants.ts
// See: src/components/external/CapitalOverview/constants.ts
export const CLASS_NAMES = {
    base: 'adyen-pe-component-name',
    title: 'adyen-pe-component-name__title',
    active: 'adyen-pe-component-name--active',
};
```

- **Block**: `adyen-pe-{component}` (e.g., `adyen-pe-capital-overview`)
- **Element**: `adyen-pe-{component}__{element}` (e.g., `adyen-pe-capital-overview__title`)
- **Modifier**: `adyen-pe-{component}--{modifier}` (e.g., `adyen-pe-button--primary`)
- Use `cx()` from `classnames` for conditional class application

## Common Gotchas

- **No raw strings in JSX**: Use `i18n.get()` for all text — see [i18n patterns](i18n.md)
- **Provider access**: Use `useCoreContext()` for i18n, assets, error handling — not direct imports
- **Form components**: Extend `FormElement` (see `external/FormElement.tsx`) for submit/validation lifecycle
- **New external component?** Follow the full scaffolding guide: [external-component.md](../scaffolding/external-component.md).
  Must be added to `ExternalComponentType` in `src/components/types.ts` and exported from `src/components/external/index.ts`

## JIT Find Commands

```bash
rg -n "export class.*Element" src/components/external/       # Element classes
rg -n "componentToRender" src/components/external/            # Render entry points
fd "constants.ts" src/components/                              # CSS class definitions
fd "types.ts" src/components/                                  # Type definitions
```
