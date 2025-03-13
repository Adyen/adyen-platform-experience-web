import './BaseList.scss';
import { BASE_CLASS } from './constants';
import { FC } from 'preact/compat';
import { BaseListProps } from './types';
import cx from 'classnames';

export const BaseList: FC<BaseListProps> = ({ children, classNames }) => {
    return <ul className={cx(BASE_CLASS, [classNames])}>{children}</ul>;
};
