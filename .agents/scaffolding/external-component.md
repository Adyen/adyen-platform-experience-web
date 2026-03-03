# Scaffolding External Components

External components are public-facing components that extend `UIElement` and are exported from the library.

**Reference component**: `DisputesOverview` — clean, minimal, representative example.

## File Structure

When creating a new external component `ComponentName`, create:

```
src/components/external/ComponentName/
├── index.ts                           # Public export
├── ComponentNameElement.tsx           # UIElement extension (entry point)
├── types.ts                           # Component-specific types
├── constants.ts                       # Constants, CSS classes
├── ComponentName.scss                 # Root styles (optional)
├── utils.ts                           # Utility functions (optional)
├── components/
│   ├── ComponentNameContainer/
│   │   ├── ComponentNameContainer.tsx # Data/logic container
│   │   └── index.ts
│   └── ComponentName/
│       ├── ComponentName.tsx          # Main presentational component
│       ├── ComponentName.scss
│       └── constants.ts
└── hooks/                             # Component-specific hooks (optional)
    └── useComponentSpecificHook.ts
```

---

## Step 1: Create the Element File

**Reference**: `src/components/external/DisputesOverview/DisputesOverviewElement.tsx`

```typescript
// ComponentNameElement.tsx
import { _UIComponentProps, ComponentNameProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import ComponentNameContainer from './components/ComponentNameContainer/ComponentNameContainer';

export class ComponentNameElement extends UIElement<ComponentNameProps> {
    public static type: ExternalComponentType = 'componentName';

    // Optional: set a custom CSS class on the root <section> wrapper
    // this.customClassNames = 'adyen-pe-component-name-component';

    constructor(props: _UIComponentProps<ComponentNameProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <ComponentNameContainer {...this.props} />;
    };
}

export default ComponentNameElement;
```

---

## Step 2: Define Types

**File**: `types.ts` in the component directory

```typescript
// types.ts
export interface ComponentNameProps {
    // Component-specific props
    onSomeCallback?: (data: SomeData) => void;
}
```

**Reference**: `src/components/external/CapitalOverview/types.ts`

Also register in `src/components/types.ts`:

```typescript
export type ExternalComponentType = 'existingComponent' | 'componentName'; // Add your new type

export interface ComponentNameComponentProps {
    // Consumer-facing props interface (if needed for data overview pattern)
}
```

---

## Step 3: Create the Container

**Reference**: `src/components/external/DisputesOverview/components/DisputesContainer/DisputesContainer.tsx`

```typescript
// components/ComponentNameContainer/ComponentNameContainer.tsx
import { ExternalUIComponentProps, ComponentNameComponentProps } from '../../../../types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ComponentName } from '../ComponentName/ComponentName';

const ComponentNameContainer = (props: ExternalUIComponentProps<ComponentNameComponentProps>) => {
    const { i18n } = useCoreContext();

    // Data fetching, state management

    return (
        <div className="adyen-pe-component-name">
            <ComponentName {...props} />
        </div>
    );
};

export default ComponentNameContainer;
```

For data overview components that need balance accounts + error handling:

```typescript
import useBalanceAccounts from '../../../../../hooks/useBalanceAccounts';
import DataOverviewContainer from '../../../../internal/DataOverviewContainer/DataOverviewContainer';

function ComponentNameContainer({ ...props }: ExternalUIComponentProps<ComponentNameComponentProps>) {
    const { balanceAccounts, isBalanceAccountIdWrong, isFetching, error } = useBalanceAccounts(props.balanceAccountId);

    return (
        <DataOverviewContainer
            balanceAccountsError={error}
            className="adyen-pe-component-name-container"
            errorMessage={'componentName.errors.unavailable'}
            isBalanceAccountIdWrong={isBalanceAccountIdWrong}
            onContactSupport={props.onContactSupport}
        >
            <ComponentName {...props} balanceAccounts={balanceAccounts} isLoadingBalanceAccount={isFetching} />
        </DataOverviewContainer>
    );
}
```

---

## Step 4: Create Constants

**Reference**: `src/components/external/DisputesOverview/components/DisputesOverview/constants.ts`

```typescript
// constants.ts
import { BaseEventProperties } from '../../../core/Analytics/analytics/user-events';

const BASE_CLASS = 'adyen-pe-component-name';

export const classes = {
    root: BASE_CLASS,
    header: `${BASE_CLASS}__header`,
    content: `${BASE_CLASS}__content`,
    footer: `${BASE_CLASS}__footer`,
} as const;

// Analytics event properties shared across the component's subcomponents
export const sharedComponentNameAnalyticsEventProperties = {
    componentName: 'componentName' satisfies BaseEventProperties['componentName'],
    category: 'Component name component',
} as const;
```

