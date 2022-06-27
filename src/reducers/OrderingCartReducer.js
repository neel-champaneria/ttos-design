import {
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
  CLEAN_ALL_CART,
  DONOT_APPLY_PROMOTION,
  APPLY_PROMOTION,
  ADD_BUY_ONE_GET_ONE_FREE_PROMOTION,
  REMOVE_BUY_ONE_GET_ONE_FREE_PROMOTION,
  RE_CALCULATE_ORDER_PRICE,
  CLEAN_REMOVED_PROMOTIONS_ARRAY,
  CLEAR_CHECKOUT_RESPONSE,
} from "../constants";
import { Money } from "../utils/money";

const initialState = {
  total: 0,
  subTotal: 0,
  customerPhone: "",
  customerEmail: "",
  customerName: "",
  deliveryAddress1: "",
  deliveryAddress2: "",
  deliveryPostalCode: "",
  deliveryDateTime: null,
  orderItems: [],
  couponCode: "",
  additionalNote: "",
  allowEditMethodAddressForm: false,
  allowEditDateTimeForm: false,
  allowEditPaymentMethodForm: false,
  orderingContactFormDirty: false,
  orderingMethodAddressFormDirty: false,
  removedPromotions: [],
  buyOneGetOneFreePromotions: [],
  serviceCharge: 0,
};

