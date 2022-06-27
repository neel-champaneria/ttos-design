import { useEffect, useState } from "react";
import { Button, Offcanvas } from "react-bootstrap";
import CustomizeOffCanvas from "./customizeOffCanvas";
import { useDispatch, useSelector } from "react-redux";
import { createOrderingItemAction } from "../../actions/OrderingItemAction";
import {
  decreaseQuantityFromCartAction,
  increaseQuantityFromCartAction,
  removeItemFromCartAction,
} from "../../actions/OrderingCartAction";
import { Money } from "../../utils/money";

const SingleItemCart = ({ item }) => {
  const dispatch = useDispatch();
  const orderingCart = useSelector((state) => state.orderingCartReducer);
  const [showCustomizePopper, setShowCutomizePopper] = useState(false);
  const [modifiersList, setModifiersList] = useState(null);

  const openCustomizePopper = () => {
    setShowCutomizePopper(true);
    dispatch(createOrderingItemAction(item));
  };

  const closeCustomizePopper = () => {
    setShowCutomizePopper(false);
  };

  const onIncreaseQuantityFromCart = (itemId, sequence) => {
    dispatch(increaseQuantityFromCartAction(itemId, sequence));
  };

  const onDecreaseQuantityFromCart = (itemId, sequence, qty) => {
    if (qty === 1) {
      onRemoveItemFromCart(itemId, sequence);
    } else {
      dispatch(decreaseQuantityFromCartAction(itemId, sequence));
    }
  };

  const onRemoveItemFromCart = (itemId, sequence) => {
    dispatch(removeItemFromCartAction(itemId, sequence));
  };

  useEffect(() => {
    if (item) {
      const map = item?.modifiers.reduce((acc, e) => {
        const tempObj = {
          modifierId: e.modifierId,
          name: e.name,
          price: e.price,
        };
        const tempStr = JSON.stringify(tempObj);
        return acc.set(tempStr, (acc.get(tempStr) || 0) + 1);
      }, new Map());

      const entriesArr = [...map.entries()];
      const tempModifierList = [];

      for (const entry of entriesArr) {
        const modifier = JSON.parse(entry[0]);
        const quantity = entry[1];
        modifier.qty = quantity * item.qty;
        modifier.totalQtyPrice = Money.modifierPrice(
          modifier.price,
          modifier.qty
        );
        tempModifierList.push(modifier);
      }
      setModifiersList(tempModifierList);
    }
  }, [item, orderingCart]);

  return (
    <>
      <div className="bg-white border-gray p-block container-fluid">
        <div className="row justify-content-md-center">
          <div className="col-5">
            {/* <h2 className="medium_para mb10 mt8"> */}
            <p className="medium_para font_semibold mt8 overflow-wrap">
              {item.name}
            </p>
            {/* </h2> */}
          </div>
          <div className="col-4 d-flex">
            <div className="p-d-flex quantity-increase-decrease-container mr-auto">
              <Button
                className="btn right-border-radius left_quantity h-30 red_bg"
                variant="danger"
                onClick={() => {
                  onDecreaseQuantityFromCart(
                    item.itemId,
                    item.sequence,
                    item.qty
                  );
                }}
              >
                <i className="fa fa-minus"></i>
              </Button>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="input p-text-center p-ml-1 p-mr-1 red_text"
                autoComplete="off"
                required
                readOnly
                value={item.qty}
              />
              <Button
                className="btn left-border-radius right_quantity h-30 red_bg"
                variant="danger"
                onClick={() => {
                  onIncreaseQuantityFromCart(item.itemId, item.sequence);
                }}
              >
                <i className="fa fa-plus"></i>
              </Button>
            </div>
          </div>

          <div className="col-3">
            <p className="medium_para font_semibold mt8 text-right">
              {Money.moneyFormat(
                Money.itemPriceWithQtyMinusModifers(item.price, item.qty)
              )}
              {/* {Money.moneyFormat(item.priceSum)} */}
            </p>
          </div>
        </div>

        <div className="row justify-content-md-center">
          {modifiersList &&
            modifiersList.map((modifier, idx) => {
              return (
                <div
                  key={idx}
                  className="small_para mb10 d-flex justify-content-evenly overflow-wrap"
                  style={{ marginBottom: 0 }}
                >
                  <div className="col-5">
                    {modifier.name} x {modifier.qty}
                  </div>
                  <div className="col-4 d-flex"></div>
                  <div className="col-3 text-right">
                    {Money.moneyFormat(
                      modifier.totalQtyPrice
                      // Money.modifierPrice(modifier.price, modifier.qty)
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {item.additionalNote ? (
          <div className="row justify-content-md-center">
            <h2
              className="medium_para font-bold mt8"
              style={{ marginBottom: 0 }}
            >
              Special Instructions
            </h2>
            <p
              className="small_para font_semibold overflow-wrap"
              style={{ marginBottom: 0 }}
            >
              {item.additionalNote}
            </p>
          </div>
        ) : null}

        <p
          className="medium_para mb0 pb0 red_font mt10"
          onClick={openCustomizePopper}
        >
          Customise
        </p>
      </div>

      <div className="d-flex justify-content-center">
        <Offcanvas
          show={showCustomizePopper}
          onHide={closeCustomizePopper}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3 className="line_clamp">{item.name}</h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <hr className="solid" />
            <CustomizeOffCanvas
              cartItem={item}
              closeCustomizePopper={closeCustomizePopper}
            />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default SingleItemCart;
