import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
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
    const disputeId = dispute?.dispute?.pspReference;
    const [isFetching, setIsFetching] = useState<boolean>(false);

    //TODO: Fix the translations for defend reason
    const defenseReasons: Readonly<{ id: string; name: string }[] | null> = useMemo(
        () =>
            Object.freeze(
                allowedDefenseReasons?.map(reason => ({
                    id: reason,
                    name: i18n.has(`defendReason.${reason}`) ? i18n.get(`defendReason.${reason}` as TranslationKey) : reason,
                }))
            ) ?? [],
        [i18n, allowedDefenseReasons]
    );

    const selected = useMemo(
        () => (selectedDefenseReason ? defenseReasons.find(reason => reason.id === selectedDefenseReason)?.id : defenseReasons?.[0]?.id ?? null),
        [selectedDefenseReason, defenseReasons]
    );

    const { getApplicableDefenseDocuments } = useConfigContext().endpoints;

    const getApplicableDocumentsMutation = useMutation({
        queryFn: getApplicableDefenseDocuments,
        options: {
            onSuccess: useCallback(
                ({ data }: { data: IDisputeDefenseDocument[] }) => {
                    setIsFetching(false);
                    setApplicableDocuments(data ?? null);
                    if (data?.length > 0) setFlowState('uploadDefenseFilesView');
                },
                [setApplicableDocuments, setIsFetching, setFlowState]
            ),
        },
    });

    const onDefenseReasonSubmit = useCallback(() => {
        if (applicableDocuments?.length) return setFlowState('uploadDefenseFilesView');

        setIsFetching(true);
        void getApplicableDocumentsMutation.mutate(EMPTY_OBJECT, {
            query: {
                defenseReason: selectedDefenseReason!,
            },
            path: {
                disputePspReference: disputeId!,
            },
        });
    }, [applicableDocuments, disputeId, getApplicableDocumentsMutation, setFlowState, selectedDefenseReason]);

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
                disabled: isFetching,
                event: onDefenseReasonSubmit,
            },
            {
                title: i18n.get('disputes.goBack'),
                disabled: isFetching,
                event: goBack,
            },
        ];
    }, [isFetching, i18n, goBack, onDefenseReasonSubmit]);

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
