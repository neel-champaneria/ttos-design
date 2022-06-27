import {
  paymentGatewayProviderList,
  ADD_TO_CART,
  MODIFY_ITEM_FROM_CART,
  CHECK_OUT,
  CHECK_OUT_FAIL,
  CHECK_OUT_SUCCESS,
  DECREASE_QUANTITY_FROM_CART,
  INCREASE_QUANTITY_FROM_CART,
  REMOVE_FROM_CART,
  CHECK_OUT_ORDER_STATUS,
  CHECK_OUT_ORDER_STATUS_TIMEOUT,
  CLEAN_CART,
  UPDATE_ORDER_STATUS_TIMEOUT,
  SAVE_ORDERING_INFO_TO_CART,
  APP_IS_LOADING,
  CARD_DELIVERY,
  CARD_PICKUP,
  CLEAR_CHECKOUT_RESPONSE,
} from "../constants";
import {
  checkoutService,
  checkoutTTOSService,
  fomoPaymentProcessService,
  orderStatusService,
  stripePaymentProcessService,
} from "../services/OrderingService";
import { loadStripe } from "@stripe/stripe-js";
import Router from "next/router";

export const addToCartAction = (orderingItem) => {
  return (dispatch, getState) => {
    let state = getState();
    dispatch({
      type: ADD_TO_CART,
      payload: orderingItem,
    });
  };
};

export const modifyItemInCart = (orderingItem) => {
  return (dispatch, getState) => {
    let state = getState();
    dispatch({
      type: MODIFY_ITEM_FROM_CART,
      payload: orderingItem,
    });
  };
};

const onStripePayment = async (paymentProvider, checkoutResponse) => {
  let publicKey = "";

  paymentGatewayProviderList.map((itm) => {
    if (paymentProvider[itm.value.toUpperCase()]) {
      publicKey = paymentProvider[itm.value.toUpperCase()].publicKey;
    }
  });

  const stripePromise = loadStripe(publicKey);
  const stripe = await stripePromise;
  const transactionId = checkoutResponse && checkoutResponse?.id;
  const stripeSessionRes = await stripePaymentProcessService({
    id: transactionId,
  });
  let stripeResult;

  console.log("stripe ===>", stripe);
  console.log("stripeSessionRes ===>", stripeSessionRes);

  // When the customer clicks on the button, redirect them to Checkout.
  if (stripeSessionRes.status) {
    stripeResult = await stripe.redirectToCheckout({
      sessionId: stripeSessionRes.jsonData.sessionId,
    });
  } else {
  }

  if (stripeResult?.error) {
    // If `redirectToCheckout` fails due to a browser or network
    // error, display the localized error message to your customer
    // using `result.error.message`.
    console.log("stripeResult error ===>", stripeResult);
  }
};

const stripePaymentFromOrderPage = async (
  paymentProvider,
  checkoutResponse
) => {};

/* const onFomoPayment = async (checkoutResponse) => {
  const transactionId = checkoutResponse && checkoutResponse?.id;
  const fomoRes = await fomoPaymentProcessService({ id: transactionId });
  console.log("onFomoPayment fomoRes ===>", fomoRes);

  if (fomoRes.status) {
    await Router.push(fomoRes.jsonData.url);
  } else {
  }
}; */

export const checkOutTTOSAction = (data, qrId) => {
  return async (dispatch, getState) => {
    let state = getState();
    const restaurant = { ...state.resReducer };
    const configs = { ...state.appReducer };
    let paymentProviderStr = restaurant?.paymentProvider || "{}";
    let paymentProvider = JSON.parse(paymentProviderStr);
    let qrConfig = configs.qrConfig;
    dispatch({
      type: CHECK_OUT,
    });

    dispatch({ type: APP_IS_LOADING, payload: true });

    const resp = await checkoutTTOSService(data, qrId);

    if (resp.status) {
      /* if (data.paymentMethod === "PPO") {
        if (resp.orderAccepted && !qrConfig.isPAM) {
          localStorage.setItem("checkoutTime", -1);
          const paymentProviderName = Object.keys(paymentProvider)[0];
          if (paymentProviderName == "STRIPE") {
            onStripePayment(paymentProvider, resp.jsonData);
          } else if (paymentProviderName == "FOMOPAY") {
            onFomoPayment(resp.jsonData);
          }
        }
      } else {
        localStorage.setItem("checkoutTime", new Date().getTime());
      } */

      dispatch({
        type: CHECK_OUT_SUCCESS,
        payload: resp.jsonData,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });
      return resp;
    } else {
      dispatch({
        type: CHECK_OUT_FAIL,
        payload: resp,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });
      return resp;
    }
  };
};

