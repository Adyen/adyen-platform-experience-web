import { ErrorTypes } from '@src/core/Services/requests/utils';
import { useLayoutEffect, useState } from 'preact/hooks';
import getDataset from '../../../core/Services/get-dataset';
import { DataSet } from '../../../core/Services/data-set';
import { PhonePrefixes, PhonePrefixesProps } from './types';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';

function usePhonePrefixes({ allowedCountries, loadingContext, handleError }: PhonePrefixesProps): PhonePrefixes {
    const [loadingStatus, setLoadingStatus] = useState<string>('loading');
    const [phonePrefixes, setPhonePrefixes] = useState<DataSet>([]);

    useLayoutEffect(() => {
        getDataset<{ id: string; prefix: string }[]>('phonenumbers', loadingContext)
            .then(response => {
                const countriesFilter = (country: { id: string }) => allowedCountries.includes(country.id);
                const filteredCountries = allowedCountries.length ? response.filter(countriesFilter) : response;
                const mappedCountries = filteredCountries.map(item => {
                    // Get country flags (magic! - shifts the country code characters to the correct position of the emoji in the unicode space)
                    const codePoints: number[] = item.id
                        .toUpperCase()
                        .split('')
                        .map(char => 127397 + char.charCodeAt(0));

                    // Get flag emoji + space at end (it doesn't work to add spaces in the template literal, below)
                    const flag = String.fromCodePoint ? String.fromCodePoint(...codePoints) + '\u00A0\u00A0' : '';

                    return { id: item.prefix, name: `${flag} ${item.prefix} (${item.id})`, selectedOptionName: `${flag} ${item.prefix}` };
                });

                setPhonePrefixes(mappedCountries || []);
                setLoadingStatus('ready');
            })
            .catch(error => {
                setPhonePrefixes([]);
                setLoadingStatus('ready');
                handleError?.(new AdyenPlatformExperienceError(ErrorTypes.ERROR, error));
            });
    }, []);

    return { phonePrefixes, loadingStatus };
}

export default usePhonePrefixes;
