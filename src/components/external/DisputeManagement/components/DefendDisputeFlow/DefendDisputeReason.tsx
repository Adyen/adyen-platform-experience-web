import { useEffect } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../hooks/useFetch';
import { IDisputeDefenseDocument } from '../../../../../types/api/models/disputes';
import { EMPTY_OBJECT } from '../../../../../utils';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../internal/Alert/types';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import Select from '../../../../internal/FormFields/Select';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { getDefenseReasonContent } from '../../utils';

export const DefendDisputeReason = () => {
    const { i18n } = useCoreContext();
    const { applicableDocuments, dispute, goBack, setFlowState, setSelectedDefenseReason, selectedDefenseReason, setApplicableDocuments } =
        useDisputeFlow();

    const allowedDefenseReasons = dispute?.dispute?.allowedDefenseReasons;
    const disputePspReference = dispute?.dispute?.pspReference;
    const [isReasonSubmitted, setIsReasonSubmitted] = useState<boolean>(false);

    //TODO: Add the translations for defend reason
    const defenseReasons: Readonly<{ id: string; name: string }[] | null> = useMemo(
        () =>
            Object.freeze(
                allowedDefenseReasons?.map(reason => ({
                    id: reason,
                    name: getDefenseReasonContent(i18n, reason)?.title ?? reason,
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
                title: i18n.get('disputes.defend.continue'),
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

    const [showAlert, setShowAlert] = useState(true);
    const closeAlert = useCallback(() => {
        setShowAlert(false);
    }, []);

    const defenseReasonContent = useMemo(() => (selected ? getDefenseReasonContent(i18n, selected) : undefined), [i18n, selected]);

    if (!defenseReasons || !selected) {
        return null;
    }

    return (
        <>
            <div className="adyen-pe-defend-dispute-reason__selector">
                <Typography className="adyen-pe-defend-dispute__reason-description" variant={TypographyVariant.BODY}>
                    {i18n.get('disputes.defend.selectDefenseReason')}
                </Typography>
                <Select items={defenseReasons} onChange={onChange} selected={selected} />
                {defenseReasonContent?.primaryDescriptionItems?.map((description, i) => (
                    <Typography
                        el={TypographyElement.PARAGRAPH}
                        key={`description-${i}`}
                        className="adyen-pe-defend-dispute-reason__description"
                        variant={TypographyVariant.BODY}
                    >
                        {description}
                    </Typography>
                ))}
                {defenseReasonContent?.secondaryDescriptionItems?.length && (
                    <ul className="adyen-pe-defend-dispute-reason__secondary-description-items-container">
                        {defenseReasonContent.secondaryDescriptionItems.map((description, i) => (
                            <li className="adyen-pe-defend-dispute-reason__secondary-description-item" key={`description-item-${i}`}>
                                <Typography
                                    el={TypographyElement.PARAGRAPH}
                                    className="adyen-pe-defend-dispute-reason__description"
                                    variant={TypographyVariant.BODY}
                                >
                                    {description}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {showAlert && (
                <Alert onClose={closeAlert} type={AlertTypeOption.HIGHLIGHT} variant={AlertVariantOption.DEFAULT}>
                    <Typography className={'adyen-pe-alert__description'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide>
                        {i18n.get('disputes.defend.chargebackFeeInformation')}
                    </Typography>
                </Alert>
            )}
            <div className={'adyen-pe-defend-dispute__actions'}>
                <ButtonActions actions={actionButtons} />
            </div>
        </>
    );
};
