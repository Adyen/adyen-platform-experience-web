import BaseFilter from '../BaseFilter';

export default function TextFilter(props) {
    return (
        <BaseFilter {...props} type={'text'} />
    );
}