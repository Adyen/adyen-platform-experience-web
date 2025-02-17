import { FunctionalComponent } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '../../../../../constants';
import { GRANT_ACTION_CLASS_NAMES } from './constants';
import { GrantActionProps } from './types';
import './GrantAction.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';
import { useEffect } from 'preact/compat';
import { getTopWindowHref, setTopWindowHref } from './utils';

export const GrantAction: FunctionalComponent<GrantActionProps> = ({ action, className, offerExpiresAt }) => {
    const { i18n, updateCore } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const { signToSActionDetails } = useConfigContext().endpoints;
    const [shouldRedirectToToS, setShouldRedirectToToS] = useState(false);

    const fetchCallback = useCallback(async () => {
        if (action.type === 'signToS') {
            return signToSActionDetails?.(EMPTY_OBJECT, {
                query: {
                    redirectUrl: getTopWindowHref(),
                    locale: i18n.locale,
                },
            });
        }
    }, [action, i18n.locale, signToSActionDetails]);

    const { data, isFetching, error } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!signToSActionDetails && shouldRedirectToToS }), [signToSActionDetails, shouldRedirectToToS]),
        queryFn: fetchCallback,
    });

    useEffect(() => {
        const url = data?.url;
        if (url) {
            setTopWindowHref(url);
        }
    }, [data, shouldRedirectToToS]);

    return error ? (
        <Alert
            className={className}
            type={AlertTypeOption.CRITICAL}
            title={i18n.get('somethingWentWrongTryRefreshingOrComeBackLater')}
            description={
                <Button className={GRANT_ACTION_CLASS_NAMES.button} onClick={updateCore}>
                    {i18n.get('refresh')}
                </Button>
            }
        />
    ) : (
        <Alert
            className={className}
            type={AlertTypeOption.WARNING}
            title={`${i18n.get('capital.signTermsAndConditionsToReceiveFunds')}${
                offerExpiresAt
                    ? ` ${i18n.get('capital.thisOfferExpiresOn', {
                          values: {
                              date: dateFormat(offerExpiresAt, DATE_FORMAT_CAPITAL_OVERVIEW),
                          },
                      })}`
                    : ''
            }`}
            description={
                <Button
                    className={GRANT_ACTION_CLASS_NAMES.button}
                    onClick={() => setShouldRedirectToToS(true)}
                    disabled={isFetching}
                    state={isFetching ? 'loading' : undefined}
                >
                    {i18n.get('capital.goToTermsAndConditions')}
                </Button>
            }
        />
    );
};
