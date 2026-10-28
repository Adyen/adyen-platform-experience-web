import { useCallback, useState } from 'react';
import { getDefaultValues } from './controls';
import type { ControlSection } from './types';

export const useControlValues = (sections: readonly ControlSection[]) => {
    const [values, setValues] = useState(() => getDefaultValues(sections));
    const setValue = useCallback((key: string, value: string) => setValues(prev => ({ ...prev, [key]: value })), []);
    const reset = useCallback(() => setValues(getDefaultValues(sections)), [sections]);

    return { values, setValue, reset };
};
