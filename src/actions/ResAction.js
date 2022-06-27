import {
    LOAD_RES_PROFILE_FAIL, LOAD_RES_PROFILE_SUCCESS, SAVE_RES_PROFILE, SAVE_RES_PROFILE_FAIL, SAVE_RES_PROFILE_SUCCESS,
    ADD_DELIVERY_ZONE, APP_IS_LOADING, LIST_DELIVERY_ZONE_SUCCESS, LIST_DELIVERY_ZONE_FAIL, DELETE_ZONE,
    CLEAN_CURRENT_DELIVERY_ZONE, CURRENT_DELIVERY_ZONE, UPDATE_CURRENT_DELIVERY_ZONE,
    FETCH_MENU_FOR_ITEM_SETTING_SUCCESS, FETCH_MENU_FOR_ITEM_SETTING_FAIL, LIST_API_KEY_MANAGEMENT_SUCCESS
} from '../constants';
import {
    listDeliveryZoneService, loadResProfileService, saveDeliveryZoneService, saveResProfileService,saveSoundService,
    deleteDeliveryZoneService, fetchMenuForItemSettingService, resetResDataService, unlockAPIService, saveProviderService, loadReportService, loadCustomerInsightService, generateOpenAPIKeyService, listOpenAPIKeyService, saveOpenAPIKeyService, deleteOpenAPIKeyService
} from '../services/ResService';
import {useSelector} from 'react-redux';
import {loadPromotionStatService} from '../services/PromotionService';

export const fetchMenuForItemSettingAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await fetchMenuForItemSettingService(user);
        if (resp.status) {
            dispatch({
                type: FETCH_MENU_FOR_ITEM_SETTING_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            dispatch({
                type: FETCH_MENU_FOR_ITEM_SETTING_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const saveResProfileAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        const restaurant = getState().resReducer;

        dispatch({
            type: SAVE_RES_PROFILE,
            payload: data
        });

        data.closeTime = data?.closeTime || '08:00';
        data.openTime = data?.openTime || '23:00';
        data.lat = data?.lat || restaurant?.lat || 1.3611837;
        data.lng = data?.lng || restaurant?.lng || 103.748241;

        const resp = await saveResProfileService({...restaurant, ...data}, user);
        if (resp.status) {
            dispatch({
                type: SAVE_RES_PROFILE_SUCCESS,
                payload: resp
            });

            dispatch(loadResProfileAction());
            return resp;

        } else {
            dispatch({
                type: SAVE_RES_PROFILE_FAIL,
                payload: resp
            });
            return resp;
        }

    }
};

export const saveProviderAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await saveProviderService(data, user);
        if (resp.status) {
            dispatch(loadResProfileAction());
            return resp;
        } else {
            return resp;
        }
    };
};

export const unlockAPIAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await unlockAPIService(user);
        if (resp.status) {
            dispatch(loadResProfileAction());
            return resp;
        } else {
            return resp;
        }
    }
};

export const resetResDataAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await resetResDataService(user);
        console.log('resetResDataAction resp ===>', resp);
        if (resp.status) {
            dispatch(loadResProfileAction());
            return resp;
        } else {
            return resp;
        }
    }
};

export const loadResProfileAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await loadResProfileService(user);
        if (resp.status) {
            dispatch({
                type: LOAD_RES_PROFILE_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;

        } else {
            dispatch({
                type: LOAD_RES_PROFILE_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const saveInfoToResProfileAction = (data) => {
    return async (dispatch, getState) => {
        dispatch({type: LOAD_RES_PROFILE_SUCCESS, payload: data})
    }
}

export const addDeliveryZoneAction = (data) => {
    return async (dispatch, getState) => {
        dispatch({
            type: ADD_DELIVERY_ZONE,
            payload: data
        })
    }
};

export const currentDeliveryZoneAction = (zone) => {
    return async (dispatch, getState) => {
        dispatch({
            type: CURRENT_DELIVERY_ZONE,
            payload: zone,
        })
    }
};

export const updateCurrentDeliveryZoneAction = (type) => {
    return async (dispatch, getState) => {
        const newCurrentZone = getState().resReducer.currentZone;
        newCurrentZone.type = type;
        dispatch({
            type: UPDATE_CURRENT_DELIVERY_ZONE,
            payload: newCurrentZone
        })
    }
};

export const saveZoneDataAction = (values) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const {currentZone = {}} = getState().resReducer;
        let name = values.name || currentZone.name;
        let fee = values.fee || 0;
        let minimum = values.minimum || 0;
        let type = values.type || currentZone.type;
        let enable = values.enable || currentZone.enable;
        currentZone.name = name;
        currentZone.fee = fee;
        currentZone.minimum = minimum;
        currentZone.type = type;
        currentZone.enable = enable;
        currentZone.geoJson = JSON.stringify(currentZone.geoJson);

        const resp = await saveDeliveryZoneService(currentZone, user);
        if (resp) {
            console.log('success', resp);
            dispatch(listDeliveryZoneAction());
        } else {
            console.log('error', resp);
            dispatch(listDeliveryZoneAction());
        }
    }
}

export const deleteZoneAction = (zone) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const {currentZone = {}} = getState().resReducer;
        if (parseInt(currentZone.id || 0) > 0) {
            currentZone.geoJson = JSON.stringify(currentZone.geoJson);
            const resp = await deleteDeliveryZoneService(currentZone, user);
            if (resp) {
                console.log('success', resp);
                dispatch(listDeliveryZoneAction());
            } else {
                console.log('error', resp);
                dispatch(listDeliveryZoneAction());
            }
        } else {
            dispatch({type: DELETE_ZONE, payload: currentZone});
        }
    }
}

export const listDeliveryZoneAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listDeliveryZoneService(user);
        if (resp.status) {
            dispatch({
                type: LIST_DELIVERY_ZONE_SUCCESS,
                payload: resp.jsonData
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            dispatch({type: CLEAN_CURRENT_DELIVERY_ZONE});
            return resp;

        } else {
            dispatch({
                type: LIST_DELIVERY_ZONE_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const loadReportAction = (filter) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await loadReportService(filter, user);
        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;
        }
    }
};

export const loadCustomerInsightAction = (email, dateFrom, dateTo) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await loadCustomerInsightService(email, dateFrom, dateTo, user);
        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp.jsonData;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const listOpenAPIKeyAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await listOpenAPIKeyService(user);
        if (resp.status) {
            dispatch({
                type: LIST_API_KEY_MANAGEMENT_SUCCESS,
                payload: resp.jsonData
            });
        }
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const generateOpenAPIKeyAction = () => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await generateOpenAPIKeyService(user);
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const saveOpenAPIKeyAction = (openApiKeyData) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await saveOpenAPIKeyService(openApiKeyData, user);
        if (resp.status) {
            dispatch(listOpenAPIKeyAction());
        }
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const deleteOpenAPIKeyAction = (apiKey) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await deleteOpenAPIKeyService(apiKey, user);
        if (resp.status) {
            dispatch(listOpenAPIKeyAction());
        }
        dispatch({type: APP_IS_LOADING, payload: false});
        return resp;
    }
};

export const saveSoundAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;
        return await saveSoundService(data, user);
    };
};
