import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { DataGridContextProps } from '../types';

export const DataGridContext = createContext<DataGridContextProps>({} as any);

export const useDataGridContext = () => useContext(DataGridContext);
