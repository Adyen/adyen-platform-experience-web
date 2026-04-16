# Internal Components Index

Inspect `src/components/internal/` for the current list of available primitives. Check these components before creating new ones.

## Usage Examples

### Button

```typescript
import { Button } from '../internal/Button';

<Button onClick={handleClick} variant="primary" disabled={isLoading}>
    {i18n.get('actions.submit')}
</Button>
```

### Modal

```typescript
import Modal from '../internal/Modal';

<Modal
    isOpen={isOpen}
    onClose={handleClose}
    title={i18n.get('modal.title')}
>
    <ModalContent />
</Modal>
```

### DataGrid

```typescript
import DataGrid from '../internal/DataGrid';

<DataGrid
    columns={columns}
    data={items}
    loading={isLoading}
    onRowClick={handleRowClick}
/>
```

### Alert

```typescript
import Alert from '../internal/Alert';

<Alert type="error" title={i18n.get('error.title')}>
    {i18n.get('error.message')}
</Alert>
```

### Card

```typescript
import Card from '../internal/Card';

<Card title={i18n.get('card.title')}>
    <CardContent />
</Card>
```

## Import Pattern

```typescript
// Direct import
import Button from '../../internal/Button';
import { Button } from '../../internal/Button';

// From index (if exported)
import { Button, Modal, Alert } from '../../internal';
```

## Creating New Internal Components

If you need a component that doesn't exist:

1. Check if an existing component can be extended
2. Create in `src/components/internal/ComponentName/`
3. Include: `ComponentName.tsx`, `ComponentName.scss`, `index.ts`
4. Add tests: `ComponentName.test.tsx`
5. Export from `src/components/internal/index.ts` if widely used
