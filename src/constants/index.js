// lalamove delivery provider error
export const ERR_INVALID_PHONE_NUMBER = "Invalid phone number";

// QR
export const SET_QR_INFO = "SET_QR_INFO";
export const GET_QR_INFO = "GET_QR_INFO";
export const SET_USER_ID = "SET_USER_ID";

// user role
export const ROLE_TENANT_CUSTOMER = "ROLE_TENANT_CUSTOMER";
export const ROLE_RES_ADMIN = "ROLE_RES_ADMIN";
export const ROLE_SA = "ROLE_SA";

// checkoutResponse status
export const INIT = "INIT";
export const TIMEOUT = "TIMEOUT";
export const CONFIRMED = "CONFIRMED";
export const REJECTED = "REJECTED";
export const PAYMENT = "PAYMENT";
export const DELIVERY = "DELIVERY";
export const WAITING_DELIVERY = "WAITING_DELIVERY";
export const WAITING_PICKUP = "WAITING_PICKUP";
export const DONE = "DONE";
export const REFUND = "REFUND";
export const ERROR = "ERROR";
export const CHECKOUT_EXCEPTION = "EXCEPTION";
export const HOLD_PAYMENT = "HOLD_PAYMENT";

export const ON_GOING = "ON_GOING";
export const ASSIGNING_DRIVER = "ASSIGNING_DRIVER";
export const PICKED_UP = "PICKED_UP";
export const COMPLETED = "COMPLETED";
export const EXPIRED = "EXPIRED";

// ordering & payment method
export const CARD_PICKUP = "CRP";
export const CARD_DELIVERY = "CRD";
export const CASH_PICKUP = "CAP";
export const CASH_DELIVERY = "COD";
export const CMB_DELIVERY = "CMD";
export const CMB_PICKUP = "CMP";
export const PAY_LAH_DELIVERY = "PLD";
export const PAY_LAH_PICKUP = "PLP";
export const PAY_NOW_DELIVERY = "PND";
export const PAY_NOW_PICKUP = "PNP";

// Action for reducer
export const DELIVERY_SERVICE = "delivery";
export const PICKUP_SERVICE = "pickup";

export const LOGIN_RESET = "LOGIN_RESET";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const REGISTER_SUCCESS = "REGISTER_SUCCESS";
export const REGISTER_FAIL = "REGISTER_FAIL";
export const LOG_OUT = "LOG_OUT";
export const LOAD_PROFILE_SUCCESS = "LOAD_PROFILE_SUCCESS";
export const LOAD_PROFILE_FAIL = "LOAD_PROFILE_FAIL";
export const UPDATE_ACCOUNT_INFO = "UPDATE_ACCOUNT_INFO";
export const REQUEST_RESET_PASSWORD_SUCCESS = "REQUEST_RESET_PASSWORD_SUCCESS";
export const REQUEST_RESET_PASSWORD_FAIL = "REQUEST_RESET_PASSWORD_FAIL";

export const FETCH_MENU_SUCCESS = "FETCH_MENU_SUCCESS";
export const FETCH_MENU_FAIL = "FETCH_MENU_FAIL";

export const CREATE_ORDERING_ITEM = "CREATE_ORDERING_ITEM";
export const INCREASE_QUANTITY = "INCREASE_QUANTITY";
export const DECREASE_QUANTITY = "DECREASE_QUANTITY";
export const SET_MODIFIER = "SET_MODIFIER";

export const ADD_TO_CART = "ADD_TO_CART";
export const CLEAN_CART = "CLEAN_CART";
export const CLEAR_CHECKOUT_RESPONSE = "CLEAR_CHECKOUT_RESPONSE";
export const CLEAN_ALL_CART = "CLEAN_ALL_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const INCREASE_QUANTITY_FROM_CART = "INCREASE_QUANTITY_FROM_CART";
export const DECREASE_QUANTITY_FROM_CART = "DECREASE_QUANTITY_FROM_CART";
export const CHECK_OUT = "CHECK_OUT";
export const CHECK_OUT_SUCCESS = "CHECK_OUT_SUCCESS";
export const CHECK_OUT_FAIL = "CHECK_OUT_FAIL";
export const SAVE_ORDERING_INFO_TO_CART = "SAVE_ORDERING_INFO_TO_CART";
export const DONOT_APPLY_PROMOTION = "DONOT_APPLY_PROMOTION";
export const APPLY_PROMOTION = "APPLY_PROMOTION";
export const ADD_BUY_ONE_GET_ONE_FREE_PROMOTION =
  "ADD_BUY_ONE_GET_ONE_FREE_PROMOTION";
export const REMOVE_BUY_ONE_GET_ONE_FREE_PROMOTION =
  "REMOVE_BUY_ONE_GET_ONE_FREE_PROMOTION";
export const RE_CALCULATE_ORDER_PRICE = "RE_CALCULATE_ORDER_PRICE";
export const CLEAN_REMOVED_PROMOTIONS_ARRAY = "CLEAN_REMOVED_PROMOTIONS_ARRAY";

export const MODIFY_ITEM_FROM_CART = "MODIFY_ITEM_FROM_CART";

