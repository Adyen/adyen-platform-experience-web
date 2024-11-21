import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '../../../../../constants';
import { GRANT_ACTION_CLASS_NAMES } from './constants';
import { GrantActionProps } from './types';
import './GrantAction.scss';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';
import { useAuthContext } from '../../../../../core/Auth';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useFetch } from '../../../../../hooks/useFetch';

export const GrantAction: FunctionalComponent<GrantActionProps> = ({ action, offerExpiresAt }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const { signToSActionDetails } = useAuthContext().endpoints;

    const fetchCallback = useCallback(async () => {
        if (action.type === 'signToS') {
            return signToSActionDetails?.(EMPTY_OBJECT, {
                query: {
                    // To always get the top level href (useful when component is rendered inside an iframe)
                    redirectUrl: window.top?.location.href || window.location.href,
                    locale: i18n.locale,
                },
            });
        }
    }, [action, i18n.locale, signToSActionDetails]);

    const { data, isFetching } = useFetch({
        fetchOptions: useMemo(() => ({ enabled: !!signToSActionDetails }), [signToSActionDetails]),
        queryFn: fetchCallback,
    });

    return (
        <Alert
            key={action.type}
            className={GRANT_ACTION_CLASS_NAMES.base}
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
            {...(data?.url
                ? {
                      description: (
                          <Button className={GRANT_ACTION_CLASS_NAMES.button} href={data.url} disabled={isFetching}>
                              {i18n.get('capital.goToTermsAndConditions')}
                          </Button>
                      ),
                  }
                : {})}
        />
    );
};
