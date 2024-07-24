import { useContext } from 'preact/hooks';
import { CoreContext } from './CoreContext';

const useCoreContext = () => useContext(CoreContext);

export default useCoreContext;