export const CHECK_OUT_ORDER_STATUS = "CHECK_OUT_ORDER_STATUS";
export const CHECK_OUT_ORDER_STATUS_TIMEOUT = "CHECK_OUT_ORDER_STATUS_TIMEOUT";
export const UPDATE_ORDER_STATUS_TIMEOUT = "UPDATE_ORDER_STATUS_TIMEOUT";

export const UPLOAD_ITEM_IMAGE_SUCCESS = "UPLOAD_ITEM_IMAGE_SUCCESS";
export const UPLOAD_ITEM_IMAGE_FAIL = "UPLOAD_ITEM_IMAGE_FAIL";
export const UPLOAD_CATEGORY_IMAGE_SUCCESS = "UPLOAD_ITEM_IMAGE_SUCCESS";
export const UPLOAD_CATEGORY_IMAGE_FAIL = "UPLOAD_ITEM_IMAGE_FAIL";

export const SAVE_RES_PROFILE = "SAVE_RES_PROFILE";
export const SAVE_RES_PROFILE_SUCCESS = "SAVE_RES_PROFILE_SUCCESS";
export const SAVE_RES_PROFILE_FAIL = "SAVE_RES_PROFILE_FAIL";
export const LOAD_RES_PROFILE_SUCCESS = "LOAD_RES_PROFILE_SUCCESS";
export const LOAD_RES_PROFILE_FAIL = "LOAD_RES_PROFILE_FAIL";
export const ADD_DELIVERY_ZONE = "ADD_DELIVERY_ZONE";
export const LIST_DELIVERY_ZONE_SUCCESS = "LIST_DELIVERY_ZONE_SUCCESS";
export const LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER =
  "LIST_DELIVERY_ZONE_SUCCESS_FOR_OPEN_USER";
export const LIST_DELIVERY_ZONE_FAIL = "LIST_DELIVERY_ZONE_FAIL";
export const DELETE_ZONE = "DELETE_ZONE";
export const SAVE_ZONE_DATA_SUCCESS = "SAVE_ZONE_DATA_SUCCESS";
export const SAVE_ZONE_DATA_FAIL = "SAVE_ZONE_DATA_FAIL";
export const CURRENT_DELIVERY_ZONE = "CURRENT_DELIVERY_ZONE";
export const UPDATE_CURRENT_DELIVERY_ZONE = "UPDATE_CURRENT_DELIVERY_ZONE";
export const CLEAN_CURRENT_DELIVERY_ZONE = "CLEAN_CURRENT_DELIVERY_ZONE";
export const LIST_RESTAURANT_CUSTOMER_SUCCESS =
  "LIST_RESTAURANT_CUSTOMER_SUCCESS";
export const LIST_RESTAURANT_CUSTOMER_FAIL = "LIST_RESTAURANT_CUSTOMER_FAIL";
export const LIST_RESTAURANT_ORDER_SUCCESS = "LIST_RESTAURANT_ORDER_SUCCESS";
export const LIST_RESTAURANT_ORDER_FAIL = "LIST_RESTAURANT_ORDER_FAIL";
export const UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN =
  "UPDATE_ORDER_SHOW_CHANGE_DELIVERY_TIME_BTN";
export const FETCH_MENU_FOR_ITEM_SETTING_SUCCESS =
  "FETCH_MENU_FOR_ITEM_SETTING_SUCCESS";
export const FETCH_MENU_FOR_ITEM_SETTING_FAIL =
  "FETCH_MENU_FOR_ITEM_SETTING_FAIL";
export const LIST_PROMOTION_SUCCESS = "LIST_PROMOTION_SUCCESS";
export const LIST_PROMOTION_FAIL = "LIST_PROMOTION_FAIL";
export const LIST_ORDER_AHEAD_DAYS_SUCCESS = "LIST_ORDER_AHEAD_DAYS_SUCCESS";

export const APP_LOAD_CONFIGURATION_SUCCESS = "APP_LOAD_CONFIGURATION_SUCCESS";
export const APP_IS_LOADING = "APP_IS_LOADING";
export const TOGGLE_NAVIGATION_DRAWER = "TOGGLE_NAVIGATION_DRAWER";
export const CLOSE_NAVIGATION_DRAWER = "CLOSE_NAVIGATION_DRAWER";

export const LIST_API_KEY_MANAGEMENT_SUCCESS =
  "LIST_API_KEY_MANAGEMENT_SUCCESS";
// Action for reducer

export const LIST_WAITING_ORDER_SUCCESS = "LIST_WAITING_ORDER_SUCCESS";
export const LIST_UPDATE_ORDER_STATUS = "LIST_UPDATE_ORDER_STATUS";
export const LIST_WAITING_ORDER_FAIL = "LIST_WAITING_ORDER_FAIL";

