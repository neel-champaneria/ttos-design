import {INCREASE_QUANTITY, DECREASE_QUANTITY, CREATE_ORDERING_ITEM, SET_MODIFIER} from '../constants'

export const createOrderingItemAction = (orderingItem) => {
    return (dispatch, getState) => {
        dispatch({
            type: CREATE_ORDERING_ITEM,
            payload: orderingItem
        });
    };
}

export const increaseQuantityAction = (isServer) => {
    return dispatch => {
        dispatch({
            type: INCREASE_QUANTITY,
            from: isServer ? 'server' : 'client'
        });
    };
}

export const decreaseQuantityAction = (isServer) => {
    return dispatch => {
        dispatch({
            type: DECREASE_QUANTITY,
            from: isServer ? 'server' : 'client'
        });
    };
}

export const setModifierAction = (modifiers) => {
    return (dispatch, getState) => {
        dispatch({
            type: SET_MODIFIER,
            payload: modifiers
        });
    };
}
