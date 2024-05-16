import { AuthContext } from './AuthContext';
import { useContext } from 'preact/hooks';

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
