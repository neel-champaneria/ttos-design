import {FETCH_MENU_SUCCESS, FETCH_MENU_FAIL} from '../constants';

const initialState = [];

export default function (state = initialState, action) {
    switch (action.type) {
        case FETCH_MENU_SUCCESS:
            return action.payload;

        case FETCH_MENU_FAIL:
            return [...state];

        default:
            return state;
    }
}
