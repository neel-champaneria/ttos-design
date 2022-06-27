import {APP_IS_LOADING, CLEAN_ALL_CART, LOAD_PROFILE_FAIL, LOAD_PROFILE_SUCCESS, LOG_OUT, LOGIN_FAIL, LOGIN_SUCCESS, REGISTER_FAIL, REGISTER_SUCCESS, REQUEST_RESET_PASSWORD_FAIL, REQUEST_RESET_PASSWORD_SUCCESS, UPDATE_ACCOUNT_INFO} from '../constants';
import {
    loadProfileService,
    loginService,
    registerService,
    activateUserService,
    forgotPasswordService,
    setNewPasswordService,
    changePasswordService,
    updateAccountInfoService,
    saveUserAddressService,
    deleteUserAddressService,
    oAuthLoginService,
    validateResetKeyService,
    changeAdminEmailService
} from '../services/UserService';
import jwt from 'jwt-decode';
import Router from 'next/router'
import {LOGIN_RESET} from '../constants/index';
import {savePromotionService} from '../services/PromotionService';
import {saveOrderingInfoToCartAction} from './OrderingCartAction';

export const registerAction = (data) => {
    return async (dispatch, getState) => {
        let state = getState();

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await registerService(data);

        if (resp.status) {
            dispatch({
                type: REGISTER_SUCCESS,
                payload: resp,
            });

            await Router.push('/registerSuccess');
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;

        } else {
            dispatch({
                type: REGISTER_FAIL,
                payload: resp,
            });

            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const loginAction = (data, flow, resp1) => {
    return async (dispatch, getState) => {
        let state = getState();
        let resp;

        // reset dirty state for cart address form when login to automatically fill default address when user login
        // dispatch(saveOrderingInfoToCartAction({
        //     orderingContactFormDirty: false,
        //     orderingMethodAddressFormDirty: false,
        // }));

        if (!flow) {
            dispatch({type: APP_IS_LOADING, payload: true});
            dispatch({type: LOGIN_RESET});
            resp = await loginService(data);
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            if (resp1.access_token) {
                const token_decode = jwt(resp1.access_token);
                // console.log('decode>>>>>>>>>>>>>>>>>>>>>>>>>>',token_decode);
                dispatch({
                    type: LOGIN_SUCCESS,
                    payload: {
                        ...resp1,
                        token_decode,
                    },
                });

                await Router.push('/');
                return resp1;

            } else {
                dispatch({
                    type: LOGIN_FAIL,
                    payload: resp1,
                });
                return resp1;
            }
        }

    }
};

export const oAuthLoginAction = (data) => {
    return async (dispatch, getState) => {
        let state = getState();

        dispatch({type: APP_IS_LOADING, payload: true});
        dispatch({type: LOGIN_RESET});
        const resp = await oAuthLoginService(data);

        if (resp.access_token) {
            const token_decode = jwt(resp.access_token);
            // console.log('decode>>>>>>>>>>>>>>>>>>>>>>>>>>',token_decode);

            dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                    ...resp,
                    token_decode,
                },
            });

            await Router.push('/');
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;

        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            dispatch({
                type: LOGIN_FAIL,
                payload: resp,
            });
            return resp;
        }
    }
};


export const loadProfileAction = (user) => {
    return async (dispatch, getState) => {
        if (user?.access_token) {
            const resp = await loadProfileService(user);
            if (resp.status) {
                dispatch({
                    type: LOAD_PROFILE_SUCCESS,
                    payload: resp.jsonData,
                });
            } else {
                dispatch({
                    type: LOAD_PROFILE_FAIL,
                    payload: resp
                })
            }
        }
    }
};

export const updateAccountInfoAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({
            type: UPDATE_ACCOUNT_INFO,
            payload: data,
        });

        const resp = await updateAccountInfoService(user, data);
        if (resp.status) {
            console.log('update account info success', resp);
            dispatch(loadProfileAction(user));
            return resp;
        } else {
            console.log('update account info fail', resp);
            return resp;
        }

    }
};

export const changeAdminEmailAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await changeAdminEmailService(user, data);
        console.log('changeAdminEmailAction', resp);
        if (resp.status) {
            dispatch({type: APP_IS_LOADING, payload: false});
            if (resp.jsonData) {
                await Router.push('/admin_change_email_success');
                dispatch({type: CLEAN_ALL_CART});
                dispatch({type: LOG_OUT});
            }
            return resp;
        } else {
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }

    }
};

export const saveUserAddressAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await saveUserAddressService(user, data);
        if (resp.status) {
            console.log('save user address success', resp);
            dispatch(loadProfileAction(user));
            return resp;
        } else {
            console.log('save user address fail', resp);
            return resp;
        }

    }
};

export const deleteUserAddressAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        const resp = await deleteUserAddressService(user, data);
        if (resp.status) {
            console.log('delete user address success', resp);
            dispatch(loadProfileAction(user));
            return resp;
        } else {
            console.log('delete user address fail', resp);
            return resp;
        }

    }
};

export const activateUserAction = (key) => {
    return async (dispatch, getState) => {
        return await activateUserService(key);
    }
};

export const forgotPasswordAction = (email) => {
    return async (dispatch, getState) => {

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await forgotPasswordService(email);
        if (resp.status) {
            dispatch({
                type: REQUEST_RESET_PASSWORD_SUCCESS,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            console.log('request reset password fail');
            dispatch({
                type: REQUEST_RESET_PASSWORD_FAIL,
                payload: resp
            });
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const validateResetKeyAction = (data) => {
    return async (dispatch, getState) => {
        const resp = await validateResetKeyService(data);
        return resp;
    }
};

export const setNewPasswordAction = (data) => {
    return async (dispatch, getState) => {

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await setNewPasswordService(data);
        if (resp.status) {
            console.log('Set new password success', resp);
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            console.log('Set new password fail', resp);
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};

export const changePasswordAction = (data) => {
    return async (dispatch, getState) => {
        const user = getState().userReducer;

        dispatch({type: APP_IS_LOADING, payload: true});
        const resp = await changePasswordService(user, data);
        if (resp.status) {
            console.log('Change password success', resp);
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        } else {
            console.log('Change password fail', resp);
            dispatch({type: APP_IS_LOADING, payload: false});
            return resp;
        }
    }
};
