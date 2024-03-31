import cx from 'classnames';
import './SegmentedControl.scss';

interface SegmentedControlProps<T> {
    classNameModifiers?: string[];
    selectedValue: T;
    disabled?: boolean;
    options: Array<{ label: string; value: T; htmlProps?: any }>;
    onChange(value: T, event: MouseEvent): void;
}

function SegmentedControl<T>({ classNameModifiers = [], selectedValue, disabled = false, options, onChange }: SegmentedControlProps<T>) {
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <div
            className={cx(
                'adyen-pe-segmented-control',
                { 'adyen-pe-segmented-control--disabled': disabled },
                ...classNameModifiers.map(modifier => `adyen-pe-segmented-control--${modifier}`)
            )}
            role="group"
        >
            {options.map(({ label, value, htmlProps }) => (
                <button
                    disabled={disabled}
                    key={value}
                    onClick={(event: MouseEvent) => onChange(value, event)}
                    className={cx('adyen-pe-segmented-control-segment', {
                        'adyen-pe-segmented-control-segment--selected': selectedValue === value,
                    })}
                    type="button"
                    {...htmlProps}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default SegmentedControl;
