import {LOGIN_SUCCESS, LOGIN_FAIL, REGISTER_SUCCESS, REGISTER_FAIL, LOG_OUT, UPDATE_ACCOUNT_INFO, LOAD_PROFILE_SUCCESS, REQUEST_RESET_PASSWORD_SUCCESS, REQUEST_RESET_PASSWORD_FAIL, LOAD_PROFILE_FAIL} from '../constants';
import Cookies from 'universal-cookie';
import { LOGIN_RESET } from '../constants/index';

const cookies = new Cookies();

const initialState = {
    addresses: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOGIN_RESET:
            return {
                ...state,
                error: null,
                msg: null
            };

        case LOGIN_SUCCESS:
            cookies.set('access_token', action.payload, { path: '/' });
            return action.payload;

        case LOGIN_FAIL:
            return action.payload;

        case REGISTER_SUCCESS:
            return action.payload;

        case REGISTER_FAIL:
            return action.payload;

        case UPDATE_ACCOUNT_INFO:
            return {
                ...state,
                ...action.payload,
            };

        case LOAD_PROFILE_SUCCESS:
            return {
                ...state,
                ...action.payload,
            };

        case LOAD_PROFILE_FAIL:
            return {
                ...state,
                error: action.payload
            };

        case REQUEST_RESET_PASSWORD_SUCCESS:
            return {
                ...action.payload,
                msg: 'Password has been reset. Please check your Email!'
            };

        case REQUEST_RESET_PASSWORD_FAIL:
            return action.payload;

        case LOG_OUT:
            cookies.remove('access_token', { path: '/' });
            return {};

        default:
            // cookies.remove('access_token', { path: '/' });
            return state;
    }
}
