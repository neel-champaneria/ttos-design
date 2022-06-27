import { SET_QR_INFO, SET_USER_ID } from "../constants";

export const setQrInfoAction = (qrInfo) => {
  return (dispatch) => {
    dispatch({
      type: SET_QR_INFO,
      payload: qrInfo,
    });
  };
};

export const setUserIdAction = (userId) => {
  return (dispatch) => {
    dispatch({
      type: SET_USER_ID,
      payload: userId,
    });
  };
};
