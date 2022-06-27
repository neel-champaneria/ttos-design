import {APP_IS_LOADING, LIST_PROMOTION_FAIL, LIST_PROMOTION_SUCCESS} from '../constants';
import {deletePromotionService, listPromotionService, loadPromotionStatService, savePromotionService} from '../services/PromotionService';

export const listPromotionAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listPromotionService(user);
        if (resp.status) {
            dispatch({
                type: LIST_PROMOTION_SUCCESS,
                payload: resp.jsonData,
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: LIST_PROMOTION_FAIL,
                payload: resp,
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
}

export const savePromotionAction = (values) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        console.log('log submit values from action>>>>>>', values);
        const resp = await savePromotionService(values, user);
        if (resp.status) {
            console.log('save promotion success >>>>>>>>>', resp);
            dispatch(listPromotionAction());
            return resp;
        } else {
            console.log('save promotion fail >>>>>>>>>', resp);
            return resp;
        }
    }
};

export const deletePromotionAction = (PromotionId) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await deletePromotionService(PromotionId, user);
        if (resp.status) {
            console.log('delete promotion success >>>>>>>>>', resp);
            dispatch(listPromotionAction());
            return resp;
        } else {
            console.log('delete promotion fail >>>>>>>>>', resp);
            return resp;
        }
    }
};

export const loadPromotionStatAction = (filter) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await loadPromotionStatService(filter, user);
        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;
        }
    }
};
