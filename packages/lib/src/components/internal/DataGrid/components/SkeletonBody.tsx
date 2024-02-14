import cx from 'classnames';
import '../DataGrid.scss';
import useCoreContext from '@src/core/Context/useCoreContext';
import { DataGridProps } from '@src/components/internal/DataGrid/types';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import emptyTableIcon from '../../../../images/no-data-female.svg';
import { breakTranslationsLines } from '@src/core/Localization/utils';

const SkeletonBody = ({
    columnsNumber,
    loading,
    emptyTableMessage,
}: {
    columnsNumber: number;
    loading: boolean;
    emptyTableMessage?: DataGridProps<any, any, any, any>['emptyTableMessage'];
}) => {
    const rows = Array.from({ length: 10 }, (_, index) => index);
    const columns = Array.from({ length: columnsNumber }, (_, index) => index);
    const { i18n } = useCoreContext();
    return (
        <>
            {rows.map((_, i) => (
                <tr className="adyen-fp-data-grid__row" key={`adyen-fp-data-grid-skeleton-row-${i}`}>
                    {columns.map((_, index) => (
                        <td key={`adyen-fp-data-grid-skeleton-cell-${index}`} className="adyen-fp-data-grid__cell adyen-fp-data-grid__skeleton-cell">
                            <span
                                className={cx('adyen-fp-data-grid__skeleton-cell-content', {
                                    'adyen-fp-data-grid__skeleton-cell-content--loading': loading,
                                })}
                            ></span>
                        </td>
                    ))}
                </tr>
            ))}
            {!loading && (
                <div className="adyen-fp-data-grid__empty-message">
                    <picture>
                        <source type="image/svg+xml" srcSet={emptyTableIcon} />

                        <img srcSet={emptyTableIcon} alt={i18n.get('thereAreNoResults')} />
                    </picture>
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get(emptyTableMessage?.title ?? 'thereAreNoResults')}</Typography>
                    {emptyTableMessage?.message && <span>{breakTranslationsLines(i18n.get(emptyTableMessage.message))}</span>}
                </div>
            )}
        </>
    );
};

export default SkeletonBody;
