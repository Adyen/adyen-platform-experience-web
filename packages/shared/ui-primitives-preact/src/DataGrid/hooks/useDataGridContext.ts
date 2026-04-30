import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { DataGridContextProps } from '../types';
import { EMPTY_OBJECT } from '@integration-components/utils';

export const DataGridContext = createContext<DataGridContextProps>(EMPTY_OBJECT as any);

export const useDataGridContext = () => useContext(DataGridContext);
