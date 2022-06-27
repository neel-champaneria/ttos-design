import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { addToCartAction } from "./../../actions/OrderingCartAction";
import {
  createOrderingItemAction,
  decreaseQuantityAction,
  increaseQuantityAction,
} from "./../../actions/OrderingItemAction";

import ModifierGroupListComp from "./ModifierGroupListComp";

import { Money } from "../../utils/money";
import { Form, ToastContainer, Toast, Button } from "react-bootstrap";

const AddToCartOffCanvas = ({
  isAddToCartDialogOpen,
  item,
  priceFromModId,
  priceFromModifier,
  priceFromModifierGroupItem,
  offCanvasAddToCartClose,
}) => {
  const dispatch = useDispatch();

  const orderingItem = useSelector((state) => state.orderingItemReducer);

  /* 
    Below variable work as a flag.
    If the flag is true, then user has selected all values correctly.
    If the flag is false, then user will not be able to add item in cart.
  */
  const [
    isModifiersWithMinQtySelectedProperly,
    setIsModifiersWithMinQtySelectedProperly,
  ] = useState(false);

  /* 
    Below array object contain all the group modifiers which are necessary to be selected by user.
  */
  const [
    modifierGroupObjectWithMinQty_isRequired,
    setModifierGroupObjectWithMinQty_isRequired,
  ] = useState([]);

  /* 
    Below variable stores the additional notes.
    This will also be added in ordering item object.
  */
  const [additionalNote, setAdditionalNote] = useState("");

  /* 
    Below variable works as a flag.
    If the value is true then we have to show the validation message to the user via toast.
  */
  const [showValidationMsg, setShowValidationMsg] = useState(false);

  /* 
    Below array object contains all the modifier group name to be shown in the toast.
  */
  const [requireModifierGroupsName, setRequireModifierGroupName] = useState([]);

  /* 
    Below method will be used by child component. 
    It will change the value of the "isModifiersWithMinQtySelectedProperly" and "modifierGroupObjectWithMinQty_isRequired".
  */
  const checkModifiersWithMinQtySelected = (
    isSelected,
    modifierGroupObjectWithMinQty_isRequired
  ) => {
    setIsModifiersWithMinQtySelectedProperly(isSelected);
    setModifierGroupObjectWithMinQty_isRequired(
      modifierGroupObjectWithMinQty_isRequired
    );
    const tempRequireModifierGroupsName =
      modifierGroupObjectWithMinQty_isRequired.map((modGroup) => modGroup.name);
  };

  /* Below function will run on clicking the add to cart button */
  const onAddToCart = () => {
    if (!isModifiersWithMinQtySelectedProperly) {
      setShowValidationMsg(true);
      const tempRequireModifierGroupsName =
        modifierGroupObjectWithMinQty_isRequired.map(
          (modGroup) => modGroup.name
        );
      setRequireModifierGroupName(tempRequireModifierGroupsName);
      return;
    }
    orderingItem.additionalNote = additionalNote;
    if (orderingItem.name && orderingItem.itemId && orderingItem.qty) {
      dispatch(addToCartAction(orderingItem));
      dispatch(createOrderingItemAction({}));
    }
    offCanvasAddToCartClose();
  };

  /* To increase the quantity of the selected item */
  const onIncreaseQuantity = () => {
    dispatch(increaseQuantityAction());
  };

  /* To decrease the quantity of the selected item */
  const onDecreaseQuantity = () => {
    dispatch(decreaseQuantityAction());
  };

  return (
    <>
      <ModifierGroupListComp
        isAddToCartDialogOpen={isAddToCartDialogOpen}
        item={item}
        priceFromModId={priceFromModId}
        priceFromModifier={priceFromModifier}
        priceFromModifierGroupItem={priceFromModifierGroupItem}
        checkModifiersWithMinQtySelected={checkModifiersWithMinQtySelected}
      />
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Special Instructions</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={240}
            value={additionalNote}
            onChange={(e) => setAdditionalNote(e.target.value)}
          />
        </Form.Group>
      </Form>

      <div className="offcanvas_bottom light_pink d-flex">
        <div className="p-d-flex quantity-increase-decrease-container mr-auto">
          <Button
            className="btn right-border-radius left_quantity h-46"
            variant="danger"
            onClick={() => onDecreaseQuantity()}
          >
            <i className="fa fa-minus"></i>
          </Button>

          <input
            type="number"
            id="quantity"
            name="quantity"
            className="input p-text-center p-ml-1 p-mr-1 h-46"
            autoComplete="off"
            required
            value={orderingItem.qty}
            readOnly
          />

          <Button
            className="btn left-border-radius right_quantity h-46"
            variant="danger"
            onClick={() => onIncreaseQuantity()}
          >
            <i className="fa fa-plus"></i>
          </Button>
        </div>
        <Button
          className="btn red-btn h-46 w100 ml10"
          onClick={() => onAddToCart()}
        >
          ADD - {Money.moneyFormat(orderingItem.priceSum)}
        </Button>
      </div>

      {showValidationMsg && requireModifierGroupsName && (
        <ToastContainer position="top-center" className="mt-5">
          <Toast
            onClose={() => setShowValidationMsg(false)}
            delay={3000}
            autohide
          >
            <Toast.Header>
              <strong>Required Modifiers</strong>
            </Toast.Header>
            <Toast.Body>
              {requireModifierGroupsName.map((groupName) => (
                <li key={groupName}>{groupName}</li>
              ))}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}
    </>
  );
};

export default AddToCartOffCanvas;