**Reference**: `src/components/external/CapitalOverview/constants.ts`

---

## Step 5: Export from Index

**File**: `index.ts` in the component directory

```typescript
// index.ts
export { default as ComponentNameElement } from './ComponentNameElement';
```

Add to `src/components/external/index.ts`:

```typescript
export { ComponentNameElement as ComponentName } from './ComponentName';
```

**Reference**: `src/components/external/DisputesOverview/index.ts`, `src/components/external/index.ts`

---

## Step 6: Translations

Add translation keys to `src/assets/translations/en-US.json`:

```json
{
    "componentName.title": "Component Title",
    "componentName.errors.unavailable": "Unable to load data"
}
```

**Never inline string literals in JSX** — always use `i18n.get('key')`.

---

## API Integration

### Adding New Endpoints

1. Add endpoint URL to `endpoints/endpoints.ts`:

```typescript
export const endpoints = () =>
    ({
        // existing endpoints...
        componentName: {
            list: `${baseUrl}/componentName`,
            details: `${baseUrl}/componentName/:id`,
        },
    }) as const;
```

2. Create types from OpenAPI or manually in `src/types/api/models/`:

```typescript
// src/types/api/models/componentName.ts
export interface ComponentNameResponse {
    data: ComponentNameItem[];
    _links: PaginationLinks;
}
```

3. Create a fetch hook using `useFetch` with `queryFn` pattern:

```typescript
// hooks/useComponentNameData.ts
import { useFetch } from '../../../../../hooks/useFetch';
import { useConfigContext } from '../../../../../core/ConfigContext';

export const useComponentNameData = (params: Params) => {
    const { getComponentNameList } = useConfigContext().endpoints;

    return useFetch({
        queryFn: () => getComponentNameList!({}, { query: params }),
        fetchOptions: { enabled: !!getComponentNameList },
    });
};
```

**Reference**: `src/hooks/useFetch.ts`, `src/hooks/useMutation/useMutation.ts`

---

## Component Patterns

### View State Management

For components with multiple views (e.g., list → details → edit):

```typescript
type ViewState = 'List' | 'Details' | 'Edit';

const Container = () => {
    const [viewState, setViewState] = useState<ViewState>('List');
    const [selectedId, setSelectedId] = useState<string>('');

    switch (viewState) {
        case 'List':
            return <ListView onSelect={(id) => { setSelectedId(id); setViewState('Details'); }} />;
        case 'Details':
            return <DetailsView id={selectedId} onBack={() => setViewState('List')} />;
        // ...
    }
};
```

### Analytics Integration

Components track user events via `useAnalyticsContext()`. Common analytics hooks:

```typescript
import useAnalyticsContext from '../../../../../core/Context/analytics/useAnalyticsContext';
import { useLandedPageEvent } from '../../../../../hooks/useAnalytics/useLandedPageEvent';
import { useDurationEvent } from '../../../../../hooks/useAnalytics/useDurationEvent';

const MyComponent = () => {
    const userEvents = useAnalyticsContext();

    // Track page landing
    useLandedPageEvent({ ...sharedAnalyticsProperties });

    // Track time spent on component
    useDurationEvent({ ...sharedAnalyticsProperties });

    // Track user actions
    const handleClick = () => {
        userEvents.trackEvent({ ...sharedAnalyticsProperties, action: 'click', label: 'button-name' });
    };
};
```

**Reference**: `src/components/external/CapitalOverview/components/PreQualifiedIntro.tsx`

### With Forms

For components with forms, use the form system in `src/hooks/form/`:

```typescript
import { useForm, Controller, FormProvider } from '../../../../../hooks/form';

const FormContainer = () => {
    const form = useForm<FormData>({
        defaultValues: { /* ... */ },
    });

    const handleSubmit = async (data: FormData) => {
        // Submit logic
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Controller
                    name="fieldName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <InputText {...field} error={fieldState.error?.message} />
                    )}
                />
            </form>
        </FormProvider>
    );
};
```

For element-level form lifecycle (submit/validate), extend `FormElement` instead of `UIElement`:

```typescript
import { FormElement } from '../FormElement';

export class ComponentNameElement extends FormElement<ComponentNameFormProps> {
    // ...
}
```

**Reference**: `src/components/external/FormElement.tsx`, `src/hooks/form/index.ts`

---

## Mock Data & Storybook

### Mock Data

**File**: `mocks/mock-data/componentName.ts`

```typescript
export const mockComponentNameResponse = {
    data: [
        /* mock items */
    ],
    _links: { next: { href: '' } },
};

export const mockComponentNameEmpty = { data: [], _links: {} };
```