export default (state = initialState, action) => {
  let currentOrderingItems = [];
  let tempBuyOneGetOneFreePromotions = [];
  if (state.orderItems) {
    currentOrderingItems = [...state.orderItems];
  }
  if (state.buyOneGetOneFreePromotions) {
    tempBuyOneGetOneFreePromotions = [...state.buyOneGetOneFreePromotions];
  }
  let tempRemovedPromotions;
  let originalDeliveryFee;
  let currentPaymentMethod;
  let currentOrderingMethod;
  let currentIsPreOrder;
  let currentCouponCode;
  let currentSelectedDeliveryZoneId;
  let currentDeliveryDateTime;

  const calculateSequence = () => {
    let maxlength = 0;
    tempBuyOneGetOneFreePromotions.map((bogof) => {
      if (bogof.orderItems?.length > 0) {
        if (maxlength < bogof.orderItems[0]?.sequence)
          maxlength = bogof.orderItems[0]?.sequence;
        if (maxlength < bogof.orderItems[1]?.sequence)
          maxlength = bogof.orderItems[1]?.sequence;
      }
      return bogof;
    });
    currentOrderingItems.map((item) => {
      if (maxlength < item.sequence) maxlength = item.sequence;
    });
    return maxlength;
  };

  switch (action.type) {
    case ADD_TO_CART: {
      const orderingItem = action.payload;
      let maxlength = calculateSequence();
      orderingItem.sequence = maxlength + 1;
      if (orderingItem.name && orderingItem.itemId && orderingItem.qty) {
        currentOrderingItems.push(orderingItem);
      }

      //calculate subTotal & total
      var orderPrice = Money.orderPriceWithPOS(state, currentOrderingItems);
      return {
        ...state,
        ...orderPrice,
        checkoutResponse: null,
      };
    }

    case MODIFY_ITEM_FROM_CART: {
      const orderingItem = action.payload;
      const tempCurrentOrderingItems = [...currentOrderingItems];
      const tempUpdatedCurrentOrderingItems = [];

      if (orderingItem.name && orderingItem.itemId && orderingItem.qty) {
        for (let i = 0; i < tempCurrentOrderingItems.length; i++) {
          if (tempCurrentOrderingItems[i].sequence === orderingItem.sequence) {
            tempUpdatedCurrentOrderingItems.push(orderingItem);
          } else {
            tempUpdatedCurrentOrderingItems.push(tempCurrentOrderingItems[i]);
          }
        }
      }

      if (tempUpdatedCurrentOrderingItems.length > 0) {
        let newOrderPrice = Money.orderPriceWithPOS(
          state,
          tempUpdatedCurrentOrderingItems
          // state.removedPromotions,
          // tempBuyOneGetOneFreePromotions
        );
        return {
          ...state,
          ...newOrderPrice,
          checkoutResponse: null,
        };
      } else {
        var orderPrice = Money.orderPriceWithPOS(
          state,
          currentOrderingItems
          // state.removedPromotions,
          // tempBuyOneGetOneFreePromotions
        );
        return {
          ...state,
          ...orderPrice,
          checkoutResponse: null,
        };
      }
    }

    case CHECK_OUT:
      return {
        ...state,
        checkoutResponse: null,
      };

    case CHECK_OUT_SUCCESS:
      return {
        ...state,
        checkoutResponse: action.payload,
      };

    case CHECK_OUT_FAIL:
      return {
        ...state,
        checkoutResponse: action.payload,
      };

    case CHECK_OUT_ORDER_STATUS:
      return {
        ...state,
        checkoutResponse: {
          ...state.checkoutResponse,
          ...action.payload,
        },
      };

    case CHECK_OUT_ORDER_STATUS_TIMEOUT:
      return {
        ...state,
        checkoutResponse: {
          ...state.checkoutResponse,
          status: "ERROR",
        },
      };

    case UPDATE_ORDER_STATUS_TIMEOUT:
      return {
        ...state,
        checkoutResponse: {
          ...state.checkoutResponse,
          timeoutInMilis: action.payload * 1000,
        },
      };

    case INCREASE_QUANTITY_FROM_CART:
      currentOrderingItems.filter((item) => {
        if (
          item.itemId === action.payload.itemId &&
          item.sequence === action.payload.sequence
        ) {
          item.qty = item.qty + 1;
          if ((item?.getFreeItemPromoId || 0) > 0) {
            delete item.getFreeItemPromoId;
          }
          item.priceSum = Money.calcPrice(
            item.price,
            item.qty,
            item.modifierPriceSum
          );
        }
      });

      //calculate subTotal & total
      var orderPrice = Money.orderPriceWithPOS(
        state,
        currentOrderingItems
        // state.removedPromotions,
        // tempBuyOneGetOneFreePromotions
      );
      return {
        ...state,
        ...orderPrice,
      };

    case DECREASE_QUANTITY_FROM_CART:
      currentOrderingItems.filter((item) => {
        if (
          item.itemId === action.payload.itemId &&
          item.sequence === action.payload.sequence
        ) {
          if (item.qty > 1) {
            item.qty = item.qty - 1;
            item.priceSum = Money.calcPrice(
              item.price,
              item.qty,
              item.modifierPriceSum
            );
          }
        }
      });

      //calculate subTotal & total
      var orderPrice = Money.orderPriceWithPOS(
        state,
        currentOrderingItems
        // state.removedPromotions,
        // tempBuyOneGetOneFreePromotions
      );

      return {
        ...state,
        ...orderPrice,
      };

    case REMOVE_FROM_CART:
      //remove selected ordering item from orderItems array
      currentOrderingItems = currentOrderingItems.filter((item) => {
        return item.sequence !== action.payload.sequence;
      });

      //reorder ordering item sequence in orderItems array
      currentOrderingItems.map((item, index) => {
        if (item.sequence >= action.payload.sequence) {
          item.sequence = index + 1;
        }
        return item;
      });

      //calculate subTotal & total
      var orderPrice = Money.orderPriceWithPOS(
        state,
        currentOrderingItems
        // state.removedPromotions,
        // tempBuyOneGetOneFreePromotions
      );

      return {
        ...state,
        ...orderPrice,
      };

    case SAVE_ORDERING_INFO_TO_CART:
      if (
        action.payload.deliveryFee === undefined ||
        action.payload.deliveryFee === null
      ) {
        originalDeliveryFee = state.originalDeliveryFee;
      } else if (action.payload.deliveryFee === 0) {
        originalDeliveryFee = 0;
      } else {
        originalDeliveryFee = action.payload.deliveryFee;
      }

      if (
        action.payload.paymentMethod === undefined ||
        action.payload.paymentMethod === null
      ) {
        currentPaymentMethod = state.paymentMethod;
      } else {
        currentPaymentMethod = action.payload.paymentMethod;
      }

      if (
        action.payload.deliveryZoneId === undefined ||
        action.payload.deliveryZoneId === null
      ) {
        currentSelectedDeliveryZoneId = state.deliveryZoneId;
      } else {
        currentSelectedDeliveryZoneId = action.payload.deliveryZoneId;
      }

      if (
        action.payload.orderingMethod === undefined ||
        action.payload.orderingMethod === null
      ) {
        currentOrderingMethod = state.orderingMethod;
      } else {
        currentOrderingMethod = action.payload.orderingMethod;
      }

      if (
        action.payload.isPreOrder === undefined ||
        action.payload.isPreOrder === null
      ) {
        currentIsPreOrder = state.isPreOrder;
      } else {
        currentIsPreOrder = action.payload.isPreOrder;
      }

      if (
        action.payload.couponCode === undefined ||
        action.payload.couponCode === null
      ) {
        currentCouponCode = state.couponCode;
      } else {
        currentCouponCode = action.payload.couponCode;
      }

      if (action.payload.deliveryDateTime === undefined) {
        currentDeliveryDateTime = state.deliveryDateTime;
      } else {
        currentDeliveryDateTime = action.payload.deliveryDateTime;
      }

      var orderPrice = Money.orderPriceWithPOS(
        {
          ...state,
          paymentMethod: currentPaymentMethod,
          orderingMethod: currentOrderingMethod,
          isPreOrder: currentIsPreOrder,
          couponCode: currentCouponCode,
          originalDeliveryFee: originalDeliveryFee,
          deliveryZoneId: currentSelectedDeliveryZoneId,
          deliveryDateTime: currentDeliveryDateTime,
        },
        currentOrderingItems
        // state.removedPromotions,
        // tempBuyOneGetOneFreePromotions
      );
      return {
        ...state,
        ...action.payload,
        ...orderPrice,
      };

    case DONOT_APPLY_PROMOTION:
      tempRemovedPromotions = [...state.removedPromotions, action.payload];
      var orderPrice = Money.orderPrice(
        state,
        currentOrderingItems,
        tempRemovedPromotions,
        tempBuyOneGetOneFreePromotions
      );
      return {
        ...state,
        ...orderPrice,
        removedPromotions: tempRemovedPromotions,
      };

    case APPLY_PROMOTION:
      tempRemovedPromotions = state.removedPromotions.filter((id) => {
        return id != action.payload.id;
      });
      var orderPrice = Money.orderPrice(
        state,
        currentOrderingItems,
        tempRemovedPromotions,
        tempBuyOneGetOneFreePromotions
      );
      return {
        ...state,
        ...orderPrice,
        removedPromotions: tempRemovedPromotions,
      };

    case ADD_BUY_ONE_GET_ONE_FREE_PROMOTION:
      const tempBuyOneGetOneFreePromotion = action.payload;
      let maxlength1 = calculateSequence();
      tempBuyOneGetOneFreePromotion.orderItems.map((orderItem) => {
        if (orderItem.sequence == 1) {
          orderItem.sequence = ++maxlength1;
        }
        return orderItem;
      });
      if (!tempBuyOneGetOneFreePromotion.seq) {
        // Add new Bogof promotion
        tempBuyOneGetOneFreePromotion.seq = `${
          tempBuyOneGetOneFreePromotion.id
        }_${state.buyOneGetOneFreePromotions.length + 1}`;
        tempBuyOneGetOneFreePromotions = [
          ...tempBuyOneGetOneFreePromotions,
          tempBuyOneGetOneFreePromotion,
        ];
      } else {
        // Continue shopping Bogof promotion
        tempBuyOneGetOneFreePromotions = tempBuyOneGetOneFreePromotions.map(
          (promo) => {
            if (promo.seq === tempBuyOneGetOneFreePromotion.seq) {
              return tempBuyOneGetOneFreePromotion;
            } else {
              return promo;
            }
          }
        );
      }

      var orderPrice = Money.orderPrice(
        state,
        currentOrderingItems,
        state.removedPromotions,
        tempBuyOneGetOneFreePromotions
      );

      return {
        ...state,
        buyOneGetOneFreePromotions: tempBuyOneGetOneFreePromotions,
        ...orderPrice,
      };

    case REMOVE_BUY_ONE_GET_ONE_FREE_PROMOTION:
      tempBuyOneGetOneFreePromotions = tempBuyOneGetOneFreePromotions.filter(
        (itm) => itm.seq !== action.payload.seq
      );
      tempBuyOneGetOneFreePromotions.map((itm, index) => {
        if (itm.seq >= action.payload.seq) {
          itm.seq = `${itm.id}_${index + 1}`;
        }
        return itm;
      });

      var orderPrice = Money.orderPrice(
        state,
        currentOrderingItems,
        state.removedPromotions,
        tempBuyOneGetOneFreePromotions
      );

      return {
        ...state,
        buyOneGetOneFreePromotions: tempBuyOneGetOneFreePromotions,
        ...orderPrice,
      };

    case RE_CALCULATE_ORDER_PRICE:
      var orderPrice = Money.orderPriceWithPOS(
        state,
        currentOrderingItems
        // state.removedPromotions,
        // tempBuyOneGetOneFreePromotions
      );
      return {
        ...state,
        ...orderPrice,
      };

    case CLEAN_REMOVED_PROMOTIONS_ARRAY:
      return {
        ...state,
        removedPromotions: [],
      };

    case CLEAN_CART:
      const newState = {
        ...state,
        total: 0,
        subTotal: 0,
        deliveryDateTime: null,
        couponCode: "",
        additionalNote: "",
        preOrderTimeSlot: "",
        orderItems: [],
        paymentMethod: "",
        totalTax: 0,
        taxObj: [],
        discount: 0,
        selectedPromotions: [],
        removedPromotions: [],
        buyOneGetOneFreePromotions: [],
        handoverFulfillment: "",
        handoverFulfillmentInstruction: "",
      };
      delete newState.isPreOrder;
      return newState;

    case CLEAR_CHECKOUT_RESPONSE:
      return {
        ...state,
        checkoutResponse: null,
      };

    case CLEAN_ALL_CART:
      return initialState;

    default:
      return state;
  }
};
