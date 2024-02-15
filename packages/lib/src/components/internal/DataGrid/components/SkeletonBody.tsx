import cx from 'classnames';
import '../DataGrid.scss';
import useCoreContext from '@src/core/Context/useCoreContext';
import { DataGridProps } from '@src/components/internal/DataGrid/types';
import emptyTableIcon from '../../../../images/no-data-female.svg';
import { useCallback } from 'preact/hooks';
import { TranslationKey } from '@src/core/Localization/types';
import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';

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

    const renderMessage = useCallback(
        (message: TranslationKey | TranslationKey[]) => {
            if (Array.isArray(message)) {
                return message.map((m, i) =>
                    i === 0 ? (
                        i18n.get(m)
                    ) : (
                        <>
                            <br />
                            {i18n.get(m)}
                        </>
                    )
                );
            }
            return i18n.get(message);
        },
        [i18n]
    );

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
                <ErrorMessageDisplay
                    title={emptyTableMessage?.title ?? 'thereAreNoResults'}
                    message={emptyTableMessage?.message}
                    imageDesktop={emptyTableIcon}
                />
            )}
        </>
    );
};

export default SkeletonBody;
