import {LIST_RESTAURANT_ORDER_FAIL, LIST_RESTAURANT_ORDER_SUCCESS, UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN} from '../constants';

const initialState = {orders: [], total: 0};

export default function (state = initialState, action) {
    switch (action.type) {
        case LIST_RESTAURANT_ORDER_SUCCESS:
            return action.payload;
        case LIST_RESTAURANT_ORDER_FAIL:
            return state;
        case UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN:
            return action.payload;
        default:
            return state;
    }
}
