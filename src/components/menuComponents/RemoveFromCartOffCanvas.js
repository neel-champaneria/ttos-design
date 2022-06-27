import Button from "react-bootstrap/Button";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Money } from "./../../utils/money";
import {
  cleanCartAction,
  decreaseQuantityFromCartAction,
  increaseQuantityFromCartAction,
  removeItemFromCartAction,
  saveOrderingInfoToCartAction,
} from "../../actions/OrderingCartAction";

const RemoveFromCartOffCanvas = ({
  alreadyAddedObjectInCart,
  setAlreadyAddedInCart,
  setShowRemoveFromCartPopper,
}) => {
  const orderingCart = useSelector((state) => state.orderingCartReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (alreadyAddedObjectInCart.length === 0) {
      setAlreadyAddedInCart(false);
      setShowRemoveFromCartPopper(false);
    }
  }, [alreadyAddedObjectInCart, orderingCart]);

  const onIncreaseQuantityFromCart = (itemId, sequence) => {
    dispatch(increaseQuantityFromCartAction(itemId, sequence));
  };

  const onDecreaseQuantityFromCart = (itemId, sequence) => {
    dispatch(decreaseQuantityFromCartAction(itemId, sequence));
  };

  const onRemoveItemFromCart = (itemId, sequence) => {
    dispatch(removeItemFromCartAction(itemId, sequence));
  };

  return (
    <>
      {alreadyAddedObjectInCart.map((obj, idx) => (
        <div key={idx} className="row justify-content-md-center mb20">
          <div className="col-4">
            <p className="medium_para mb0">{obj.name}</p>
            {obj.modifiers.map((modifier, idx) => (
              <p
                className="medium_para mb0"
                key={`${modifier.name} + ${idx.toString()}`}
              >
                {modifier.name}
              </p>
            ))}
          </div>
          <div className="light_pink small_range col-4">
            <div className="p-d-flex quantity-increase-decrease-container mr-auto ">
              <Button
                className="btn right-border-radius left_quantity h-35"
                variant="danger"
                onClick={() => {
                  onDecreaseQuantityFromCart(obj.itemId, obj.sequence);
                }}
              >
                <i className="fa fa-minus"></i>
              </Button>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="input p-text-center p-ml-1 p-mr-1"
                autoComplete="off"
                required
                value={obj.qty}
                readOnly
              />
              <Button
                className="btn left-border-radius right_quantity h-35"
                variant="danger"
                onClick={() => {
                  onIncreaseQuantityFromCart(obj.itemId, obj.sequence);
                }}
              >
                <i className="fa fa-plus"></i>
              </Button>
            </div>
          </div>
          <div className="col-3 pt5">
            <p className="medium_para mb0">{Money.moneyFormat(obj.priceSum)}</p>
          </div>
          <div
            className="col-1 mt3-3 cursor-pointer text-right pt5"
            onClick={() => {
              onRemoveItemFromCart(obj.itemId, obj.sequence);
            }}
          >
            <i className="fa fa-trash" aria-hidden="true"></i>
          </div>
        </div>
      ))}
    </>
  );
};

export default RemoveFromCartOffCanvas;
