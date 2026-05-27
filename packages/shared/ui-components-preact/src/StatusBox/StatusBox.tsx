import { JSX } from 'preact';
import cx from 'classnames';
import { memo } from 'preact/compat';
import './StatusBox.scss';
import { Image } from '../Image/Image';
import {
    STATUS_BOX_CLASS,
    STATUS_BOX_DATA_AMOUNT,
    STATUS_BOX_DATA_LABEL,
    STATUS_BOX_DATA_PAY_METHOD,
    STATUS_BOX_DATA_PAY_METHOD_DETAIL,
    STATUS_BOX_DATA_PAY_METHOD_LOGO,
    STATUS_BOX_DATA_PAY_METHOD_LOGO_CONTAINER,
    STATUS_BOX_DATA_TAGS,
} from './constants';
import useStatusBoxData from './useStatusBox';

export type StatusBoxProps = ReturnType<typeof useStatusBoxData> & { tag?: JSX.Element };

export type StatusBoxKeys = keyof StatusBoxProps;

type StatusBoxOptions = { classNames?: { [K in StatusBoxKeys]?: string } };

const StatusBox = ({ tag, amount, paymentMethod, paymentMethodType, date, formattedDate, classNames }: StatusBoxProps & StatusBoxOptions) => {
    return (
        <div className={STATUS_BOX_CLASS}>
            {tag && <div className={STATUS_BOX_DATA_TAGS}>{tag}</div>}

            {amount && <div className={cx(STATUS_BOX_DATA_AMOUNT, classNames?.amount)}>{amount}</div>}

            {paymentMethodType && (
                <div className={STATUS_BOX_DATA_PAY_METHOD}>
                    <div className={STATUS_BOX_DATA_PAY_METHOD_LOGO_CONTAINER}>
                        <Image className={STATUS_BOX_DATA_PAY_METHOD_LOGO} name={paymentMethodType} alt={paymentMethodType} folder={'logos/'} />
                    </div>

                    <div className={STATUS_BOX_DATA_PAY_METHOD_DETAIL}>{paymentMethod}</div>
                </div>
            )}

            {date && formattedDate && (
                <div className={STATUS_BOX_DATA_LABEL}>
                    <time dateTime={date}>{formattedDate}</time>
                </div>
            )}
        </div>
    );
};

export default memo(StatusBox);
