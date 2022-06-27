import currency from "currency.js";
import { deepClone } from "./utils";
import {
  CARD_DELIVERY,
  CARD_PICKUP,
  CASH_DELIVERY,
  CASH_PICKUP,
  CMB_DELIVERY,
  CMB_PICKUP,
  PAY_LAH_DELIVERY,
  PAY_LAH_PICKUP,
  PAY_NOW_DELIVERY,
  PAY_NOW_PICKUP,
} from "../constants";
import {
  format,
  parse,
  isBefore,
  getDay,
  getTime,
  getMinutes,
  getDate,
  getHours,
  isAfter,
  isEqual,
} from "date-fns";

export class Money {
  static __instance = null;

  constructor(currencyConf, taxConfig, promotions, user, paymentMethods) {
    if (currencyConf) {
      var currencyPosition = (currencyConf.currencyPosition || "!#").replace(
        "x",
        "!"
      );
      var currencyCode = currencyConf.currencyCode || "$";
      var decimalPlace = parseInt(currencyConf.decimalPlace) || 2;
      this.currency = (value) =>
        currency(value, {
          symbol: currencyCode,
          precision: decimalPlace,
          pattern: currencyPosition,
        });
    } else {
      this.currency = (value) =>
        currency(value, { symbol: "$ ", precision: 2 });
    }
    this.taxConfig = taxConfig;
    this.promotionConfig = promotions;
    this.paymentMethods = paymentMethods;
  }

  static init = (currencyConf, taxConfig, promotions, user, paymentMethods) => {
    if (Money.__instance == null) {
      Money.__instance = new Money(
        currencyConf,
        taxConfig,
        promotions,
        user,
        paymentMethods
      );
    } else {
      Money.__instance.currencyConf = currencyConf;
      Money.__instance.taxConfig = taxConfig;
      Money.__instance.promotionConfig = promotions;
      Money.__instance.user = user;
      Money.__instance.paymentMethods = paymentMethods;
    }
  };

  static moneyFormat = (val) => {
    return Money.__instance.currency(val).format(true);
  };

  static sum = (val1, val2) => {
    return Money.__instance.currency(val1).add(val2).value;
  };

  static calcPrice = (itemPrice, qty, modifierPriceSum) => {
    if (!modifierPriceSum) modifierPriceSum = 0;
    var money = Money.__instance
      .currency(itemPrice)
      .add(modifierPriceSum)
      .multiply(qty);
    return money.value;
  };

  static round = (number, multiple, roundType) => {
    if (roundType == 0) return number;
    var result = number;
    var division = (number / multiple).toString(10);
    division = division.substr(0, division.indexOf("."));
    var sub = (number - (division * multiple).toFixed(2)).toFixed(2);
    if (sub > 0 && sub < multiple) {
      if (roundType == 2) {
        //round up
        division = parseInt(division, 10) + 1;
        result = division * multiple;
      } else if (roundType == 3) {
        //round down
        result = division * multiple;
      } else {
        //just round
        if (sub >= (multiple / 2).toFixed(2)) {
          division = parseInt(division, 10) + 1;
          result = division * multiple;
        } else {
          result = division * multiple;
        }
      }
    }
    return result.toFixed(2);
  };

