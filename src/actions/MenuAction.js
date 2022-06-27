import {
  fetchMenuService,
  fetchAppConfigService,
  uploadCategoryImageService,
  saveItemService,
  commentService,
  saveCategoryService,
  saveModifierService,
  saveModifierGroupService,
} from "../services/MenuService";
import {
  APP_IS_LOADING,
  FETCH_MENU_SUCCESS,
  APP_LOAD_CONFIGURATION_SUCCESS,
  UPLOAD_ITEM_IMAGE_SUCCESS,
  UPLOAD_ITEM_IMAGE_FAIL,
  UPLOAD_CATEGORY_IMAGE_FAIL,
  UPLOAD_CATEGORY_IMAGE_SUCCESS,
  FETCH_MENU_FAIL,
  LOAD_RES_PROFILE_SUCCESS,
  LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER,
  LIST_ORDER_AHEAD_DAYS_SUCCESS,
  FETCH_MENU_FOR_ITEM_SETTING_SUCCESS,
  RE_CALCULATE_ORDER_PRICE,
} from "../constants";
// import Money from "../utils/money";
import currency from "currency.js";
import { fetchMenuForItemSettingAction } from "./ResAction";
import { deepClone } from "../utils/utils";
import { Money } from "./../utils/money";

export const fetchMenuAction = (qrId) => {
  return async (dispatch, getState) => {
    let state = getState();

    dispatch({ type: APP_IS_LOADING, payload: true });
    const resp = await fetchMenuService(qrId);

    if (resp.status) {
      dispatch({
        type: FETCH_MENU_SUCCESS,
        payload: resp.jsonData.menu,
      });
      dispatch({
        type: LOAD_RES_PROFILE_SUCCESS,
        payload: resp.jsonData.restaurant,
      });
      dispatch({
        type: LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER,
        payload: resp.jsonData.tenantDeliveryZoneList,
      });
      dispatch({
        type: LIST_ORDER_AHEAD_DAYS_SUCCESS,
        payload: resp.jsonData.orderAheadDays,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });
      return resp;
    } else {
      dispatch({
        type: FETCH_MENU_FAIL,
        payload: resp,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });
      return resp;
    }
  };
};

export const fetchAppConfig = (qrId) => {
  return async (dispatch, getState) => {
    const resp = await fetchAppConfigService(qrId);
    // console.log("fetchAppConfigService>>>>>>>>>>>>>>>>>>>>>>>>>>>", resp);
    if (resp.status) {
      const { storeConfig, taxConfig, promotions, paymentMethod } =
        resp.jsonData;
      Money.init(storeConfig, taxConfig, promotions, undefined, paymentMethod);
      dispatch({ type: RE_CALCULATE_ORDER_PRICE });
      dispatch({
        type: APP_LOAD_CONFIGURATION_SUCCESS,
        payload: resp.jsonData,
      });
    }
    return resp;
  };
};

export const saveItemAction = (category, item) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const { id, image, enable } = item;

    const resp = await saveItemService({ id, image, enable }, user);
    if (resp.status) {
      dispatch({
        type: UPLOAD_ITEM_IMAGE_SUCCESS,
        payload: resp,
      });
      dispatch(fetchMenuForItemSettingAction());
      return resp;
    } else {
      dispatch({
        type: UPLOAD_ITEM_IMAGE_FAIL,
        payload: resp,
      });
      return resp;
    }
  };
};

export const commentAction = (item, comment, commentDate) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const { firstName, lastName, email } = user;
    const { id } = item;
    let userInfo = "";

    if (firstName && lastName) {
      userInfo = `${firstName} ${lastName}`;
    } else {
      userInfo = email;
    }
    const resp = await commentService(
      { itemId: id, comment, commentDate, userInfo },
      user
    );
    if (resp.status) {
      dispatch(fetchMenuAction());
      // console.log("comment resp>>>>>>>>>>>>>>>>>>>", resp);
      return resp;
    } else {
      return resp;
    }
  };
};

export const toggleActiveCommentAction = (item, commentObj) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const { id } = item;

    const resp = await commentService({ ...commentObj, itemId: id }, user);
    if (resp.status) {
      dispatch(fetchMenuForItemSettingAction());
      // console.log("edit comment resp>>>>>>>>>>>>>>>>>>>", resp);
      return resp;
    } else {
      // console.log("edit comment failed resp>>>>>>>>>>>>>>>>>>>", resp);
      return resp;
    }
  };
};

export const uploadCategoryImageAction = (category) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const { id, image } = category;

    const resp = await uploadCategoryImageService({ id, image }, user);
    if (resp.status) {
      dispatch({
        type: UPLOAD_CATEGORY_IMAGE_SUCCESS,
        payload: resp,
      });
      dispatch(fetchMenuForItemSettingAction());
      return resp;
    } else {
      dispatch({
        type: UPLOAD_CATEGORY_IMAGE_FAIL,
        payload: resp,
      });
      return resp;
    }
  };
};

export const saveCategoryAction = (data) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;

    dispatch({ type: APP_IS_LOADING, payload: true });
    const resp = await saveCategoryService(data, user);
    dispatch({ type: APP_IS_LOADING, payload: false });
    if (resp.status) {
      dispatch(fetchMenuForItemSettingAction());
      return resp;
    } else {
      return resp;
    }
  };
};

export const saveModifierAction = (data) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const resReducer = getState().resReducer;

    dispatch({ type: APP_IS_LOADING, payload: true });
    const resp = await saveModifierService(data, user);
    if (resp?.status) {
      const menu = deepClone(resReducer.menu, []);
      const foundCat = menu.find((cat) => cat.id == data.catId);
      const foundItem = foundCat.items.find((item) => item.id == data.itemId);
      const foundModGroup = foundItem.modifierGroupItems.find(
        (itm) => itm.modifierGroup.id == data.modGroupId
      ).modifierGroup;
      const foundModifier = foundModGroup.modifiers.find(
        (itm) => itm.id == data.modifierId
      );
      foundModifier.disableItemList = resp?.jsonData || "";
      dispatch({
        type: FETCH_MENU_FOR_ITEM_SETTING_SUCCESS,
        payload: menu,
      });
    }
    dispatch({ type: APP_IS_LOADING, payload: false });
    return resp;
  };
};

export const saveModifierGroupAction = (data) => {
  return async (dispatch, getState) => {
    const user = getState().userReducer;
    const resReducer = getState().resReducer;

    dispatch({ type: APP_IS_LOADING, payload: true });
    const resp = await saveModifierGroupService(data, user);
    if (resp?.status) {
      const menu = deepClone(resReducer.menu, []);
      const foundCat = menu.find((cat) => cat.id == data.catId);
      const foundItem = foundCat.items.find((item) => item.id == data.itemId);
      const foundModGroup = foundItem.modifierGroupItems.find(
        (itm) => itm.modifierGroup.id == data.modGroupId
      ).modifierGroup;
      foundModGroup.modifiers.forEach((itm) => {
        itm.disableItemList = resp?.jsonData[itm.id] || "";
      });
      dispatch({
        type: FETCH_MENU_FOR_ITEM_SETTING_SUCCESS,
        payload: menu,
      });
    }
    dispatch({ type: APP_IS_LOADING, payload: false });
    return resp;
  };
};
