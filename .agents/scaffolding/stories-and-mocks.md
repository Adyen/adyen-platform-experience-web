# Stories and Mock Server

This guide covers creating Storybook stories and MSW (Mock Service Worker) handlers for components.

## File Structure

For a component `ComponentName`, create:

```
stories/
├── components/
│   └── componentName.tsx          # Shared story metadata/args
├── mocked/
│   └── componentName.stories.tsx  # Stories with MSW mocks
└── api/
    └── componentName.stories.tsx  # Stories with real API (optional)

mocks/
├── mock-data/
│   └── componentName.ts           # Static mock data
└── mock-server/
    └── componentName.ts           # MSW request handlers
```

## Step 1: Create Mock Data

```typescript
// mocks/mock-data/componentName.ts
import { ComponentNameItem } from '../../src/types/api/models/ComponentName';

export const COMPONENT_NAME_ITEMS: ComponentNameItem[] = [
    {
        id: 'item-001',
        name: 'Sample Item 1',
        status: 'active',
        amount: { value: 10000, currency: 'EUR' },
        createdAt: '2024-01-15T10:30:00Z',
    },
    {
        id: 'item-002',
        name: 'Sample Item 2',
        status: 'pending',
        amount: { value: 25000, currency: 'USD' },
        createdAt: '2024-01-14T14:45:00Z',
    },
    // Add more items for various scenarios
];

export const COMPONENT_NAME_DETAILS = {
    'item-001': {
        id: 'item-001',
        name: 'Sample Item 1',
        // Full details...
    },
};
```

Export from `mocks/mock-data/index.ts`:

```typescript
export * from './componentName';
```

## Step 2: Create MSW Handlers

```typescript
// mocks/mock-server/componentName.ts
import { http, HttpResponse, delay } from 'msw';
import { endpoints } from '../../endpoints/endpoints';
import { COMPONENT_NAME_ITEMS, COMPONENT_NAME_DETAILS } from '../mock-data';

export const componentNameHandlers = [
    // List endpoint
    http.get(endpoints().componentName.list, async ({ request }) => {
        await delay(300); // Simulate network delay

        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit')) || 10;
        const offset = Number(url.searchParams.get('offset')) || 0;

        const data = COMPONENT_NAME_ITEMS.slice(offset, offset + limit);

        return HttpResponse.json({
            data,
            _links: {
                next: offset + limit < COMPONENT_NAME_ITEMS.length ? { href: `?offset=${offset + limit}&limit=${limit}` } : undefined,
            },
        });
    }),

    // Details endpoint
    http.get(endpoints().componentName.details, async ({ params }) => {
        await delay(200);

        const { id } = params;
        const details = COMPONENT_NAME_DETAILS[id as string];

        if (!details) {
            return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return HttpResponse.json(details);
    }),

    // Create/POST endpoint
    http.post(endpoints().componentName.list, async ({ request }) => {
        await delay(500);

        const body = await request.json();

        return HttpResponse.json(
            {
                id: `new-${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString(),
            },
            { status: 201 }
        );
    }),
];
```

Register in `mocks/mock-server/index.ts`:

```typescript
import { componentNameHandlers } from './componentName';

export const handlers = [
    // existing handlers...
    ...componentNameHandlers,
];
```

## Step 3: Create Story Metadata

```typescript
// stories/components/componentName.tsx
import { Meta } from '@storybook/preact';
import { ComponentName } from '../../src';
import { ElementProps } from '../utils/types';
import { enabledDisabledCallbackRadioControls } from '../utils/controls';

export const ComponentNameMeta: Meta<ElementProps<typeof ComponentName>> = {
    argTypes: {
        onRecordSelection: enabledDisabledCallbackRadioControls('onRecordSelection'),
        onContactSupport: enabledDisabledCallbackRadioControls('onContactSupport'),
        hideTitle: { type: 'boolean' },
    },
    args: {
        component: ComponentName,
    },
    parameters: {
        controls: {
            sort: 'alpha',
        },
    },
};
```

## Step 4: Create Mocked Stories

```typescript
// stories/mocked/componentName.stories.tsx
import { ComponentName } from '../../src';
import { ElementProps, ElementStory } from '../utils/types';
import { http, HttpResponse } from 'msw';
import { ComponentNameMeta } from '../components/componentName';
import { Meta } from '@storybook/preact';
import { endpoints } from '../../endpoints/endpoints';
import { COMPONENT_NAME_ITEMS } from '../../mocks/mock-data';

const meta: Meta<ElementProps<typeof ComponentName>> = {
    ...ComponentNameMeta,
    title: 'Mocked/ComponentName',
};

// Default story - uses global MSW handlers
export const Default: ElementStory<typeof ComponentName> = {
    name: 'Default',
    args: { mockedApi: true },
};

// Empty state
export const EmptyState: ElementStory<typeof ComponentName> = {
    name: 'Empty State',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [
                http.get(endpoints().componentName.list, () => {
                    return HttpResponse.json({ data: [], _links: {} });
                }),
            ],
        },
    },
};

// Error state
export const ErrorState: ElementStory<typeof ComponentName> = {
    name: 'Error State',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [
                http.get(endpoints().componentName.list, () => {
                    return HttpResponse.error();
                }),
            ],
        },
    },
};

// Loading state (long delay)
export const LoadingState: ElementStory<typeof ComponentName> = {
    name: 'Loading State',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [
                http.get(endpoints().componentName.list, async () => {
                    await new Promise(resolve => setTimeout(resolve, 999999));
                    return HttpResponse.json({ data: [], _links: {} });
                }),
            ],
        },
    },
};

// Custom data scenario
export const WithManyItems: ElementStory<typeof ComponentName> = {
    name: 'With Many Items',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [
                http.get(endpoints().componentName.list, () => {
                    return HttpResponse.json({
                        data: COMPONENT_NAME_ITEMS,
                        _links: {
                            next: { href: '?offset=10' },
                        },
                    });
                }),
            ],
        },
    },
};

export default meta;
```

## Story Patterns

### Testing Callbacks

```typescript
export const WithCallbacks: ElementStory<typeof ComponentName> = {
    name: 'With Callbacks',
    args: {
        mockedApi: true,
        onRecordSelection: record => {
            console.log('Selected:', record);
        },
    },
};
```

### Testing Custom Translations

```typescript
export const CustomTranslations: ElementStory<typeof ComponentName> = {
    name: 'Custom Translations',
    args: {
        mockedApi: true,
        coreOptions: {
            translations: {
                en_US: {
                    'componentName.title': 'Custom Title',
                    'componentName.empty': 'No items found',
                },
            },
        },
    },
};
```

### Testing Different Locales

```typescript
export const GermanLocale: ElementStory<typeof ComponentName> = {
    name: 'German Locale',
    args: {
        mockedApi: true,
        coreOptions: {
            locale: 'de-DE',
        },
    },
};
```

## Checklist

- [ ] Mock data covers all variations (empty, single, many, edge cases)
- [ ] MSW handlers registered in `mocks/mock-server/index.ts`
- [ ] Story metadata in `stories/components/`
- [ ] Mocked stories in `stories/mocked/`
- [ ] Default, Empty, Error, Loading states covered
- [ ] Callback props testable via argTypes
