import {APP_IS_LOADING, LIST_RESTAURANT_CUSTOMER_FAIL, LIST_RESTAURANT_CUSTOMER_SUCCESS} from '../constants';
import {listResCustomersService} from '../services/ResService';

export const listResCustomersAction = (filter, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listResCustomersService(user, filter, page, pageSize);
        if (resp.status) {
            dispatch({
                type: LIST_RESTAURANT_CUSTOMER_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
        } else {
            dispatch({
                type: LIST_RESTAURANT_CUSTOMER_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
        }

    }
};
