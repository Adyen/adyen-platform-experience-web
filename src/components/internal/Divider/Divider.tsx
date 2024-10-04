import { FunctionalComponent } from 'preact';
import cx from 'classnames';
import './Divider.scss';
import { DividerProps } from './types';
import { DIVIDER_CLASS_NAMES } from './constants';

export const Divider: FunctionalComponent<DividerProps> = ({ className }) => {
    return <hr className={cx(DIVIDER_CLASS_NAMES.base, className)} />;
};
