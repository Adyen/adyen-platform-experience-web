import { ForwardedRef, forwardRef } from 'preact/compat';
import { ListBoxProps } from '../types';

const ListBox = forwardRef(
    ({ cursor, listClassName, optionClassName, listeners, render, state, ...props }: ListBoxProps, ref: ForwardedRef<HTMLDivElement>) => {
        const { activeIndex, expanded, options } = state;

        return (
            <div {...props} ref={ref} role="listbox" {...listeners}>
                {expanded && (
                    <ul className={listClassName}>
                        {options.map((option, index) => (
                            <li
                                ref={cursor}
                                key={option}
                                role="option"
                                data-index={index}
                                className={optionClassName}
                                aria-selected={index === activeIndex}
                            >
                                {render(option, index, state) ?? option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
);

export default ListBox;
