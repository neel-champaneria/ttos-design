import { SET_QR_INFO, SET_USER_ID } from "../constants";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_QR_INFO:
      return {
        ...state,
        tableId: action.payload.tableId,
        qrId: action.payload.qrId,
        tableName: action.payload.tableName,
      };

    case SET_USER_ID:
      return {
        ...state,
        userId: action.payload,
      };

    default:
      return state;
  }
};