Export from `mocks/mock-data/index.ts`.

### MSW Handlers

**File**: `mocks/mock-server/componentName.ts`

```typescript
import { http, HttpResponse } from 'msw';
import { mockComponentNameResponse, mockComponentNameEmpty } from '../mock-data/componentName';

const defaultHandlers = [http.get('*/componentName', () => HttpResponse.json(mockComponentNameResponse))];

export const COMPONENT_NAME_HANDLERS = {
    default: { handlers: defaultHandlers },
    emptyList: {
        handlers: [http.get('*/componentName', () => HttpResponse.json(mockComponentNameEmpty))],
    },
    internalServerError: {
        handlers: [http.get('*/componentName', () => HttpResponse.json({ status: 500 }, { status: 500 }))],
    },
};
```

Export from `mocks/mock-server/index.ts`.

**Reference**: `mocks/mock-server/disputes.ts` (`DISPUTES_LIST_HANDLERS`)

### Storybook Stories

Create three files:

1. **Component wrapper** — `stories/components/componentName.tsx`

```typescript
import { Meta } from '@storybook/preact';
import { ElementProps } from '../utils/types';
import { ComponentName } from '../../src';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const ComponentNameMeta: Meta<ElementProps<typeof ComponentName>> = {
    title: 'screens/ComponentName',
    argTypes: {
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: { component: ComponentName },
    parameters: { controls: { sort: 'alpha' } },
};
```

2. **Mocked story** — `stories/mocked/componentName.stories.tsx`

```typescript
import { Meta } from '@storybook/preact';
import { ElementProps, ElementStory } from '../utils/types';
import { ComponentName } from '../../src';
import { ComponentNameMeta } from '../components/componentName';
import { COMPONENT_NAME_HANDLERS } from '../../mocks/mock-server/componentName';

const meta: Meta<ElementProps<typeof ComponentName>> = {
    ...ComponentNameMeta,
    title: 'Mocked/Domain/ComponentName',
};

export const Default: ElementStory<typeof ComponentName> = {
    name: 'Default',
    args: { mockedApi: true },
};

export const EmptyList: ElementStory<typeof ComponentName> = {
    name: 'Empty list',
    args: { mockedApi: true },
    parameters: { msw: { ...COMPONENT_NAME_HANDLERS.emptyList } },
};

export default meta;
```

3. **API story** (optional) — `stories/api/componentName.stories.tsx`

```typescript
import { ComponentName } from '../../src';
import { ElementProps, ElementStory, SessionControls } from '../utils/types';
import { EMPTY_SESSION_OBJECT } from '../utils/constants';
import { ComponentNameMeta } from '../components/componentName';
import { Meta } from '@storybook/preact';

const meta: Meta<ElementProps<typeof ComponentName>> = {
    ...ComponentNameMeta,
    title: 'API-connected/Domain/ComponentName',
};

export const Default: ElementStory<typeof ComponentName, SessionControls> = {
    name: 'Default',
    argTypes: { session: { control: 'object' } },
    args: { session: EMPTY_SESSION_OBJECT },
};

export default meta;
```

**Reference**: `stories/components/disputesOverview.tsx`, `stories/mocked/disputesOverview.stories.tsx`

---

## Integration Tests

Create `tests/integration/components/componentName/` with one spec file per scenario:

```typescript
// tests/integration/components/componentName/default.spec.ts
import { test, expect } from '@playwright/test';

test.describe('ComponentName', () => {
    test('should render default state', async ({ page }) => {
        await page.goto('/iframe.html?id=mocked-domain-componentname--default');
        // assertions
    });
});
```

**Reference**: `tests/integration/components/disputesOverview/`

---

## Checklist

- [ ] Element file extends `UIElement` (or `FormElement` for forms)
- [ ] Type registered in `src/components/types.ts` (`ExternalComponentType` union)
- [ ] Exported from `src/components/external/index.ts`
- [ ] Uses `useCoreContext()` for i18n
- [ ] No hardcoded strings in JSX
- [ ] CSS classes use `adyen-pe-` prefix, defined in `constants.ts`
- [ ] Styles use Bento design tokens (no hardcoded colors/spacing)
- [ ] Mock data in `mocks/mock-data/`, handlers in `mocks/mock-server/`
- [ ] Mocked story in `stories/mocked/` with scenario variants
- [ ] Component wrapper in `stories/components/`
- [ ] Translation keys in `src/assets/translations/en-US.json`
- [ ] Integration test specs in `tests/integration/components/`
- [ ] Analytics event properties defined in `constants.ts` (if tracking user events)
- [ ] `pnpm run types:check && pnpm run lint && pnpm run test -- --run`
