import cx from 'classnames';
import { useEffect } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { useFetch } from '../../../../../../hooks/useFetch';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import { IDisputeDefenseDocument } from '../../../../../../types/api/models/disputes';
import { EMPTY_OBJECT } from '../../../../../../utils';
import Alert from '../../../../../internal/Alert/Alert';
import { AlertTypeOption, AlertVariantOption } from '../../../../../internal/Alert/types';
import ButtonActions from '../../../../../internal/Button/ButtonActions/ButtonActions';
import Select from '../../../../../internal/FormFields/Select';
import { SelectChangeEvent } from '../../../../../internal/FormFields/Select/types';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import Typography from '../../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { getDefenseReasonContent } from '../../utils';

const BASE_CLASS = 'adyen-pe-defend-dispute-reason';

const classes = {
    selector: BASE_CLASS + '__selector',
    description: BASE_CLASS + '__description',
    dropdownList: BASE_CLASS + '__dropdown-list',
    dropdownListMobile: BASE_CLASS + '__dropdown-list--mobile',
};

export const DefendDisputeReason = () => {
    const { i18n } = useCoreContext();
    const {
        applicableDocuments,
        dispute,
        goBack,
        setFlowState,
        setSelectedDefenseReason,
        selectedDefenseReason,
        setApplicableDocuments,
        defenseReasonConfig,
    } = useDisputeFlow();

    const allowedDefenseReasons = dispute?.dispute?.allowedDefenseReasons;
    const disputePspReference = dispute?.dispute?.pspReference;
    const [isReasonSubmitted, setIsReasonSubmitted] = useState<boolean>(false);
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);

    //TODO: Add the translations for defend reason
    const defenseReasons: Readonly<{ id: string; name: string }[] | null> = useMemo(
        () =>
            Object.freeze(
                allowedDefenseReasons?.map(reason => ({
                    id: reason,
                    disabled: allowedDefenseReasons.length === 1,
                    name: getDefenseReasonContent(defenseReasonConfig, i18n, reason)?.title ?? reason,
                }))
            ) ?? [],
        [i18n, allowedDefenseReasons, defenseReasonConfig]
    );

    const selected = useMemo(
        () => (selectedDefenseReason ? defenseReasons.find(reason => reason.id === selectedDefenseReason)?.id : (defenseReasons?.[0]?.id ?? null)),
        [selectedDefenseReason, defenseReasons]
    );

    useEffect(() => {
        if (selected) {
            setSelectedDefenseReason(selected);
        }
    }, [selected, isReasonSubmitted]);

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
        (param: SelectChangeEvent) => {
            if (selectedDefenseReason !== param.target.value && applicableDocuments?.length) setApplicableDocuments([]);
            if (param?.target?.value) setSelectedDefenseReason(param.target.value);
        },
        [applicableDocuments, selectedDefenseReason, setApplicableDocuments, setSelectedDefenseReason]
    );

    const actionButtons = useMemo(() => {
        return [
            {
                title: i18n.get('disputes.management.defend.common.actions.continue'),
                disabled: isReasonSubmitted || isFetching,
                event: onDefenseReasonSubmit,
            },
            {
                title: i18n.get('disputes.management.common.actions.goBack'),
                disabled: isReasonSubmitted || isFetching,
                event: goBack,
            },
        ];
    }, [isFetching, isReasonSubmitted, i18n, goBack, onDefenseReasonSubmit]);

    const isRequestForInformation = useMemo(() => dispute?.dispute.type === 'REQUEST_FOR_INFORMATION', [dispute?.dispute.type]);

    const [showAlert, setShowAlert] = useState(!isRequestForInformation);
    const closeAlert = useCallback(() => {
        setShowAlert(false);
    }, []);

    const defenseReasonContent = useMemo(
        () => (selected ? getDefenseReasonContent(defenseReasonConfig, i18n, selected) : undefined),
        [defenseReasonConfig, i18n, selected]
    );

    const defendDisputeLabel = useMemo(
        () =>
            isRequestForInformation
                ? i18n.get('disputes.management.defend.requestForInformation.selectDefenseReason')
                : i18n.get('disputes.management.defend.chargeback.selectDefenseReason'),
        [i18n, isRequestForInformation]
    );

    if (!defenseReasons || !selected) {
        return null;
    }

    return (
        <>
            <div className={classes.selector}>
                <Typography className="adyen-pe-defend-dispute__reason-description" variant={TypographyVariant.BODY}>
                    {defendDisputeLabel}
                </Typography>
                <Select
                    items={defenseReasons}
                    onChange={onChange}
                    selected={selected}
                    aria-label={i18n.get('disputes.management.defend.common.inputs.reasonSelect.a11y.label')}
                    popoverClassNameModifiers={[cx(classes.dropdownList, { [classes.dropdownListMobile]: isMobileContainer })]}
                    fixedPopoverPositioning
                />
                {defenseReasonContent?.primaryDescriptionItems?.map((description, i) => (
                    <Typography
                        el={TypographyElement.PARAGRAPH}
                        key={`description-${i}`}
                        className={classes.description}
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
                <Alert onClose={closeAlert} type={AlertTypeOption.HIGHLIGHT} variant={AlertVariantOption.TIP} closeButton>
                    <Typography className={'adyen-pe-alert__description'} el={TypographyElement.DIV} variant={TypographyVariant.CAPTION} wide>
                        {i18n.get('disputes.management.defend.chargeback.feeInfo')}
                    </Typography>
                </Alert>
            )}
            <div className={'adyen-pe-defend-dispute__actions'}>
                <ButtonActions actions={actionButtons} />
            </div>
        </>
    );
};
