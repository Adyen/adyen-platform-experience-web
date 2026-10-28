import { useId, useState } from 'react';
import { ON, isOn, toList } from './controls';
import type { ChoiceControl, Control, ControlSection, ControlValues, TextControl, ToggleControl } from './types';

interface PropsPanelProps {
    sections: readonly ControlSection[];
    values: ControlValues;
    onChange: (control: Control, value: string) => void;
}

interface FieldProps<T extends Control = Control> {
    control: T;
    value: string;
    onChange: (value: string) => void;
}

const useFieldIds = (hint?: string) => {
    const id = useId();
    return { id, hintId: hint ? `${id}-hint` : undefined };
};

const Hint = ({ id, text }: { id?: string; text?: string }) =>
    id && text ? (
        <p id={id} className="props-panel__hint">
            {text}
        </p>
    ) : null;

const ControlLabel = ({ control }: { control: Control }) => (
    <span className="props-panel__label">
        <code>{control.label}</code>
        {control.remount && (
            <span className="props-panel__badge" title="Changing this prop remounts the component">
                {'remounts'}
            </span>
        )}
    </span>
);

const TextField = ({ control, value, onChange }: FieldProps<TextControl>) => {
    const hint = [control.hint, 'Press Enter to apply.'].filter(Boolean).join(' ');
    const { id, hintId } = useFieldIds(hint);
    const [draft, setDraft] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);

    if (syncedValue !== value) {
        setSyncedValue(value);
        setDraft(value);
    }

    const commit = () => onChange(draft.trim());

    return (
        <div className="props-panel__field">
            <label htmlFor={id}>
                <ControlLabel control={control} />
            </label>
            <input
                id={id}
                className="props-panel__input props-panel__input--mono"
                type="text"
                value={draft}
                placeholder={control.placeholder}
                spellCheck={false}
                autoComplete="off"
                aria-describedby={hintId}
                onChange={event => setDraft(event.target.value)}
                onBlur={commit}
                onKeyDown={event => event.key === 'Enter' && commit()}
            />
            <Hint id={hintId} text={hint} />
        </div>
    );
};

const ToggleField = ({ control, value, onChange }: FieldProps<ToggleControl>) => {
    const { id, hintId } = useFieldIds(control.hint);

    return (
        <div className="props-panel__field">
            <div className="props-panel__toggle">
                <label htmlFor={id}>
                    <ControlLabel control={control} />
                </label>
                <input
                    id={id}
                    className="props-panel__switch"
                    type="checkbox"
                    role="switch"
                    checked={isOn(value)}
                    aria-describedby={hintId}
                    onChange={event => onChange(event.target.checked ? ON : '')}
                />
            </div>
            <Hint id={hintId} text={control.hint} />
        </div>
    );
};

const RadioField = ({ control, value, onChange }: FieldProps<ChoiceControl>) => {
    const { id, hintId } = useFieldIds(control.hint);

    return (
        <fieldset className="props-panel__field props-panel__fieldset" aria-describedby={hintId}>
            <legend className="props-panel__legend">
                <ControlLabel control={control} />
            </legend>
            <div className="props-panel__segmented">
                {control.options.map(option => (
                    <label key={option.value} className="props-panel__segment">
                        <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
            <Hint id={hintId} text={control.hint} />
        </fieldset>
    );
};

const CheckboxesField = ({ control, value, onChange }: FieldProps<ChoiceControl>) => {
    const { hintId } = useFieldIds(control.hint);
    const selected = new Set(toList(value));

    const toggle = (optionValue: string) => {
        if (selected.has(optionValue)) selected.delete(optionValue);
        else selected.add(optionValue);
        onChange(
            control.options
                .filter(option => selected.has(option.value))
                .map(option => option.value)
                .join(',')
        );
    };

    return (
        <fieldset className="props-panel__field props-panel__fieldset" aria-describedby={hintId}>
            <legend className="props-panel__legend">
                <ControlLabel control={control} />
            </legend>
            <div className="props-panel__segmented">
                {control.options.map(option => (
                    <label key={option.value} className="props-panel__segment">
                        <input type="checkbox" value={option.value} checked={selected.has(option.value)} onChange={() => toggle(option.value)} />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
            <Hint id={hintId} text={control.hint} />
        </fieldset>
    );
};

const SelectField = ({ control, value, onChange }: FieldProps<ChoiceControl>) => {
    const { id, hintId } = useFieldIds(control.hint);

    return (
        <div className="props-panel__field">
            <label htmlFor={id}>
                <ControlLabel control={control} />
            </label>
            <select id={id} className="props-panel__input" value={value} aria-describedby={hintId} onChange={event => onChange(event.target.value)}>
                {control.options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <Hint id={hintId} text={control.hint} />
        </div>
    );
};

const ControlField = ({ control, value, onChange }: FieldProps) => {
    switch (control.type) {
        case 'text':
            return <TextField control={control} value={value} onChange={onChange} />;
        case 'toggle':
            return <ToggleField control={control} value={value} onChange={onChange} />;
        case 'radio':
            return <RadioField control={control} value={value} onChange={onChange} />;
        case 'select':
            return <SelectField control={control} value={value} onChange={onChange} />;
        case 'checkboxes':
            return <CheckboxesField control={control} value={value} onChange={onChange} />;
    }
};

export const PropsPanel = ({ sections, values, onChange }: PropsPanelProps) => (
    <>
        {sections.map(section => (
            <details key={section.title} className="props-panel__section" open>
                <summary className="props-panel__summary">{section.title}</summary>
                <div className="props-panel__fields">
                    {section.controls.map(control => (
                        <ControlField
                            key={control.key}
                            control={control}
                            value={values[control.key] ?? ''}
                            onChange={value => onChange(control, value)}
                        />
                    ))}
                </div>
            </details>
        ))}
    </>
);
