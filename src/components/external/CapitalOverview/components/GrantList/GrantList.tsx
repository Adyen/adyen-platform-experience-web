import { FunctionalComponent } from 'preact';
import { GrantListProps } from './types';
import { CapitalHeader } from '../../../../internal/CapitalHeader';
import { BaseList } from '../../../../internal/BaseList/BaseList';
import { GrantItem } from '../GrantItem/GrantItem';

export const GrantList: FunctionalComponent<GrantListProps> = ({ grantList, hideTitle }) => {
    return (
        <div>
            <CapitalHeader hideTitle={hideTitle} titleKey={'capital.businessFinancing'} />
            <BaseList>
                {grantList?.map(grant => (
                    <li key={grant.id}>
                        <GrantItem grant={grant} />
                    </li>
                ))}
            </BaseList>
        </div>
    );
};
