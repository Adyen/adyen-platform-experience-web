# Internal Components Index

Check these components before creating new ones. Located in `src/components/internal/`.

## Form Fields

| Component       | Path                        | Purpose                             |
| --------------- | --------------------------- | ----------------------------------- |
| `InputBase`     | `FormFields/InputBase.tsx`  | Base input with label, error, icons |
| `InputText`     | `FormFields/InputText.tsx`  | Text input (extends InputBase)      |
| `TextArea`      | `FormFields/TextArea.tsx`   | Multi-line text input               |
| `Select`        | `FormFields/Select/`        | Dropdown select                     |
| `Checkbox`      | `Checkbox/`                 | Checkbox with label                 |
| `ToggleSwitch`  | `ToggleSwitch/`             | Toggle switch                       |
| `DatePicker`    | `DatePicker/`               | Date selection                      |
| `CalendarInput` | `FormFields/CalendarInput/` | Calendar date input                 |
| `CurrencyInput` | `FormFields/CurrencyInput/` | Currency amount input               |
| `FileInput`     | `FormFields/FileInput/`     | File upload input                   |
| `SpinButton`    | `SpinButton/`               | Numeric spinner                     |
| `SearchBar`     | `SearchBar/`                | Search input with clear             |
| `FieldError`    | `FormFields/FieldError/`    | Error message display               |

## Buttons & Actions

| Component        | Path                     | Purpose                  |
| ---------------- | ------------------------ | ------------------------ |
| `Button`         | `Button/`                | Primary button component |
| `BaseButton`     | `BaseButton/`            | Unstyled button base     |
| `AnchorButton`   | `AnchorButton/`          | Link styled as button    |
| `Link`           | `Link/`                  | Styled anchor link       |
| `ButtonActions`  | `Button/ButtonActions/`  | Button group             |
| `DownloadButton` | `Button/DownloadButton/` | Download action button   |
| `CopyText`       | `CopyText/`              | Copy to clipboard        |

## Layout & Containers

| Component             | Path                   | Purpose                   |
| --------------------- | ---------------------- | ------------------------- |
| `Card`                | `Card/`                | Content card container    |
| `Modal`               | `Modal/`               | Modal dialog              |
| `Accordion`           | `Accordion/`           | Expandable sections       |
| `ExpandableCard`      | `ExpandableCard/`      | Card with expand/collapse |
| `ExpandableContainer` | `ExpandableContainer/` | Generic expandable        |
| `Divider`             | `Divider/`             | Horizontal divider        |
| `Header`              | `Header/`              | Component header          |
| `Popover`             | `Popover/`             | Popover container         |

## Navigation & Tabs

| Component          | Path                | Purpose                |
| ------------------ | ------------------- | ---------------------- |
| `Tabs`             | `Tabs/`             | Tab navigation         |
| `SegmentedControl` | `SegmentedControl/` | Segmented button group |
| `SecondaryNav`     | `SecondaryNav/`     | Secondary navigation   |
| `Pagination`       | `Pagination/`       | Page navigation        |
| `Stepper`          | `Stepper/`          | Step indicator         |

## Data Display

| Component        | Path              | Purpose              |
| ---------------- | ----------------- | -------------------- |
| `DataGrid`       | `DataGrid/`       | Data table/grid      |
| `StructuredList` | `StructuredList/` | Key-value list       |
| `BaseList`       | `BaseList/`       | Generic list         |
| `Timeline`       | `Timeline/`       | Event timeline       |
| `Tag`            | `Tag/`            | Status/label tag     |
| `StatusBox`      | `StatusBox/`      | Status indicator box |

## Feedback & Status

| Component             | Path                   | Purpose             |
| --------------------- | ---------------------- | ------------------- |
| `Alert`               | `Alert/`               | Alert messages      |
| `InfoBox`             | `InfoBox/`             | Information box     |
| `Spinner`             | `Spinner/`             | Loading spinner     |
| `ProgressBar`         | `ProgressBar/`         | Progress indicator  |
| `Tooltip`             | `Tooltip/`             | Hover tooltip       |
| `ErrorMessageDisplay` | `ErrorMessageDisplay/` | Error state display |

## Media

| Component | Path     | Purpose            |
| --------- | -------- | ------------------ |
| `Icon`    | `Icon/`  | Icon component     |
| `Image`   | `Image/` | Image with loading |
| `Img`     | `Img/`   | Basic image        |

## Data Overview Components

| Component               | Path                     | Purpose         |
| ----------------------- | ------------------------ | --------------- |
| `DataOverviewContainer` | `DataOverviewContainer/` | Overview layout |
| `DataOverviewDetails`   | `DataOverviewDetails/`   | Details panel   |
| `DataOverviewDisplay`   | `DataOverviewDisplay/`   | Display wrapper |
| `DataOverviewError`     | `DataOverviewError/`     | Error state     |

## Filters

| Component   | Path         | Purpose             |
| ----------- | ------------ | ------------------- |
| `FilterBar` | `FilterBar/` | Filter controls bar |

## Specialized

| Component       | Path             | Purpose                  |
| --------------- | ---------------- | ------------------------ |
| `Calendar`      | `Calendar/`      | Calendar display         |
| `Slider`        | `Slider/`        | Range slider             |
| `CapitalSlider` | `CapitalSlider/` | Capital-specific slider  |
| `CapitalHeader` | `CapitalHeader/` | Capital component header |
| `StoreSelector` | `StoreSelector/` | Store selection          |
| `Translation`   | `Translation/`   | Translation component    |
| `Typography`    | `Typography/`    | Text typography          |
| `FormWrappers`  | `FormWrappers/`  | Form layout wrappers     |

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