  /**
   * Calculate order price with tax include in item
   */
  static orderPrice = (
    order,
    orderItems,
    removedPromotions,
    buyOneGetOneFreePromotions
  ) => {
    let taxConfig = Money.__instance.taxConfig;
    let activePromotions = Money.__instance.promotionConfig;
    const currentUser = Money.__instance.user;
    let currentOrderItems = [...orderItems];
    let selectedPromotions = [];
    let userSelectedPaymentMethod = "";
    let userSelectedPaymentMethodType = 0;
    let currentClientType = "A";

    // console.log('orderPrice deliveryZoneId ===>', order.deliveryZoneId);

    if (
      order.paymentMethod === CASH_DELIVERY ||
      order.paymentMethod === CASH_PICKUP
    ) {
      userSelectedPaymentMethod = "Cash";
      userSelectedPaymentMethodType = 0;
    } else if (
      order.paymentMethod === CARD_DELIVERY ||
      order.paymentMethod === CARD_PICKUP
    ) {
      userSelectedPaymentMethod = "Card";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === CMB_DELIVERY ||
      order.paymentMethod === CMB_PICKUP
    ) {
      userSelectedPaymentMethod =
        "Call me back and I'll tell you my card details";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === PAY_LAH_DELIVERY ||
      order.paymentMethod === PAY_LAH_PICKUP
    ) {
      userSelectedPaymentMethod = "PayLah";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === PAY_NOW_DELIVERY ||
      order.paymentMethod === PAY_NOW_PICKUP
    ) {
      userSelectedPaymentMethod = "PayNow";
      userSelectedPaymentMethodType = 1;
    }

    if (currentUser?.orderCount > 0) {
      currentClientType = "R";
    } else {
      currentClientType = "N";
    }

    const calcPriceSumWithoutDiscountOnItem = (currentOrderItems) => {
      return currentOrderItems.map((orderItem) => {
        let orderItemPriceSumValue;
        orderItemPriceSumValue = Money.calcPrice(
          orderItem.price,
          orderItem.qty,
          orderItem.modifierPriceSum
        );
        orderItem.priceSum = orderItemPriceSumValue;
        delete orderItem.discountName;
        delete orderItem.ooDiscountExplaination;
        delete orderItem.discountAmt;
        delete orderItem.discountPercentage;
        delete orderItem.isGetFreeItem;
        return orderItem;
      });
    };

    const calcBOGOFPrice = (tempBuyOneGetOneFreePromotion) => {
      const { eligibleItemsGroup1Percent, eligibleItemsGroup2Percent } =
        tempBuyOneGetOneFreePromotion;
      let discountAmount1 = 0;
      let discountAmount2 = 0;
      if (tempBuyOneGetOneFreePromotion.orderItems?.length >= 2) {
        if (
          eligibleItemsGroup1Percent === 0 &&
          eligibleItemsGroup2Percent === 0
        ) {
          if (
            tempBuyOneGetOneFreePromotion.orderItems[0].priceSum <=
            tempBuyOneGetOneFreePromotion.orderItems[1].priceSum
          ) {
            tempBuyOneGetOneFreePromotion.orderItems[0].discountAmt =
              tempBuyOneGetOneFreePromotion.orderItems[0].priceSum;
            tempBuyOneGetOneFreePromotion.orderItems[0].priceSum = 0;
            // currentPromotion.orderItems[0].price = 0;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountPercentage = 100;
            return tempBuyOneGetOneFreePromotion.orderItems[0].discountAmt;
          } else {
            // orderingItem.price = 0;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountAmt =
              tempBuyOneGetOneFreePromotion.orderItems[1].priceSum;
            tempBuyOneGetOneFreePromotion.orderItems[1].priceSum = 0;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountPercentage = 100;
            return tempBuyOneGetOneFreePromotion.orderItems[1].discountAmt;
          }
        } else {
          if (
            tempBuyOneGetOneFreePromotion.orderItems[0].priceSum <=
            tempBuyOneGetOneFreePromotion.orderItems[1].priceSum
          ) {
            discountAmount1 =
              (tempBuyOneGetOneFreePromotion.orderItems[0].priceSum *
                eligibleItemsGroup1Percent) /
              100;
            discountAmount2 =
              (tempBuyOneGetOneFreePromotion.orderItems[1].priceSum *
                eligibleItemsGroup2Percent) /
              100;
            tempBuyOneGetOneFreePromotion.orderItems[0].priceSum =
              tempBuyOneGetOneFreePromotion.orderItems[0].priceSum -
              discountAmount1;
            // currentPromotion.orderItems[0].price = currentPromotion.orderItems[0].price * (100 - eligibleItemsGroup1Percent) / 100;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountAmt =
              discountAmount1;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountPercentage =
              eligibleItemsGroup1Percent;
            // orderingItem.price = orderingItem.priceSum * (100 - eligibleItemsGroup2Percent) / 100;
            tempBuyOneGetOneFreePromotion.orderItems[1].priceSum =
              tempBuyOneGetOneFreePromotion.orderItems[1].priceSum -
              discountAmount2;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountAmt =
              discountAmount2;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountPercentage =
              eligibleItemsGroup2Percent;
            return discountAmount1 + discountAmount2;
          } else {
            discountAmount1 =
              (tempBuyOneGetOneFreePromotion.orderItems[0].priceSum *
                eligibleItemsGroup2Percent) /
              100;
            discountAmount2 =
              (tempBuyOneGetOneFreePromotion.orderItems[1].priceSum *
                eligibleItemsGroup1Percent) /
              100;
            tempBuyOneGetOneFreePromotion.orderItems[0].priceSum =
              tempBuyOneGetOneFreePromotion.orderItems[0].priceSum -
              discountAmount1;
            // currentPromotion.orderItems[0].price = currentPromotion.orderItems[0].price * (100 - eligibleItemsGroup2Percent) / 100;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountAmt =
              discountAmount1;
            tempBuyOneGetOneFreePromotion.orderItems[0].discountPercentage =
              eligibleItemsGroup2Percent;
            // orderingItem.price = orderingItem.priceSum * (100 - eligibleItemsGroup1Percent) / 100;
            tempBuyOneGetOneFreePromotion.orderItems[1].priceSum =
              tempBuyOneGetOneFreePromotion.orderItems[1].priceSum -
              discountAmount2;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountName =
              tempBuyOneGetOneFreePromotion.name;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountAmt =
              discountAmount2;
            tempBuyOneGetOneFreePromotion.orderItems[1].discountPercentage =
              eligibleItemsGroup1Percent;
            return discountAmount1 + discountAmount2;
          }
        }
      }
    };

    // calculate discount on item
    if (
      currentOrderItems.length > 0 &&
      activePromotions &&
      activePromotions.length > 0
    ) {
      currentOrderItems = calcPriceSumWithoutDiscountOnItem(currentOrderItems);
      let totalDiscountMoney = Money.__instance.currency(0);
      activePromotions
        .filter((promo) => promo.type === "S")
        .map((promo) => {
          const { orderTimeOption } = promo;
          let totalDiscountMoneyForEachDiscountOnItemPromo =
            Money.__instance.currency(0);
          let selectedPaymentMethodArr;
          let selectedOrderingMethodArr;
          selectedPaymentMethodArr =
            promo?.selectedPaymentMethod?.split(",")?.filter(Boolean) || [];
          selectedOrderingMethodArr =
            promo?.orderingMethod?.split(",")?.filter(Boolean) || [];
          if (
            removedPromotions?.length <= 0 ||
            !removedPromotions?.includes(promo.id)
          ) {
            let matchItemId = false;
            let matchItemModId = false;
            let hasAtleastOneMatch = false;
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              currentOrderItems = currentOrderItems.map((orderItem) => {
                let eligibleItems = promo.eligibleItemsId
                  ? JSON.parse(promo.eligibleItemsId)
                  : [];
                orderItem.discountAmt = orderItem.discountAmt || 0;
                let orderItemPriceSumValue = 0;
                let discountEligibleItemMoney = Money.__instance.currency(0);
                let orderItemPriceSumMoney = Money.__instance.currency(0);
                matchItemId = false;
                matchItemModId = false;
                eligibleItems.filter((eCat) => {
                  eCat.items.filter((eItem) => {
                    if (eItem.id === orderItem.itemId) {
                      orderItemPriceSumValue = Money.calcPrice(
                        orderItem.price,
                        orderItem.qty,
                        orderItem.modifierPriceSum
                      );
                      matchItemId = true;
                      if (eItem.modifierGroupItems.length === 0) {
                        matchItemModId = true;
                      }

                      eItem.modifierGroupItems.filter((eGroupModItem) => {
                        eGroupModItem.modifierGroup.modifiers =
                          eGroupModItem.modifierGroup.modifiers.filter(
                            (emod) => {
                              orderItem.modifiers.filter((oMod) => {
                                if (oMod.modifierId === emod.id) {
                                  matchItemModId = true;
                                }
                              });
                            }
                          );
                      });
                    }
                  });
                });

                if (
                  matchItemId &&
                  matchItemModId &&
                  (selectedPaymentMethodArr.length === 0 ||
                    selectedPaymentMethodArr.includes(
                      userSelectedPaymentMethod
                    )) &&
                  (selectedOrderingMethodArr.length === 0 ||
                    selectedOrderingMethodArr.includes(
                      order?.orderingMethod
                    )) &&
                  (orderTimeOption === "A" ||
                    (orderTimeOption === "N" && order?.isPreOrder === false) ||
                    (orderTimeOption === "P" && order?.isPreOrder === true))
                ) {
                  orderItemPriceSumMoney = Money.__instance.currency(
                    orderItemPriceSumValue
                  );
                  discountEligibleItemMoney = orderItemPriceSumMoney
                    .multiply(promo.eligibleItemsGroup1Percent)
                    .divide(100);
                  totalDiscountMoneyForEachDiscountOnItemPromo =
                    totalDiscountMoneyForEachDiscountOnItemPromo.add(
                      discountEligibleItemMoney
                    );
                  totalDiscountMoney = totalDiscountMoney.add(
                    totalDiscountMoneyForEachDiscountOnItemPromo
                  );
                  orderItem.priceSum = orderItemPriceSumMoney
                    .subtract(discountEligibleItemMoney)
                    .subtract(orderItem.discountAmt).value;
                  orderItem.discountPercentage =
                    (orderItem.discountPercentage || 0) +
                    promo.eligibleItemsGroup1Percent;
                  orderItem.discountName = `Discount on Item (${orderItem.discountPercentage}%)`;
                  orderItem.ooDiscountExplaination =
                    ((orderItem.ooDiscountExplaination || "") == ""
                      ? ""
                      : orderItem.ooDiscountExplaination + "#####") +
                    promo.name +
                    ` (- ${discountEligibleItemMoney.value})`;
                  orderItem.discountAmt += discountEligibleItemMoney.value;
                  if (promo.displayTime == "H") {
                    if (promo.couponCode == order?.couponCode) {
                      hasAtleastOneMatch = true;
                    } else {
                      hasAtleastOneMatch = false;
                    }
                  } else {
                    hasAtleastOneMatch = true;
                  }
                  // } else {
                  //     orderItem.priceSum = orderItemPriceSumValue;
                  //     delete orderItem.discountName;
                  //     delete orderItem.discountAmt;
                  //     delete orderItem.discountPercentage;
                }
                return orderItem;
              });

              if (hasAtleastOneMatch) {
                promo.discount = totalDiscountMoneyForEachDiscountOnItemPromo;
                delete promo.picture;
                selectedPromotions.push(promo);
              }
              // } else {
              //     currentOrderItems = calcPriceSumWithoutDiscountOnItem(currentOrderItems);
            }
            // } else {
            //     currentOrderItems = calcPriceSumWithoutDiscountOnItem(currentOrderItems);
          }
        });
    }

    var subTotalValue = currentOrderItems
      .map((item) => item.priceSum)
      .reduce((a, b) => {
        return Money.sum(a, b);
      }, 0);

