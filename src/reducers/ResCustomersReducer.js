import {LIST_RESTAURANT_CUSTOMER_SUCCESS, LIST_RESTAURANT_CUSTOMER_FAIL} from '../constants';

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {
        case LIST_RESTAURANT_CUSTOMER_SUCCESS:
            return {...action.payload};
        case LIST_RESTAURANT_CUSTOMER_FAIL:
            return state;
        default:
            return state;
    }
}
