import { useEffect } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDefenseDocument } from '../../../../../types/api/models/disputes';
import { EMPTY_OBJECT } from '../../../../../utils';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import Select from '../../../../internal/FormFields/Select';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';

export const DefendDisputeReason = () => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, dispute, goBack, setFlowState, setSelectedDefenseReason, selectedDefenseReason, setApplicableDocuments } =
        useDisputeFlow();

    const allowedDefenseReasons = dispute?.dispute?.allowedDefenseReasons;
    const disputePspReference = dispute?.dispute?.pspReference;
    const [isReasonSubmitted, setIsReasonSubmitted] = useState<boolean>(false);

    //TODO: Fix the translations for defend reason
    const defenseReasons: Readonly<{ id: string; name: string }[] | null> = useMemo(
        () =>
            Object.freeze(
                allowedDefenseReasons?.map(reason => ({
                    id: reason,
                    name: i18n.has(`disputes.defenseReason.${reason}`) ? i18n.get(`disputes.defenseReason.${reason}` as TranslationKey) : reason,
                }))
            ) ?? [],
        [i18n, allowedDefenseReasons]
    );

    const selected = useMemo(
        () => (selectedDefenseReason ? defenseReasons.find(reason => reason.id === selectedDefenseReason)?.id : defenseReasons?.[0]?.id ?? null),
        [selectedDefenseReason, defenseReasons]
    );

    const { getApplicableDefenseDocuments } = useConfigContext().endpoints;

    const fetchCallback = useCallback(async () => {
        return getApplicableDefenseDocuments?.(EMPTY_OBJECT, {
            query: {
                defenseReason: selectedDefenseReason!,
            },
            path: {
                disputePspReference: disputePspReference!,
            },
        });
    }, [selectedDefenseReason, disputePspReference, getApplicableDefenseDocuments]);

    const { error, isFetching } = useFetch({
        queryFn: fetchCallback,
        fetchOptions: {
            enabled: isReasonSubmitted,
            onSuccess: useCallback(
                (response: { data: IDisputeDefenseDocument[] } | undefined) => {
                    setIsReasonSubmitted(false);
                    setApplicableDocuments(response?.data ?? null);
                    if (response?.data && response?.data.length > 0) setFlowState('uploadDefenseFilesView');
                },
                [setApplicableDocuments, setIsReasonSubmitted, setFlowState]
            ),
        },
    });

    useEffect(() => {
        setIsReasonSubmitted(false);
    }, [error]);

    const onDefenseReasonSubmit = useCallback(() => {
        if (applicableDocuments?.length) return setFlowState('uploadDefenseFilesView');

        setIsReasonSubmitted(true);
    }, [applicableDocuments, setFlowState]);

    const onChange = useCallback(
        (param: any) => {
            if (selectedDefenseReason !== param.target.value && applicableDocuments?.length) setApplicableDocuments([]);
            if (param?.target?.value) setSelectedDefenseReason(param.target.value);
        },
        [applicableDocuments, selectedDefenseReason, setApplicableDocuments, setSelectedDefenseReason]
    );

    const actionButtons = useMemo(() => {
        return [
            {
                title: i18n.get('dispute.continue'),
                disabled: isReasonSubmitted || isFetching,
                event: onDefenseReasonSubmit,
            },
            {
                title: i18n.get('disputes.goBack'),
                disabled: isReasonSubmitted || isFetching,
                event: goBack,
            },
        ];
    }, [isFetching, isReasonSubmitted, i18n, goBack, onDefenseReasonSubmit]);

    if (!defenseReasons || !selected) {
        return null;
    }

    return (
        <>
            <Select items={defenseReasons} onChange={onChange} selected={selected} />
            <Typography className="adyen-pe-defend-dispute-reason__description" variant={TypographyVariant.BODY}>
                {i18n.get('dispute.selectDefenseReasonDescription')}
            </Typography>
            <Alert
                type={AlertTypeOption.HIGHLIGHT}
                description={i18n.get('dispute.defenseReasonChargebackFeeInformation')}
                variant={AlertVariantOption.TIP}
            />
            <div className={'adyen-pe-defend-dispute__actions'}>
                <ButtonActions actions={actionButtons} />
            </div>
        </>
    );
};
