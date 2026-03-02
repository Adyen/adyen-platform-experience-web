# Scaffolding External Components

External components are public-facing components that extend `UIElement` and are exported from the library.

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
│       └── index.ts
└── hooks/                             # Component-specific hooks (optional)
    └── useComponentSpecificHook.ts
```

## Step 1: Create the Element File

```typescript
// ComponentNameElement.tsx
import { _UIComponentProps, ComponentNameProps, ExternalComponentType } from '../../types';
import UIElement from '../UIElement/UIElement';
import ComponentNameContainer from './components/ComponentNameContainer/ComponentNameContainer';

export class ComponentNameElement extends UIElement<ComponentNameProps> {
    public static type: ExternalComponentType = 'componentName';

    constructor(props: _UIComponentProps<ComponentNameProps>) {
        super(props);
    }

    public componentToRender = () => {
        return <ComponentNameContainer {...this.props} />;
    };
}

export default ComponentNameElement;
```

## Step 2: Define Types

```typescript
// types.ts
export interface ComponentNameProps {
    // Component-specific props
    onSomeCallback?: (data: SomeData) => void;
}
```

Also register in `src/components/types.ts`:

```typescript
export type ExternalComponentType = 'existingComponent' | 'componentName'; // Add your new type

export interface ComponentNameComponentProps {
    // Props interface
}
```

## Step 3: Create the Container

```typescript
// components/ComponentNameContainer/ComponentNameContainer.tsx
import { ExternalUIComponentProps, ComponentNameComponentProps } from '../../../../types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ComponentName } from '../ComponentName/ComponentName';
import './ComponentNameContainer.scss';

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

## Step 4: Create Constants

```typescript
// constants.ts
const BASE_CLASS = 'adyen-pe-component-name';

export const classes = {
    root: BASE_CLASS,
    header: `${BASE_CLASS}__header`,
    content: `${BASE_CLASS}__content`,
    footer: `${BASE_CLASS}__footer`,
} as const;
```

## Step 5: Export from Index

```typescript
// index.ts
export { default as ComponentNameElement } from './ComponentNameElement';
```

Add to `src/components/external/index.ts`:

```typescript
export { ComponentNameElement as ComponentName } from './ComponentName';
```

## Step 6: Add to Main Index

In `src/index.ts`, add the export:

```typescript
export { ComponentName } from './components/external';
```

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

2. Create types from OpenAPI or manually in `src/types/api/`:

```typescript
// src/types/api/models/ComponentName.ts
export interface ComponentNameResponse {
    data: ComponentNameItem[];
    _links: PaginationLinks;
}
```

3. Create a fetch hook:

```typescript
// hooks/useComponentNameData.ts
import useFetch from '../../../../../hooks/useFetch';
import { endpoints } from '../../../../../../endpoints/endpoints';

export const useComponentNameData = (params: Params) => {
    return useFetch({
        url: endpoints().componentName.list,
        params,
    });
};
```

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

### With Forms

For components with forms, use the form system:

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

## Checklist

- [ ] Element file extends `UIElement`
- [ ] Type registered in `src/components/types.ts`
- [ ] Exported from `src/components/external/index.ts`
- [ ] Exported from `src/index.ts`
- [ ] Uses `useCoreContext()` for i18n
- [ ] No hardcoded strings
- [ ] CSS classes use `adyen-pe-` prefix
- [ ] Styles use Bento design tokens
