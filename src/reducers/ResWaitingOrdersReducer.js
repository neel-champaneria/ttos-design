import {LIST_WAITING_ORDER_FAIL, LIST_WAITING_ORDER_SUCCESS,LIST_UPDATE_ORDER_STATUS} from '../constants';

const initialState = {orders: [], total: 0, updateOrder: null};

export default function (state = initialState, action) {
    switch (action.type) {
        case LIST_WAITING_ORDER_SUCCESS:
            return {
                ...action.payload,
                updateOrder: state.updateOrder
            };
        case LIST_UPDATE_ORDER_STATUS:
            return  {
                ...state,
                updateOrder: action.payload
            };
        case LIST_WAITING_ORDER_FAIL:
            return {
                ...state,
                updateOrder: state.updateOrder
            };
        default:
            return state;
    }
}