    var deliveryFee = Money.__instance.currency(order.originalDeliveryFee);
    var originalDeliveryFee = Money.__instance.currency(
      order.originalDeliveryFee
    );
    var subTotal = Money.__instance.currency(subTotalValue);
    var total = Money.__instance.currency(subTotal);
    var totalTax = Money.__instance.currency(0);
    let discount = Money.__instance.currency(0);
    let globalDiscountPercent = Money.__instance.currency(0);
    var taxObj = [];

    // calculate get free item
    if (
      currentOrderItems.length > 0 &&
      activePromotions &&
      activePromotions.length > 0
    ) {
      currentOrderItems = calcPriceSumWithoutDiscountOnItem(currentOrderItems);
      let totalDiscountMoney = Money.__instance.currency(0);
      activePromotions
        .filter((promo) => promo.type === "G")
        .map((promo) => {
          const { orderTimeOption } = promo;
          let totalDiscountMoneyForEachDiscountOnItemPromo =
            Money.__instance.currency(0);
          let selectedPaymentMethodArr;
          let selectedOrderingMethodArr;
          selectedPaymentMethodArr =
            promo?.selectedPaymentMethod?.split(",")?.filter(Boolean) || [];
          selectedOrderingMethodArr =
            promo?.orderingMethod?.split(",")?.filter(Boolean) || [];
          if (
            removedPromotions?.length <= 0 ||
            !removedPromotions?.includes(promo.id)
          ) {
            let hasAtleastOneMatch = false;
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              currentOrderItems = deepClone(currentOrderItems, []).map(
                (orderItem) => {
                  orderItem.discountAmt = orderItem.discountAmt || 0;
                  let orderItemPriceSumValue = 0;
                  let discountEligibleItemMoney = Money.__instance.currency(0);
                  let orderItemPriceSumMoney = Money.__instance.currency(0);

                  if (orderItem?.getFreeItemPromoId == promo.id) {
                    if (
                      subTotal.value - orderItem.priceSum >
                        promo.minimumOrderAmount &&
                      (selectedPaymentMethodArr.length === 0 ||
                        selectedPaymentMethodArr.includes(
                          userSelectedPaymentMethod
                        )) &&
                      (selectedOrderingMethodArr.length === 0 ||
                        selectedOrderingMethodArr.includes(
                          order?.orderingMethod
                        )) &&
                      (orderTimeOption === "A" ||
                        (orderTimeOption === "N" &&
                          order?.isPreOrder === false) ||
                        (orderTimeOption === "P" && order?.isPreOrder === true))
                    ) {
                      orderItemPriceSumValue = Money.calcPrice(
                        orderItem.price,
                        orderItem.qty,
                        orderItem.modifierPriceSum
                      );
                      orderItemPriceSumMoney = Money.__instance.currency(
                        orderItemPriceSumValue
                      );
                      discountEligibleItemMoney = orderItemPriceSumMoney
                        .multiply(promo.eligibleItemsGroup1Percent)
                        .divide(100);
                      totalDiscountMoneyForEachDiscountOnItemPromo =
                        totalDiscountMoneyForEachDiscountOnItemPromo.add(
                          discountEligibleItemMoney
                        );
                      totalDiscountMoney = totalDiscountMoney.add(
                        totalDiscountMoneyForEachDiscountOnItemPromo
                      );
                      orderItem.isGetFreeItem = true;
                      orderItem.priceSum = orderItemPriceSumMoney
                        .subtract(discountEligibleItemMoney)
                        .subtract(orderItem.discountAmt).value;
                      orderItem.discountPercentage =
                        (orderItem.discountPercentage || 0) +
                        promo.eligibleItemsGroup1Percent;
                      orderItem.discountName = `Discount on Item (${orderItem.discountPercentage}%)`;
                      orderItem.ooDiscountExplaination =
                        ((orderItem.ooDiscountExplaination || "") == ""
                          ? ""
                          : orderItem.ooDiscountExplaination + "#####") +
                        promo.name +
                        ` (- ${discountEligibleItemMoney.value})`;
                      orderItem.discountAmt += discountEligibleItemMoney.value;
                    } else {
                      orderItem.isGetFreeItem = false;
                    }
                  }
                  return orderItem;
                }
              );

              currentOrderItems = currentOrderItems.filter(
                (orderItem) => orderItem?.isGetFreeItem !== false
              );
              if (currentOrderItems.length > 0) {
                if (promo.displayTime == "H") {
                  if (promo.couponCode == order?.couponCode) {
                    hasAtleastOneMatch = true;
                  } else {
                    hasAtleastOneMatch = false;
                  }
                } else {
                  hasAtleastOneMatch = true;
                }
              } else {
                hasAtleastOneMatch = false;
              }

              if (hasAtleastOneMatch) {
                promo.discount = totalDiscountMoneyForEachDiscountOnItemPromo;
                delete promo.picture;
                selectedPromotions.push(promo);
                subTotalValue = currentOrderItems
                  .map((item) => item.priceSum)
                  .reduce((a, b) => {
                    return Money.sum(a, b);
                  }, 0);
                subTotal = Money.__instance.currency(subTotalValue);
                total = Money.__instance.currency(subTotal);
              }
            }
          }
        });
    }

    // calculate sum price for buy one get one free promotion
    let priceSumOfAllOrderItemsInAll_BOGOF_promotions_value =
      buyOneGetOneFreePromotions
        .map((promotion) => {
          let priceSumOfAllOrderItemsForOne_BOGOF_promotion =
            promotion.orderItems
              .map((itm) => itm.priceSum)
              .reduce((a, b) => Money.sum(a, b), 0);
          delete promotion.picture;
          promotion.priceSum = priceSumOfAllOrderItemsForOne_BOGOF_promotion;
          return priceSumOfAllOrderItemsForOne_BOGOF_promotion;
        })
        .reduce((a, b) => Money.sum(a, b), 0);
    subTotal = subTotal.add(
      priceSumOfAllOrderItemsInAll_BOGOF_promotions_value
    );
    total = total.add(priceSumOfAllOrderItemsInAll_BOGOF_promotions_value);
    let hasAdjustByeOneGetOneFree = false;
    if (
      (buyOneGetOneFreePromotions.length > 0 || currentOrderItems.length > 0) &&
      activePromotions &&
      activePromotions.length > 0
    ) {
      activePromotions.map((promo) => {
        let discountMoney = Money.__instance.currency(0);
        let deliveryFeeDiscountMoney = Money.__instance.currency(0);
        let selectedPaymentMethodArr;
        let selectedOrderingMethodArr;
        const { discountPercent, minimumOrderAmount, orderTimeOption } = promo;
        selectedPaymentMethodArr =
          promo?.selectedPaymentMethod?.split(",")?.filter(Boolean) || [];
        selectedOrderingMethodArr =
          promo?.orderingMethod?.split(",")?.filter(Boolean) || [];
        if (
          removedPromotions?.length <= 0 ||
          !removedPromotions?.includes(promo.id)
        ) {
          if (promo.type === "K") {
            // first buy, kick starter promotion discount (%) on cart
            if (
              currentUser?.access_token &&
              promo.clientType === "N" &&
              currentClientType === "N"
            ) {
              if (subTotal > minimumOrderAmount) {
                globalDiscountPercent =
                  globalDiscountPercent.add(discountPercent);
                discountMoney = subTotal.multiply(discountPercent).divide(100);
                discount = discount.add(discountMoney);
              }
              delete promo.picture;
              selectedPromotions.push({
                ...promo,
                discount: discountMoney.value,
              });
            }
          } else if (
            promo.type === "F" &&
            order.orderingMethod == promo.orderingMethod
          ) {
            // free delivery fee
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              let continueCheck = false;
              if (promo.displayTime == "H") {
                if (promo.couponCode == order?.couponCode) {
                  continueCheck = true;
                } else {
                  continueCheck = false;
                }
              } else {
                continueCheck = true;
              }
              if (
                promo?.selectedDeliveryZone
                  ?.split(",")
                  .includes("" + order?.deliveryZoneId || "") ||
                (promo?.selectedDeliveryZone || []).length == 0
              ) {
                if (subTotal > minimumOrderAmount && continueCheck) {
                  deliveryFeeDiscountMoney = originalDeliveryFee
                    .multiply(discountPercent)
                    .divide(100);
                  deliveryFee = deliveryFee.subtract(deliveryFeeDiscountMoney);
                }
              }
              delete promo.picture;
              selectedPromotions.push({
                ...promo,
                discount: deliveryFeeDiscountMoney.value,
              });
            }
          } else if (promo.type === "C") {
            // discount (%) on cart
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              let continueCheck = false;
              if (promo.displayTime == "H") {
                if (promo.couponCode == order?.couponCode) {
                  continueCheck = true;
                } else {
                  continueCheck = false;
                }
              } else {
                continueCheck = true;
              }
              if (subTotal > minimumOrderAmount && continueCheck) {
                if (
                  (selectedPaymentMethodArr.length === 0 ||
                    selectedPaymentMethodArr.includes(
                      userSelectedPaymentMethod
                    )) &&
                  (selectedOrderingMethodArr.length === 0 ||
                    selectedOrderingMethodArr.includes(
                      order?.orderingMethod
                    )) &&
                  (orderTimeOption === "A" ||
                    (orderTimeOption === "N" && order?.isPreOrder === false) ||
                    (orderTimeOption === "P" && order?.isPreOrder === true))
                ) {
                  if (
                    promo?.selectedDeliveryZone
                      ?.split(",")
                      .includes("" + order?.deliveryZoneId || "") ||
                    (promo?.selectedDeliveryZone || []).length == 0
                  ) {
                    // console.log('type C ===>', promo, order);
                    let applyAfterCheckFulFillment = false;
                    if (promo?.fullfillmentTimeOption === "C") {
                      let deliveryDateTime = order?.deliveryDateTime
                        ? parse(
                            order.deliveryDateTime,
                            "dd-MM-yyyy HH:mm:ss",
                            new Date()
                          )
                        : new Date();
                      let fullfillmentWeekDays = JSON.parse(
                        promo.fullfillmentWeekDays
                      );
                      let deliveryDay = deliveryDateTime.getDay() + 1;
                      let deliveryTime = format(deliveryDateTime, "HH:mm");
                      let displayTimes =
                        fullfillmentWeekDays?.displayTimes || [];
                      for (let i = 0; i < displayTimes.length; i++) {
                        let from = displayTimes[i].from;
                        let to = displayTimes[i].to;
                        if (deliveryTime <= from && deliveryTime <= to) {
                          deliveryTime =
                            parseInt(deliveryTime.substr(0, 2), 10) +
                            24 +
                            deliveryTime.substr(2, 3);
                        }
                        if (to <= from) {
                          to =
                            parseInt(to.substr(0, 2), 10) +
                            24 +
                            to.substr(2, 3);
                        }
                        // console.log(displayTimes, deliveryDay, from, to, deliveryTime)
                        if (
                          displayTimes[i]?.days.includes(deliveryDay + "") &&
                          deliveryTime >= from &&
                          deliveryTime <= to
                        ) {
                          applyAfterCheckFulFillment = true;
                        }
                      }
                      let fftDateFrom = promo?.fftDateFrom
                        ? new Date(promo.fftDateFrom)
                        : null;
                      let fftDateTo = promo?.fftDateTo
                        ? new Date(promo.fftDateTo)
                        : null;
                      if (!applyAfterCheckFulFillment) {
                        if (fftDateFrom == null || fftDateTo == null) {
                          applyAfterCheckFulFillment = true;
                        } else {
                          let fftDateFromStr = format(
                            fftDateFrom,
                            "yyyy-MM-dd"
                          );
                          let fftDateToStr = format(fftDateTo, "yyyy-MM-dd");
                          let deliveryDateTimeStr = format(
                            deliveryDateTime,
                            "yyyy-MM-dd"
                          );
                          if (
                            deliveryDateTimeStr >= fftDateFromStr &&
                            deliveryDateTimeStr <= fftDateToStr
                          ) {
                            applyAfterCheckFulFillment = true;
                          } else {
                            applyAfterCheckFulFillment = false;
                          }
                        }
                      }
                    } else {
                      applyAfterCheckFulFillment = true;
                    }
                    if (applyAfterCheckFulFillment) {
                      globalDiscountPercent =
                        globalDiscountPercent.add(discountPercent);
                      discountMoney = subTotal
                        .multiply(discountPercent)
                        .divide(100);
                      discount = discount.add(discountMoney);
                    }
                  }
                }
              }
              delete promo.picture;
              if (continueCheck) {
                selectedPromotions.push({
                  ...promo,
                  discount: discountMoney.value,
                });
              }
            }
          } else if (promo.type === "P") {
            // % discount on your total cart value if you pay with a certain payment method.
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              let continueCheck = false;
              if (promo.displayTime == "H") {
                if (promo.couponCode == order?.couponCode) {
                  continueCheck = true;
                } else {
                  continueCheck = false;
                }
              } else {
                continueCheck = true;
              }
              if (subTotal > minimumOrderAmount && continueCheck) {
                if (
                  (selectedPaymentMethodArr.length === 0 ||
                    selectedPaymentMethodArr.includes(
                      userSelectedPaymentMethod
                    )) &&
                  (selectedOrderingMethodArr.length === 0 ||
                    selectedOrderingMethodArr.includes(
                      order?.orderingMethod
                    )) &&
                  (orderTimeOption === "A" ||
                    (orderTimeOption === "N" && order?.isPreOrder === false) ||
                    (orderTimeOption === "P" && order?.isPreOrder === true))
                ) {
                  globalDiscountPercent =
                    globalDiscountPercent.add(discountPercent);
                  discountMoney = subTotal
                    .multiply(discountPercent)
                    .divide(100);
                  discount = discount.add(discountMoney);
                }
              }
              delete promo.picture;
              if (continueCheck) {
                selectedPromotions.push({
                  ...promo,
                  discount: discountMoney.value,
                });
              }
            }
          } else if (promo.type === "A") {
            // fixed discount (amount) on cart
            if (
              promo.clientType === "A" ||
              (promo.clientType !== "A" &&
                promo.clientType === currentClientType)
            ) {
              let continueCheck = false;
              if (promo.displayTime == "H") {
                if (promo.couponCode == order?.couponCode) {
                  continueCheck = true;
                } else {
                  continueCheck = false;
                }
              } else {
                continueCheck = true;
              }
              if (subTotal > minimumOrderAmount && continueCheck) {
                if (
                  (selectedPaymentMethodArr.length === 0 ||
                    selectedPaymentMethodArr.includes(
                      userSelectedPaymentMethod
                    )) &&
                  (selectedOrderingMethodArr.length === 0 ||
                    selectedOrderingMethodArr.includes(
                      order?.orderingMethod
                    )) &&
                  (orderTimeOption === "A" ||
                    (orderTimeOption === "N" && order?.isPreOrder === false) ||
                    (orderTimeOption === "P" && order?.isPreOrder === true))
                ) {
                  globalDiscountPercent = globalDiscountPercent.add(
                    (discountPercent / subTotal.value) * 100
                  );
                  discountMoney = Money.__instance.currency(discountPercent);
                  discount = discount.add(discountMoney);
                }
              }
              delete promo.picture;
              if (continueCheck) {
                selectedPromotions.push({
                  ...promo,
                  discount: discountMoney.value,
                });
              }
            }
          } else if (promo.type === "B") {
            // buy one get one free
            if (promo.displayTime == "H") {
              if (promo.couponCode == order?.couponCode) {
                // let stt = 0;
                // let max = currentOrderItems?.length || 0;
                // do {
                let matchItemId = false;
                let matchItemModId = false;
                let newSplitOrderItems = [];
                let maxSequence = 0;
                currentOrderItems.map((orderItem) => {
                  if (orderItem.sequence > maxSequence)
                    maxSequence = orderItem.sequence;
                });
                currentOrderItems = currentOrderItems
                  .map((orderItem) => {
                    let eligibleItems = promo.eligibleItemsId
                      ? JSON.parse(promo.eligibleItemsId)
                      : [];
                    let eligiblePairItems = promo.eligibleItemsPairId
                      ? JSON.parse(promo.eligibleItemsPairId)
                      : [];
                    matchItemId = false;
                    matchItemModId = false;
                    if ((orderItem?.discountName || "") == "") {
                      eligibleItems.filter((eCat) => {
                        eCat.items.filter((eItem) => {
                          if (eItem.id === orderItem.itemId) {
                            matchItemId = true;
                            if (eItem.modifierGroupItems.length === 0) {
                              matchItemModId = true;
                            }

                            eItem.modifierGroupItems.filter((eGroupModItem) => {
                              eGroupModItem.modifierGroup.modifiers =
                                eGroupModItem.modifierGroup.modifiers.filter(
                                  (emod) => {
                                    orderItem.modifiers.filter((oMod) => {
                                      if (oMod.modifierId === emod.id) {
                                        matchItemModId = true;
                                      }
                                    });
                                  }
                                );
                            });
                          }
                        });
                      });
                    }
                    if (matchItemId && matchItemModId) {
                      console.log("Fuck match no pair");
                      let tmpBuyOneGetOneFreePromotion = JSON.parse(
                        JSON.stringify(promo)
                      );
                      let length = buyOneGetOneFreePromotions?.length || 0;
                      tmpBuyOneGetOneFreePromotion.seq = `${promo.id}_${
                        length + 1
                      }`;
                      tmpBuyOneGetOneFreePromotion.orderItems = [];
                      tmpBuyOneGetOneFreePromotion.couponCode =
                        promo.couponCode;
                      if (orderItem.qty <= 1) {
                        orderItem.discountName =
                          tmpBuyOneGetOneFreePromotion.name;
                        tmpBuyOneGetOneFreePromotion.orderItems.push(orderItem);
                      } else {
                        let newOrderItem = deepClone(orderItem, {});
                        orderItem.qty -= 1;
                        maxSequence += 1;
                        orderItem.sequence = maxSequence;
                        orderItem.priceSum = Money.calcPrice(
                          orderItem.price,
                          orderItem.qty,
                          orderItem.modifierPriceSum
                        );
                        newOrderItem.qty = 1;
                        newOrderItem.priceSum = Money.calcPrice(
                          newOrderItem.price,
                          newOrderItem.qty,
                          newOrderItem.modifierPriceSum
                        );
                        newOrderItem.discountName =
                          tmpBuyOneGetOneFreePromotion.name;
                        tmpBuyOneGetOneFreePromotion.orderItems.push(
                          newOrderItem
                        );
                        matchItemId = false;
                        matchItemModId = false;
                      }
                      if (buyOneGetOneFreePromotions?.length > 0) {
                        let tempBuyOneGetOneFreePromotions =
                          buyOneGetOneFreePromotions
                            .map((buyOneGetOneFreePromotion) => {
                              if (
                                tmpBuyOneGetOneFreePromotion.seq ==
                                buyOneGetOneFreePromotion.seq
                              ) {
                                return buyOneGetOneFreePromotion;
                              }
                            })
                            .filter(Boolean);
                        console.log(tempBuyOneGetOneFreePromotions);
                        if (tempBuyOneGetOneFreePromotions.length == 0) {
                          //find already has pair but not main
                          tempBuyOneGetOneFreePromotions =
                            buyOneGetOneFreePromotions
                              .map((buyOneGetOneFreePromotion) => {
                                if (
                                  tmpBuyOneGetOneFreePromotion.id ==
                                    buyOneGetOneFreePromotion.id &&
                                  buyOneGetOneFreePromotion.orderItems.length ==
                                    1 &&
                                  (buyOneGetOneFreePromotion.orderItems[0]
                                    .discountName || "") == ""
                                ) {
                                  return buyOneGetOneFreePromotion;
                                }
                              })
                              .filter(Boolean);
                          console.log(tempBuyOneGetOneFreePromotions);
                          if (tempBuyOneGetOneFreePromotions.length > 0) {
                            tmpBuyOneGetOneFreePromotion =
                              tempBuyOneGetOneFreePromotions[0];
                            orderItem.discountName =
                              tmpBuyOneGetOneFreePromotion.name;
                            tmpBuyOneGetOneFreePromotion.orderItems.push(
                              orderItem
                            );
                            // if (tmpBuyOneGetOneFreePromotion.orderItems.length > 0) {
                            //     if (orderItem.qty <= 1) {
                            //
                            //
                            //     } else {
                            //         let newOrderItem = deepClone(orderItem, {});
                            //         orderItem.qty -= 1;
                            //         maxSequence += 1;
                            //         orderItem.sequence = maxSequence;
                            //         orderItem.priceSum = Money.calcPrice(orderItem.price, orderItem.qty, orderItem.modifierPriceSum);
                            //         newOrderItem.qty = 1;
                            //         newOrderItem.priceSum = Money.calcPrice(newOrderItem.price, newOrderItem.qty, newOrderItem.modifierPriceSum);
                            //         newOrderItem.discountName = tmpBuyOneGetOneFreePromotion.name;
                            //         tmpBuyOneGetOneFreePromotion.orderItems.push(newOrderItem);
                            //         matchItemId = false;
                            //         matchItemModId = false;
                            //     }
                            // }
                            buyOneGetOneFreePromotions =
                              buyOneGetOneFreePromotions.filter((bogop) => {
                                return (
                                  bogop.seq != tmpBuyOneGetOneFreePromotion.seq
                                );
                              });
                          }
                          hasAdjustByeOneGetOneFree = true;
                          let discountAmt = calcBOGOFPrice(
                            tmpBuyOneGetOneFreePromotion
                          );
                          subTotal = subTotal.subtract(discountAmt);
                          total = total.subtract(discountAmt);
                          buyOneGetOneFreePromotions = [
                            ...buyOneGetOneFreePromotions,
                            tmpBuyOneGetOneFreePromotion,
                          ];
                        }
                      } else {
                        console.log("abc");
                        hasAdjustByeOneGetOneFree = true;
                        let discountAmt = calcBOGOFPrice(
                          tmpBuyOneGetOneFreePromotion
                        );
                        subTotal = subTotal.subtract(discountAmt);
                        total = total.subtract(discountAmt);
                        buyOneGetOneFreePromotions = [
                          ...buyOneGetOneFreePromotions,
                          tmpBuyOneGetOneFreePromotion,
                        ];
                      }
                    } else {
                      //find pair
                      console.log("Fuck find pair");
                      matchItemId = false;
                      matchItemModId = false;
                      if ((orderItem?.discountName || "") == "") {
                        eligiblePairItems.filter((eCat) => {
                          eCat.items.filter((eItem) => {
                            if (eItem.id === orderItem.itemId) {
                              matchItemId = true;
                              if (eItem.modifierGroupItems.length === 0) {
                                matchItemModId = true;
                              }

                              eItem.modifierGroupItems.filter(
                                (eGroupModItem) => {
                                  eGroupModItem.modifierGroup.modifiers =
                                    eGroupModItem.modifierGroup.modifiers.filter(
                                      (emod) => {
                                        orderItem.modifiers.filter((oMod) => {
                                          if (oMod.modifierId === emod.id) {
                                            matchItemModId = true;
                                          }
                                        });
                                      }
                                    );
                                }
                              );
                            }
                          });
                        });
                      }
                      if (matchItemId && matchItemModId) {
                        // console.log("Fuck pair");
                        let tmpBuyOneGetOneFreePromotionPair = JSON.parse(
                          JSON.stringify(promo)
                        );
                        if (buyOneGetOneFreePromotions?.length > 0) {
                          let tmpBuyOneGetOneFreePromotionPairs =
                            buyOneGetOneFreePromotions
                              .map((buyOneGetOneFreePromotion) => {
                                if (
                                  promo.id == buyOneGetOneFreePromotion.id &&
                                  buyOneGetOneFreePromotion.orderItems.length <
                                    2
                                ) {
                                  if (
                                    (buyOneGetOneFreePromotion.orderItems[0]
                                      .discountName || "") != ""
                                  )
                                    return buyOneGetOneFreePromotion;
                                  else return null;
                                }
                              })
                              .filter(Boolean);
                          if (tmpBuyOneGetOneFreePromotionPairs?.length > 0)
                            tmpBuyOneGetOneFreePromotionPair =
                              tmpBuyOneGetOneFreePromotionPairs[0];
                          else {
                            let length =
                              buyOneGetOneFreePromotions?.length || 0;
                            tmpBuyOneGetOneFreePromotionPair.seq = `${
                              promo.id
                            }_${length + 1}`;
                            tmpBuyOneGetOneFreePromotionPair.orderItems = [];
                            tmpBuyOneGetOneFreePromotionPair.couponCode =
                              promo.couponCode;
                          }
                        } else {
                          let length = buyOneGetOneFreePromotions?.length || 0;
                          tmpBuyOneGetOneFreePromotionPair.seq = `${promo.id}_${
                            length + 1
                          }`;
                          tmpBuyOneGetOneFreePromotionPair.orderItems = [];
                          tmpBuyOneGetOneFreePromotionPair.couponCode =
                            promo.couponCode;
                        }
                        console.log("abc=>", tmpBuyOneGetOneFreePromotionPair);
                        if (
                          tmpBuyOneGetOneFreePromotionPair.orderItems.length > 0
                        ) {
                          if (orderItem.qty <= 1) {
                            tmpBuyOneGetOneFreePromotionPair.orderItems.push(
                              orderItem
                            );
                          } else {
                            let newOrderItem = deepClone(orderItem, {});
                            console.log("hell1=>", newOrderItem, orderItem);
                            orderItem.qty -= 1;
                            maxSequence += 1;
                            orderItem.sequence = maxSequence;
                            orderItem.priceSum = Money.calcPrice(
                              orderItem.price,
                              orderItem.qty,
                              orderItem.modifierPriceSum
                            );
                            newOrderItem.qty = 1;
                            newOrderItem.priceSum = Money.calcPrice(
                              newOrderItem.price,
                              newOrderItem.qty,
                              newOrderItem.modifierPriceSum
                            );
                            tmpBuyOneGetOneFreePromotionPair.orderItems.push(
                              newOrderItem
                            );
                            matchItemId = false;
                            matchItemModId = false;
                          }
                        }
                        if (
                          tmpBuyOneGetOneFreePromotionPair.orderItems.length > 1
                        ) {
                          let discountAmt = calcBOGOFPrice(
                            tmpBuyOneGetOneFreePromotionPair
                          );
                          subTotal = subTotal.subtract(discountAmt);
                          total = total.subtract(discountAmt);
                          if (buyOneGetOneFreePromotions?.length > 0) {
                            const tempBuyOneGetOneFreePromotions =
                              buyOneGetOneFreePromotions.filter(
                                (buyOneGetOneFreePromotion) => {
                                  if (
                                    tmpBuyOneGetOneFreePromotionPair.seq ==
                                    buyOneGetOneFreePromotion.seq
                                  ) {
                                    return buyOneGetOneFreePromotion;
                                  }
                                }
                              );
                            console.log(tempBuyOneGetOneFreePromotions);
                            if (tempBuyOneGetOneFreePromotions.length == 0) {
                              hasAdjustByeOneGetOneFree = true;
                              buyOneGetOneFreePromotions = [
                                ...buyOneGetOneFreePromotions,
                                tmpBuyOneGetOneFreePromotionPair,
                              ];
                            }
                          } else {
                            hasAdjustByeOneGetOneFree = true;
                            buyOneGetOneFreePromotions = [
                              ...buyOneGetOneFreePromotions,
                              tmpBuyOneGetOneFreePromotionPair,
                            ];
                          }
                        } else {
                          matchItemModId = false;
                          matchItemId = false;
                        }
                      }
                    }

                    if (!(matchItemId && matchItemModId)) {
                      return orderItem;
                    }
                  })
                  .filter(Boolean);
                // stt ++;
                // } while(stt < max);
              }
            }
            if (buyOneGetOneFreePromotions?.length > 0) {
              const tempBuyOneGetOneFreePromotion = buyOneGetOneFreePromotions
                .filter((buyOneGetOneFreePromotion) => {
                  if (promo.id === buyOneGetOneFreePromotion.id) {
                    if (
                      promo.displayTime != "H" ||
                      (buyOneGetOneFreePromotion?.couponCode || "") ==
                        order.couponCode
                    ) {
                      return buyOneGetOneFreePromotion;
                    } else {
                      buyOneGetOneFreePromotion.orderItems.map((item) => {
                        if (item?.discountPercentage) {
                          delete item.discountPercentage;
                        }
                        if (item?.discountName) {
                          delete item.discountName;
                        }
                        if (item?.discountAmt) {
                          item.priceSum = item.priceSum + item.discountAmt;
                          subTotal = subTotal.add(item.discountAmt);
                          total = total.add(item.discountAmt);
                          delete item.discountAmt;
                        }
                      });
                      currentOrderItems = [
                        ...currentOrderItems,
                        ...buyOneGetOneFreePromotion.orderItems,
                      ];
                      hasAdjustByeOneGetOneFree = true;
                    }
                  } else {
                    return buyOneGetOneFreePromotion;
                  }
                })
                .filter(Boolean);
              buyOneGetOneFreePromotions = tempBuyOneGetOneFreePromotion;
            }
          }
        }
      });
      selectedPromotions = [
        ...selectedPromotions,
        ...buyOneGetOneFreePromotions,
      ];
      total = total.subtract(discount);
    }

    if (deliveryFee.value > 0) {
      total = total.add(deliveryFee);
    }

    if (taxConfig && taxConfig.enable) {
      //group  all item by tax id
      var tax1Items = [];
      var tax2Items = [];
      var tax3Items = [];

      var tax1Value = taxConfig.tax1Value;
      var tax2Value = taxConfig.tax2Value;
      var tax3Value = taxConfig.tax3Value;

      currentOrderItems.forEach((orderItem) => {
        if ((orderItem?.tax1Id || 0) > 0) {
          tax1Items.push(orderItem);
        }
        if ((orderItem?.tax2Id || 0) > 0) {
          tax2Items.push(orderItem);
        }
        if ((orderItem?.tax3Id || 0) > 0) {
          tax3Items.push(orderItem);
        }
      });

      buyOneGetOneFreePromotions.map((promotion) => {
        promotion.orderItems.map((orderItem) => {
          if ((orderItem?.tax1Id || 0) > 0) {
            tax1Items.push(orderItem);
          }
          if ((orderItem?.tax2Id || 0) > 0) {
            tax2Items.push(orderItem);
          }
          if ((orderItem?.tax3Id || 0) > 0) {
            tax3Items.push(orderItem);
          }
        });
      });

      if (tax1Value && tax1Value > 0) {
        var subTotalTax = Money.__instance.currency(0);
        var taxMoney = Money.__instance.currency(0);

        if (tax1Items.length > 0) {
          var subTotalTaxValue = tax1Items
            .map((item) => item.priceSum)
            .reduce((a, b) => {
              return Money.sum(a, b);
            }, 0);

          subTotalTax = subTotalTax.add(subTotalTaxValue);

          // subtract subTotalTax if totalCardDiscount > 0
          // subTotalTax = subTotalTax.subtract(discount);
          subTotalTax = subTotalTax
            .multiply(
              Money.__instance.currency(100).subtract(globalDiscountPercent)
            )
            .divide(100);

          if (!taxConfig.priceExclude)
            taxMoney = taxMoney.add(
              subTotalTax.multiply(tax1Value).divide(100)
            );
          else
            taxMoney = subTotalTax.subtract(
              subTotalTax.divide((100 + tax1Value) / 100)
            );
          totalTax = totalTax.add(taxMoney);
          taxObj.push({
            taxName: taxConfig.tax1Name,
            totalTax: totalTax.value,
          });
        }
      }

      if (tax2Value && tax2Value > 0) {
        var subTotalTax = Money.__instance.currency(0);
        var taxMoney = Money.__instance.currency(0);

        if (tax2Items.length > 0) {
          var subTotalTaxValue = tax2Items
            .map((item) => item.priceSum)
            .reduce((a, b) => {
              return Money.sum(a, b);
            }, 0);

          subTotalTax = subTotalTax.add(subTotalTaxValue);

          // subtract subTotalTax if totalCardDiscount > 0
          // subTotalTax = subTotalTax.subtract(discount);
          subTotalTax = subTotalTax
            .multiply(
              Money.__instance.currency(100).subtract(globalDiscountPercent)
            )
            .divide(100);

          if (!taxConfig.priceExclude)
            taxMoney = taxMoney.add(
              subTotalTax.multiply(tax2Value).divide(100)
            );
          else
            taxMoney = subTotalTax.subtract(
              subTotalTax.divide((100 + tax2Value) / 100)
            );
          totalTax = totalTax.add(taxMoney);
          taxObj.push({
            taxName: taxConfig.tax2Name,
            totalTax: totalTax.value,
          });
        }
      }

      if (tax3Value && tax3Value > 0) {
        var subTotalTax = Money.__instance.currency(0);
        var taxMoney = Money.__instance.currency(0);

        if (tax3Items.length > 0) {
          var subTotalTaxValue = tax3Items
            .map((item) => item.priceSum)
            .reduce((a, b) => {
              return Money.sum(a, b);
            }, 0);

          subTotalTax = subTotalTax.add(subTotalTaxValue);

          // subtract subTotalTax if totalCardDiscount > 0
          // subTotalTax = subTotalTax.subtract(discount);
          subTotalTax = subTotalTax
            .multiply(
              Money.__instance.currency(100).subtract(globalDiscountPercent)
            )
            .divide(100);

          if (!taxConfig.priceExclude)
            taxMoney = taxMoney.add(
              subTotalTax.multiply(tax3Value).divide(100)
            );
          else
            taxMoney = subTotalTax.subtract(
              subTotalTax.divide((100 + tax3Value) / 100)
            );
          totalTax = totalTax.add(taxMoney);
          taxObj.push({
            taxName: taxConfig.tax3Name,
            totalTax: totalTax.value,
          });
        }
      }

      if (!taxConfig.priceExclude) {
        total = total.add(totalTax);
      }
    }

    //rounding here
    var selectedPaymentMethods =
      Money.__instance.paymentMethods.filter((paymentMethod) => {
        return (
          paymentMethod.type == userSelectedPaymentMethodType &&
          paymentMethod.enable &&
          paymentMethod.beDefault
        );
      }) || [];
    console.log("Selected Payment Method ---- ", selectedPaymentMethods);
    if (selectedPaymentMethods.length > 0) {
      // console.log(total.value);
      var roundedTotal = total.value;
      if (userSelectedPaymentMethodType != 1) {
        roundedTotal = Money.round(
          total.value,
          selectedPaymentMethods[0].rounding,
          selectedPaymentMethods[0].roundType
        );
      }
      // console.log(roundedTotal);
      total.value = roundedTotal;
    }

    if (hasAdjustByeOneGetOneFree) {
      return {
        subTotal: subTotal.value,
        total: total.value,
        totalTax: totalTax.value,
        taxObj: taxObj,
        discount: discount.value,
        deliveryFee: deliveryFee.value,
        originalDeliveryFee: originalDeliveryFee.value,
        selectedPromotions: selectedPromotions,
        buyOneGetOneFreePromotions: buyOneGetOneFreePromotions,
        orderItems: currentOrderItems,
      };
    }

    return {
      subTotal: subTotal.value,
      total: total.value,
      totalTax: totalTax.value,
      taxObj: taxObj,
      discount: discount.value,
      deliveryFee: deliveryFee.value,
      originalDeliveryFee: originalDeliveryFee.value,
      selectedPromotions: selectedPromotions,
      orderItems: currentOrderItems,
    };
  };

  static orderPriceRoundForFetchOrder = (value) => {
    let paymentMethods = Money.__instance.paymentMethods;
    var roundedValue = value;
    let defaultPOSPaymentMethod =
      paymentMethods.filter((paymentMethod) => {
        return paymentMethod.beDefault;
      }) || [];
    if (defaultPOSPaymentMethod.length > 0) {
      roundedValue = Money.round(
        value,
        defaultPOSPaymentMethod[0].rounding,
        defaultPOSPaymentMethod[0].roundType
      );
      console.log("roundedValue: ", roundedValue);
    }
    return roundedValue;
  };

  static modifierPrice = (modPrice, qty) => {
    let paymentMethods = Money.__instance.paymentMethods;
    let totalModPrice = Money.__instance.currency(modPrice);
    totalModPrice = totalModPrice.multiply(qty);
    let roundedValue = totalModPrice.value;
    let defaultPOSPaymentMethod =
      paymentMethods.filter((paymentMethod) => {
        return paymentMethod.beDefault;
      }) || [];
    if (defaultPOSPaymentMethod.length > 0) {
      roundedValue = Money.round(
        roundedValue,
        defaultPOSPaymentMethod[0].rounding,
        defaultPOSPaymentMethod[0].roundType
      );
    }
    return roundedValue;
  };

  static itemPriceWithQtyMinusModifers = (singleItemPrice, qty) => {
    let priceWithQty = Money.__instance.currency(0);
    let singleItemMoney = Money.__instance.currency(singleItemPrice);
    priceWithQty = singleItemMoney.multiply(qty);
    let roundedValue = priceWithQty.value;
    let paymentMethods = Money.__instance.paymentMethods;
    let defaultPOSPaymentMethod =
      paymentMethods.filter((paymentMethod) => {
        return paymentMethod.beDefault;
      }) || [];
    if (defaultPOSPaymentMethod.length > 0) {
      roundedValue = Money.round(
        roundedValue,
        defaultPOSPaymentMethod[0].rounding,
        defaultPOSPaymentMethod[0].roundType
      );
    }
    return roundedValue;
  };

  static orderPriceWithPOS = (order, orderItems) => {
    let taxConfig = Money.__instance.taxConfig;
    let paymentMethods = Money.__instance.paymentMethods;
    let currentOrderItems = [...orderItems];
    let autoSurcharge = taxConfig.autoSurcharge;
    let serviceChargeName = taxConfig.surchargeName;
    let serviceAmount = taxConfig.surchargeAmount;
    let servicePercent = taxConfig.surchargePercentage;

    let subTotal = Money.__instance.currency(0);
    let subDiscountTotal = Money.__instance.currency(0);
    let total = Money.__instance.currency(0);
    let totalTax = Money.__instance.currency(0);
    let calculatedServiceAmount = null;
    let taxObj = [];

    /* let userSelectedPaymentMethod = "";
    let userSelectedPaymentMethodType = 0; */

    console.log(" >>>>>> Payment Method Removed <<<<<<");
    let defaultPOSPaymentMethod =
      paymentMethods.filter((paymentMethod) => {
        return paymentMethod.beDefault;
      }) || [];
    /* 
    if (
      order.paymentMethod === CASH_DELIVERY ||
      order.paymentMethod === CASH_PICKUP
    ) {
      userSelectedPaymentMethod = "Cash";
      userSelectedPaymentMethodType = 0;
    } else if (
      order.paymentMethod === CARD_DELIVERY ||
      order.paymentMethod === CARD_PICKUP
    ) {
      userSelectedPaymentMethod = "Card";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === CMB_DELIVERY ||
      order.paymentMethod === CMB_PICKUP
    ) {
      userSelectedPaymentMethod =
        "Call me back and I'll tell you my card details";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === PAY_LAH_DELIVERY ||
      order.paymentMethod === PAY_LAH_PICKUP
    ) {
      userSelectedPaymentMethod = "PayLah";
      userSelectedPaymentMethodType = 1;
    } else if (
      order.paymentMethod === PAY_NOW_DELIVERY ||
      order.paymentMethod === PAY_NOW_PICKUP
    ) {
      userSelectedPaymentMethod = "PayNow";
      userSelectedPaymentMethodType = 1;
    } */

    for (let item of orderItems) {
      subTotal = subTotal.add(item.priceSum);
    }

    total = total.add(subTotal);

    if (autoSurcharge && serviceAmount && serviceAmount > 0) {
      if (servicePercent) {
        calculatedServiceAmount = subTotal.multiply(serviceAmount).divide(100);
        taxObj.push({
          taxName: serviceChargeName,
          totalTax: calculatedServiceAmount,
        });
      } else {
        calculatedServiceAmount = Money.__instance.currency(serviceAmount);
        taxObj.push({
          taxName: serviceChargeName,
          totalTax: calculatedServiceAmount,
        });
      }
    }

    let totalTax1 = Money.__instance.currency(0);
    let totalTax2 = Money.__instance.currency(0);
    let totalTax3 = Money.__instance.currency(0);

    if (taxConfig.tax1Value !== null && taxConfig.enable) {
      let subTotalTax = Money.__instance.currency(0);

      for (let item of orderItems) {
        if (item.tax1Id !== null) {
          subTotalTax = subTotalTax.add(item.priceSum);
        }
      }

      if (subTotalTax.value !== 0) {
        if (taxConfig.applySurcharge && calculatedServiceAmount !== null) {
          let subFeeAmt = subTotalTax
            .multiply(calculatedServiceAmount)
            .divide(subTotal);
          subTotalTax = subTotalTax.add(subFeeAmt);
        }

        if (!taxConfig.priceExclude)
          totalTax1 = subTotalTax.multiply(taxConfig.tax1Value).divide(100);
        else
          totalTax1 = subTotalTax.subtract(
            subTotalTax.divide((100 + taxConfig.tax1Value) / 100)
          );

        taxObj.push({
          taxName: taxConfig.tax1Name,
          totalTax: totalTax1,
        });
      }
    }

    if (taxConfig.tax2Value !== null && taxConfig.enable) {
      let subTotalTax = Money.__instance.currency(0);

      for (let item of orderItems) {
        if (item.tax2Id !== null) {
          subTotalTax = subTotalTax.add(item.priceSum);
        }
      }

      if (subTotalTax.value !== 0) {
        if (taxConfig.applySurcharge && calculatedServiceAmount !== null) {
          let subFeeAmt = subTotalTax
            .multiply(calculatedServiceAmount)
            .divide(subTotal);
          subTotalTax = subTotalTax.add(subFeeAmt);
        }

        if (totalTax1.value !== 0) {
          subTotalTax = subTotalTax.add(totalTax1);
        }

        if (!taxConfig.priceExclude)
          totalTax2 = subTotalTax.multiply(taxConfig.tax2Value).divide(100);
        else
          totalTax2 = subTotalTax.subtract(
            subTotalTax.divide((100 + taxConfig.tax2Value) / 100)
          );

        taxObj.push({
          taxName: taxConfig.tax2Name,
          totalTax: totalTax2,
        });
      }
    }

    if (taxConfig.tax3Value !== null && taxConfig.enable) {
      let subTotalTax = Money.__instance.currency(0);
      for (let item of orderItems) {
        if (item.tax3Id !== null) {
          subTotalTax = subTotalTax.add(item.priceSum);
        }
      }

      if (subTotalTax.value !== 0) {
        if (taxConfig.applySurcharge && calculatedServiceAmount !== null) {
          let subFeeAmt = subTotalTax
            .multiply(calculatedServiceAmount)
            .divide(subTotal);
          subTotalTax = subTotalTax.add(subFeeAmt);
        }

        if (totalTax1.value !== null) {
          subTotalTax = subTotalTax.add(totalTax1);
        }

        if (totalTax2.value !== null) {
          subTotalTax = subTotalTax.add(totalTax2);
        }

        if (!taxConfig.priceExclude)
          totalTax3 = subTotalTax.multiply(taxConfig.tax3Value).divide(100);
        else
          totalTax3 = subTotalTax.subtract(
            subTotalTax.divide((100 + taxConfig.tax3Value) / 100)
          );

        taxObj.push({
          taxName: taxConfig.tax3Name,
          totalTax: totalTax3,
        });
      }
    }

    totalTax = totalTax.add(totalTax1).add(totalTax2).add(totalTax3);

    let subTotalExcludeTax = Money.__instance.currency(0);

    if (taxConfig.priceExclude) {
      subTotalExcludeTax = subTotal.subtract(totalTax);
    } else {
      subTotalExcludeTax = subTotal;
    }

    total = subTotalExcludeTax.add(totalTax).add(calculatedServiceAmount);

    /* 
    //rounding here
    var selectedPaymentMethods =
      Money.__instance.paymentMethods.filter((paymentMethod) => {
        return (
          paymentMethod.type == userSelectedPaymentMethodType &&
          paymentMethod.enable &&
          paymentMethod.beDefault
        );
      }) || [];
    console.log("Selected Payment Method ---- ", selectedPaymentMethods);
    if (selectedPaymentMethods.length > 0) {
      // console.log(total.value);
      var roundedTotal = total.value;
      if (userSelectedPaymentMethodType != 1) {
        roundedTotal = Money.round(
          total.value,
          selectedPaymentMethods[0].rounding,
          selectedPaymentMethods[0].roundType
        );
      }
      console.log("roundedTotal: ", roundedTotal);
      total.value = roundedTotal;
    }
     */

    console.log("defaultPOSPaymentMethod: ", defaultPOSPaymentMethod);
    if (defaultPOSPaymentMethod.length > 0) {
      var roundedTotal = total.value;
      roundedTotal = Money.round(
        total.value,
        defaultPOSPaymentMethod[0].rounding,
        defaultPOSPaymentMethod[0].roundType
      );
      console.log("roundedTotal: ", roundedTotal);
      total.value = roundedTotal;
    }

    return {
      subTotal: subTotal.value,
      total: total.value,
      totalTax: totalTax.value,
      taxObj,
      discount: 0,
      deliveryFee: 0,
      originalDeliveryFee: 0,
      selectedPromotions: [],
      orderItems: currentOrderItems,
    };
  };
}
