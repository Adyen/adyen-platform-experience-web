import { AuthContext } from '@src/core/Auth/AuthContext';
import { useContext } from 'preact/hooks';

const useAuthContext = () => useContext(AuthContext);

export default useAuthContext;