export const checkoutAction = () => {
  return async (dispatch, getState) => {
    let state = getState();
    const restaurant = { ...state.resReducer };
    let paymentProviderStr = restaurant?.paymentProvider || "{}";
    let paymentProvider = JSON.parse(paymentProviderStr);
    let orderingCart = { ...state.orderingCartReducer };

    if (orderingCart?.buyOneGetOneFreePromotions?.length > 0) {
      let tempOrderItems = [...orderingCart.orderItems];
      orderingCart.buyOneGetOneFreePromotions.map((promotion) => {
        promotion.orderItems.map((promoOrderItem) => {
          let tempPromotionOrderItem = {
            ...promoOrderItem,
            sequence: tempOrderItems.length + 1,
          };
          tempOrderItems.push(tempPromotionOrderItem);
        });
      });
      orderingCart = {
        ...orderingCart,
        orderItems: tempOrderItems,
      };
    }

    // console.log('checkoutAction>>>>>>>>>>>>>>>>>', orderingCart);

    dispatch({
      type: CHECK_OUT,
    });

    dispatch({ type: APP_IS_LOADING, payload: true });
    const resp = await checkoutService(orderingCart);
    if (resp.status) {
      // if (orderingCart.paymentMethod !== CARD_DELIVERY || orderingCart.paymentMethod !== CARD_PICKUP) {
      //     localStorage.setItem('checkoutTime', new Date().getTime());
      // } else {
      //     localStorage.setItem('checkoutTime', -1);
      // }

      if (
        orderingCart.paymentMethod === CARD_DELIVERY ||
        orderingCart.paymentMethod === CARD_PICKUP
      ) {
        localStorage.setItem("checkoutTime", -1);
        const paymentProviderName = Object.keys(paymentProvider)[0];
        if (paymentProviderName == "STRIPE") {
          onStripePayment(paymentProvider, resp.jsonData);
        } else if (paymentProviderName == "FOMOPAY") {
          onFomoPayment(resp.jsonData);
        }
      } else {
        localStorage.setItem("checkoutTime", new Date().getTime());
      }

      dispatch({
        type: CHECK_OUT_SUCCESS,
        payload: resp.jsonData,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });

      //continue fetch order status
      // await fetchStatus(dispatch, resp.jsonData.id);
      return resp;
    } else {
      dispatch({
        type: CHECK_OUT_FAIL,
        payload: resp,
      });
      dispatch({ type: APP_IS_LOADING, payload: false });
      return resp;
    }
  };
};

export const fetchStatus = async (dispatch, orderId) => {
  var retry = 3;
  var fetchOk = false;
  while (retry >= 0) {
    const respStatus = await orderStatusService(orderId);
    if (respStatus.status && respStatus.jsonData.status) {
      console.log(
        "fetch transaction status success" + respStatus.jsonData.status
      );
      retry = -1; //stop while
      fetchOk = true;
      if (respStatus.jsonData.status == "TIMEOUT") {
        dispatch({
          type: CHECK_OUT_ORDER_STATUS_TIMEOUT,
        });
      } else {
        dispatch({
          type: CHECK_OUT_ORDER_STATUS,
          payload: respStatus.jsonData,
        });
      }
      return respStatus;
    } else {
      console.log("fetch transaction status fail: " + retry);
      retry -= 1;
    }
  }

  // will check later
  if (!fetchOk) {
  }
};

export const updateOrderStatusTimeoutAction = (time) => {
  return (dispatch, getState) => {
    let state = getState();
    dispatch({
      type: UPDATE_ORDER_STATUS_TIMEOUT,
      payload: time,
    });
  };
};

export const removeItemFromCartAction = (itemId, sequence) => {
  return (dispatch, getState) => {
    let state = getState();
    dispatch({
      type: REMOVE_FROM_CART,
      payload: { itemId, sequence },
    });
  };
};

export const increaseQuantityFromCartAction = (itemId, sequence) => {
  return (dispatch) => {
    dispatch({
      type: INCREASE_QUANTITY_FROM_CART,
      payload: { itemId, sequence },
    });
  };
};

export const decreaseQuantityFromCartAction = (itemId, sequence) => {
  return (dispatch) => {
    dispatch({
      type: DECREASE_QUANTITY_FROM_CART,
      payload: { itemId, sequence },
    });
  };
};

export const saveOrderingInfoToCartAction = (data) => {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE_ORDERING_INFO_TO_CART,
      payload: data,
    });
  };
};

export const cleanCartAction = () => {
  return (dispatch) => {
    dispatch({ type: CLEAN_CART });
  };
};

export const clearCheckoutResponseAction = () => {
  return (dispatch) => {
    dispatch({ type: CLEAR_CHECKOUT_RESPONSE });
  };
};

export const stripePaymentProcessAction = (data) => {
  return async (dispatch, getState) => {
    const resp = await stripePaymentProcessService(data);
    if (resp.status) {
      return resp;
    } else {
      return resp;
    }
  };
};
