import './BaseList.scss';
import { BASE_CLASS } from '@src/components/internal/BaseList/constants';
import { FC } from 'preact/compat';
import { BaseListProps } from '@src/components/internal/BaseList/types';

export const BaseList: FC<BaseListProps> = ({ children }) => {
    return <ul className={BASE_CLASS}>{children}</ul>;
};
