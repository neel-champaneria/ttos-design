import {
  INCREASE_QUANTITY,
  DECREASE_QUANTITY,
  CREATE_ORDERING_ITEM,
  SET_MODIFIER,
} from "../constants";
import currency from "currency.js";
import { Money } from "../utils/money";
const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ORDERING_ITEM:
      return action.payload;

    case INCREASE_QUANTITY:
      let plusQty = state.qty + 1;
      return {
        ...state,
        priceSum: Money.calcPrice(state.price, plusQty, state.modifierPriceSum),
        qty: plusQty,
      };

    case DECREASE_QUANTITY:
      let minusQty = state.qty - 1;
      if (state.qty > 1) {
        return {
          ...state,
          qty: minusQty,
          priceSum: Money.calcPrice(
            state.price,
            minusQty,
            state.modifierPriceSum
          ),
        };
      } else {
        return state;
      }

    case SET_MODIFIER:
      let modifiers = action.payload;

      // sum price of selected modifiers
      const modifierPriceSum = modifiers
        .map((modifier) => {
          return modifier.price;
        })
        .reduce((a, b) => {
          return Money.sum(a, b);
        }, 0);

      // replace modifier id key to modifierId
      const finalModifierArr = modifiers.map((modifier) => {
        for (let key in modifier) {
          if (!modifier.modifierId) {
            let newObj;
            newObj = {
              ...modifier,
              modifierId: modifier.id,
            };
            delete newObj.id;
            return newObj;
          } else {
            return modifier;
          }
        }
        return modifier;
      });

      console.log(" >> finalModifierArr: << ", finalModifierArr);

      return {
        ...state,
        modifiers: finalModifierArr,
        modifierPriceSum,
        priceSum: Money.calcPrice(state.price, state.qty, modifierPriceSum),
      };

    default:
      return state;
  }
};