// Pre-defined Array & Object
export const paymentMethodList = [
  {
    title: "Payment at restaurant",
    paymentMethodType: "Cash",
    orderingMethod: "Pickup",
    value: CASH_PICKUP,
  },
  {
    title: "Cash on delivery",
    paymentMethodType: "Cash",
    orderingMethod: "Delivery",
    value: CASH_DELIVERY,
  },
  {
    title: "Online Payment (Credit Card, Paynow)",
    paymentMethodType: "Card",
    orderingMethod: "Pickup",
    value: CARD_PICKUP,
  },
  {
    title: "Online Payment (Credit Card, Paynow)",
    paymentMethodType: "Card",
    orderingMethod: "Delivery",
    value: CARD_DELIVERY,
  },
  {
    title: "Call me back and I'll tell you my card details",
    paymentMethodType: "Call me back and I'll tell you my card details",
    orderingMethod: "Pickup",
    value: CMB_PICKUP,
  },
  {
    title: "Call me back and I'll tell you my card details",
    paymentMethodType: "Call me back and I'll tell you my card details",
    orderingMethod: "Delivery",
    value: CMB_DELIVERY,
  },
  {
    title: "PayLah",
    paymentMethodType: "PayLah",
    orderingMethod: "Pickup",
    value: PAY_LAH_PICKUP,
  },
  {
    title: "PayLah",
    paymentMethodType: "PayLah",
    orderingMethod: "Delivery",
    value: PAY_LAH_DELIVERY,
  },
  {
    title: "PayNow",
    paymentMethodType: "PayNow",
    orderingMethod: "Pickup",
    value: PAY_NOW_PICKUP,
  },
  {
    title: "PayNow",
    value: PAY_NOW_DELIVERY,
    paymentMethodType: "PayNow",
    orderingMethod: "Delivery",
  },
];

export const paymentGatewayProviderList = [
  {
    title: "Stripe",
    value: "stripe",
  },
  {
    title: "FOMO Pay",
    value: "fomopay",
  },
];

export const orderStatuses = [
  {
    title: "Received",
    value: INIT,
  },
  {
    title: "Missed",
    value: TIMEOUT,
  },
  {
    title: "Accepted",
    value: CONFIRMED,
  },
  {
    title: "Rejected",
    value: REJECTED,
  },
  {
    title: "Failed",
    value: CHECKOUT_EXCEPTION,
  },
  {
    title: "Processing",
    value: PAYMENT,
  },
  {
    title: "Waiting Delivery",
    value: WAITING_DELIVERY,
  },
  {
    title: "Waiting Pickup",
    value: WAITING_PICKUP,
  },
  {
    title: "Delivering",
    value: DELIVERY,
  },
  {
    title: "Completed",
    value: DONE,
  },
];

export const orderingMethods = [
  {
    title: "Pickup",
    value: "pickup",
  },
  {
    title: "Delivery",
    value: "delivery",
  },
];

export const exportFormats = [
  {
    title: "Order number",
    value: "id",
  },
  {
    title: "Ordering method",
    value: "ordering_method",
  },
  {
    title: "Customer name",
    value: "customer_name",
  },
  {
    title: "Customer email",
    value: "customer_email",
  },
  {
    title: "Customer phone",
    value: "customer_phone",
  },
  {
    title: "Delivery address",
    value: "delivery_address",
  },
  {
    title: "Latitude",
    value: "delivery_lat",
  },
  {
    title: "Longitude",
    value: "delivery_lng",
  },
  {
    title: "Subtotal",
    value: "sub_total",
  },
  {
    title: "Delivery fee",
    value: "delivery_fee",
  },
  {
    title: "Tax",
    value: "tax",
  },
  {
    title: "Total",
    value: "total",
  },
  {
    title: "Payment method",
    value: "payment_method",
  },
  {
    title: "Confirmed time",
    value: "confirmed_date_time",
  },
  {
    title: "Placed time",
    value: "created_date",
  },
  {
    title: "Delivery time",
    value: "delivery_date_time",
  },
  {
    title: "Fulfillment time",
    value: "fulfillment_date_time",
  },
  {
    title: "Discount",
    value: "discount",
  },
  {
    title: "Outside Delivery Zone",
    value: "outsite_delivery_zone",
  },
];

export const deliveryProviderList = [
  {
    title: "LaLamove",
    value: "lalamove",
  },
];

export const lalamoveServiceTypes = [
  {
    title: "Bike",
    value: "MOTORCYCLE",
  },
  {
    title: "Car",
    value: "CAR",
  },
  {
    title: "1.7m Van",
    value: "MINIVAN",
  },
  {
    title: "2.4m Van",
    value: "VAN",
  },
  // {
  //     title: '10ft Lorry',
  //     value: 'TRUCK330',
  // },
  // {
  //     title: '14ft Lorry',
  //     value: 'TRUCK550',
  // },
];

export const timeSlots = [
  {
    label: "15 minutes",
    value: 15,
  },
  {
    label: "30 minutes",
    value: 30,
  },
  {
    label: "45 minutes",
    value: 45,
  },
  {
    label: "1 hour",
    value: 60,
  },
  {
    label: "1.5 hours",
    value: 90,
  },
  {
    label: "2 hours",
    value: 120,
  },
  {
    label: "3 hours",
    value: 180,
  },
  {
    label: "4 hours",
    value: 240,
  },
  {
    label: "5 hours",
    value: 300,
  },
  {
    label: "6 hours",
    value: 360,
  },
];
