import cx from 'classnames';
import { TagProps, TagVariant } from './types';
import './Tag.scss';
import { memo } from 'preact/compat';
export const Tag = memo(({ variant = TagVariant.DEFAULT, label }: TagProps) => {
    return (
        <div
            className={cx('adyen-fp-tag', {
                'adyen-fp-tag--success': variant === TagVariant.SUCCESS,
                'adyen-fp-tag--default': variant === TagVariant.DEFAULT,
                'adyen-fp-tag--warning': variant === TagVariant.WARNING,
                'adyen-fp-tag--error': variant === TagVariant.ERROR,
            })}
        >
            {label}
        </div>
    );
});
