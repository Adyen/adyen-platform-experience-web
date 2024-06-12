import cx from 'classnames';
import { TagProps, TagVariant } from './types';
import './Tag.scss';
import { memo } from 'preact/compat';
export const Tag = memo(({ variant = TagVariant.DEFAULT, label }: TagProps) => {
    return (
        <div
            className={cx('adyen-pe-tag', {
                'adyen-pe-tag--success': variant === TagVariant.SUCCESS,
                'adyen-pe-tag--default': variant === TagVariant.DEFAULT,
                'adyen-pe-tag--warning': variant === TagVariant.WARNING,
                'adyen-pe-tag--error': variant === TagVariant.ERROR,
                'adyen-pe-tag--primary': variant === TagVariant.WHITE,
            })}
        >
            {label}
        </div>
    );
});
