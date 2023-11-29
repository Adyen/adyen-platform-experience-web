import { AuthContext } from '@src/core/Auth/AuthContext';
import { AuthProviderProps, SESSION_ACTIONS } from '@src/core/Auth/types';
import { toChildArray } from 'preact';
import { useReducer } from 'preact/hooks';

const AuthProvider = ({ sessionToken, clientKey, onSessionCreate, children }: AuthProviderProps) => {
    const modifyAuthState = (state: { sessionToken: string; clientKey: string }, action: { type: SESSION_ACTIONS; payload: string }) => {
        switch (action.type) {
            case SESSION_ACTIONS.SET_SESSION_TOKEN:
                return { ...state, sessionToken: action.payload };
            case SESSION_ACTIONS.SET_CLIENT_KEY:
                return { ...state, clientKey: action.payload };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(modifyAuthState, { sessionToken, clientKey });

    return (
        <AuthContext.Provider value={{ sessionToken: state.sessionToken, clientKey: state.clientKey, onSessionCreate, modifyAuthContext: dispatch }}>
            {toChildArray(children)}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
