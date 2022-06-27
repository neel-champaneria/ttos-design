import {APP_IS_LOADING, LIST_RESTAURANT_ORDER_FAIL, LIST_RESTAURANT_ORDER_SUCCESS, UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN, LIST_WAITING_ORDER_FAIL, LIST_WAITING_ORDER_SUCCESS} from '../constants';
import {changeOrderStatusToDeliveringService, createLalamoveOrderService, exportClientService, exportDataService, listRegularUserWithStatusOrdersService, listResOrdersWithStatusService, listWaitingDeliveryOrderService, getLalamoveQuotationService, cancelLalamoveService, listWaitingOrderService} from '../services/ResService';
import {updateDeliveryDateTimeService} from '../services/OrderingService';
import {checkShowChangeTimeBtn} from '../utils/utils';

export const listResOrdersWithStatusAction = (filter, customerEmail, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listResOrdersWithStatusService(user, filter, customerEmail, page, pageSize);
        if (resp.status) {
            dispatch({
                type: LIST_RESTAURANT_ORDER_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: LIST_RESTAURANT_ORDER_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const listWaitingDeliveryOrderAction = (customerEmail, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listWaitingDeliveryOrderService(user, customerEmail, page, pageSize);
        if (resp.status) {
            dispatch({
                type: LIST_RESTAURANT_ORDER_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: LIST_RESTAURANT_ORDER_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const listRegularUserWithStatusOrdersAction = (filter, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        const minPrepareTime = getState().appReducer?.storeConfig?.minPrepareTime;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listRegularUserWithStatusOrdersService(user, filter, page, pageSize);
        if (resp.status) {
            const tempOrder = checkShowChangeTimeBtn(resp.jsonData.orders, minPrepareTime);
            dispatch({
                type: LIST_RESTAURANT_ORDER_SUCCESS,
                payload: {orders: tempOrder, total: resp.jsonData.total}
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: LIST_RESTAURANT_ORDER_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const updateDeliveryDateTimeAction = (data, filter, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await updateDeliveryDateTimeService(user, data);
        if (resp.status) {
            dispatch(listRegularUserWithStatusOrdersAction(filter, page, pageSize));
            return resp;
        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const updateOrderShowChangeDeliveryTimeBtnAction = (orders, total) => {
    return async (dispatch, getState) => {
        dispatch({
            type: UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN,
            payload: {orders: orders, total: total}
        });

    }
};

export const getLalamoveQuotationAction = (orders, type, deliveryRemark, scheduleAt) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await getLalamoveQuotationService(orders, type, user, deliveryRemark, scheduleAt);

        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const cancelLalamoveAction = (order) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await cancelLalamoveService(order, user);

        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const changeOrderStatusToDeliveringAction = (orders, type) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await changeOrderStatusToDeliveringService(orders, type, user);

        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const createLalamoveOrderAction = (orders, type, deliveryRemark, scheduleAt) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await createLalamoveOrderService(orders, type, user, deliveryRemark, scheduleAt);

        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
        }
    }
};

export const exportDataAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await exportDataService(data, user);
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const exportClientAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await exportClientService(user);
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const listWaitingOrder = (filter, customerEmail, page, pageSize) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listWaitingOrderService(user, filter, customerEmail, page, pageSize);
        if (resp.status) {
            dispatch({
                type: LIST_WAITING_ORDER_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: LIST_WAITING_ORDER_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};