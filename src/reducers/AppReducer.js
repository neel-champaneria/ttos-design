import {APP_IS_LOADING, APP_LOAD_CONFIGURATION_SUCCESS, CLOSE_NAVIGATION_DRAWER, TOGGLE_NAVIGATION_DRAWER} from '../constants';
import { currency } from 'currency.js';

const initialState = {
    appIsLoading: false,
    navDrawerOpen: false,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case APP_IS_LOADING:
            return {
                ...state,
                appIsLoading: action.payload
            };
        case APP_LOAD_CONFIGURATION_SUCCESS:
            return {
                ...state,
                ...action.payload
            };
        case TOGGLE_NAVIGATION_DRAWER:
            return {
                ...state,
                navDrawerOpen: !state.navDrawerOpen
            };
        case CLOSE_NAVIGATION_DRAWER:
            return {
                ...state,
                navDrawerOpen: false,
            };
        default:
            return state;
    }
}
