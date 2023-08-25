import getFlagsRecord from '../flagsRecord';
import indexed from '../../shared/indexed';
import { Indexed } from '../../shared/indexed/types';
import { struct } from '../../shared/utils';
import { CalendarBlock, CalendarBlockCellData, CalendarConfigurator } from '../../types';

const getFrameBlock = (configurator: CalendarConfigurator, index: number) => {
    const { config, frame } = configurator;
    const block = frame?.getFrameBlockAtIndex(index);

    if (!block) return;

    const blockStartDate = new Date(`${block.year}-${1 + block.month}-1`);
    const blockStartIndex = block.outer.from;
    const lineWidth = frame?.width ?? 1;

    return indexed<Indexed<CalendarBlockCellData>, CalendarBlock>(
        {
            datetime: { value: blockStartDate.toISOString().slice(0, 10) },
            label: { value: blockStartDate.toLocaleDateString(config.locale, { month: config.minified ? undefined : 'short', year: 'numeric' }) },
            length: { value: Math.ceil(block.outer.units / lineWidth) },
            month: { value: block.month },
            year: { value: block.year },
        },
        index => {
            const indexOffset = index * lineWidth;

            return indexed<CalendarBlockCellData>(lineWidth, index => {
                const [timestamp, flags] = block[index + indexOffset] as (typeof block)[number];
                const date = new Date(timestamp);
                date.setHours(12);

                const ISOString = date.toISOString();

                return struct({
                    datetime: { value: ISOString.slice(0, config.minified ? 7 : 10) },
                    flags: { value: getFlagsRecord(flags) },
                    index: { value: blockStartIndex + index + indexOffset },
                    label: {
                        value: config.minified
                            ? date.toLocaleDateString(config.locale, { month: 'short' })
                            : Number(ISOString.slice(8, 10)).toLocaleString(config.locale),
                    },
                    timestamp: { value: timestamp },
                }) as CalendarBlockCellData;
            });
        }
    );
};

export default getFrameBlock;
