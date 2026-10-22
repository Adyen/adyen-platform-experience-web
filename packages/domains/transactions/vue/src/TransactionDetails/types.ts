import type { UIElementProps } from '@integration-components/core/vue';
import type { TransactionDetailsProps } from '../../../domain/src';

export type TransactionDetailsExternalProps = UIElementProps & TransactionDetailsProps;
export type TransactionDetailsComponentProps = Omit<TransactionDetailsExternalProps, 'core' | 'appearance'>;
