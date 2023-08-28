import getFlagsRecord from '../flagsRecord';
import indexed from '../../shared/indexed';
import { Indexed } from '../../shared/indexed/types';
import { enumerable, struct } from '../../shared/utils';
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
            datetime: enumerable(blockStartDate.toISOString().slice(0, 10)),
            label: enumerable(blockStartDate.toLocaleDateString(config.locale, { month: config.minified ? undefined : 'short', year: 'numeric' })),
            length: enumerable(Math.ceil(block.outer.units / lineWidth)),
            month: enumerable(block.month),
            year: enumerable(block.year),
        },
        index => {
            const indexOffset = index * lineWidth;

            return indexed<CalendarBlockCellData>(lineWidth, index => {
                const [timestamp, flags] = block[index + indexOffset] as (typeof block)[number];
                const date = new Date(timestamp);
                date.setHours(12);

                const ISOString = date.toISOString();

                return struct({
                    datetime: enumerable(ISOString.slice(0, config.minified ? 7 : 10)),
                    flags: enumerable(getFlagsRecord(flags)),
                    index: enumerable(blockStartIndex + index + indexOffset),
                    label: enumerable(
                        config.minified
                            ? date.toLocaleDateString(config.locale, { month: 'short' })
                            : Number(ISOString.slice(8, 10)).toLocaleString(config.locale)
                    ),
                    timestamp: enumerable(timestamp),
                }) as CalendarBlockCellData;
            });
        }
    );
};

export default getFrameBlock;
