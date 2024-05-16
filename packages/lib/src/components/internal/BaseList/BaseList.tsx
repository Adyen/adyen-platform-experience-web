import './BaseList.scss';
import { BASE_CLASS } from './constants';
import { FC } from 'preact/compat';
import { BaseListProps } from './types';

export const BaseList: FC<BaseListProps> = ({ children }) => {
    return <ul className={BASE_CLASS}>{children}</ul>;
};
