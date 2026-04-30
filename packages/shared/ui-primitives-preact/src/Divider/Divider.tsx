import { FunctionalComponent } from 'preact';
import cx from 'classnames';
import './Divider.scss';
import { DividerProps } from './types';
import { DIVIDER_CLASS_NAMES } from './constants';

export const Divider: FunctionalComponent<DividerProps> = ({ className, variant = 'horizontal' }) => {
    return <hr className={cx(DIVIDER_CLASS_NAMES.base, variant === 'vertical' && DIVIDER_CLASS_NAMES.vertical, className)} />;
};
