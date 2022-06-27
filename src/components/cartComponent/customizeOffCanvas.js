import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Button, Form, Toast, ToastContainer } from "react-bootstrap";
import { Money } from "../../utils/money";
import CustomizeModGrpListComp from "./customizeModGrpListComp";
import { modifyItemInCart } from "../../actions/OrderingCartAction";
import {
  decreaseQuantityAction,
  increaseQuantityAction,
} from "../../actions/OrderingItemAction";

const CustomizeOffCanvas = ({ cartItem, closeCustomizePopper }) => {
  const dispatch = useDispatch();
  const menu = useSelector((state) => state.menuReducer) || [];
  const orderingItem = useSelector((state) => state.orderingItemReducer);
  const orderingCart = useSelector((state) => state.orderingCartReducer);
  const [originalItemFromMenu, setOriginalItemFromMenu] = useState({});

  const [
    isModifiersWithMinQtySelectedProperly,
    setIsModifiersWithMinQtySelectedProperly,
  ] = useState(false);

  const [
    modifierGroupObjectWithMinQty_isRequired,
    setModifierGroupObjectWithMinQty_isRequired,
  ] = useState([]);

  const [additionalNote, setAdditionalNote] = useState(
    orderingItem?.additionalNote || ""
  );

  const [showValidationMsg, setShowValidationMsg] = useState(false);

  const [requireModifierGroupsName, setRequireModifierGroupName] = useState([]);

  const onIncreaseQuantity = () => {
    dispatch(increaseQuantityAction());
  };

  const onDecreaseQuantity = () => {
    dispatch(decreaseQuantityAction());
  };

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

  const onConfirmModification = () => {
    if (!isModifiersWithMinQtySelectedProperly) {
      setShowValidationMsg(true);
      const tempRequireModifierGroupsName =
        modifierGroupObjectWithMinQty_isRequired.map(
          (modGroup) => modGroup.name
        );
      setRequireModifierGroupName(tempRequireModifierGroupsName);
      // console.log("not modifying");
      return;
    }
    const data = { ...orderingItem, additionalNote };
    dispatch(modifyItemInCart(data));
    closeCustomizePopper();
    // console.log("modifying");
  };

  useEffect(() => {
    if (menu.length > 0) {
      /* const [itemCategory] = menu.filter(
        (category) => category.name === cartItem.catName
      );
      console.log("customizeOffCanvas itemCategory: ", itemCategory);
      const { items } = itemCategory;
      const [singleItem] = items.filter((item) => item.id === cartItem.itemId); */

      let tempItem;
      for (let i = 0; i < menu.length; i++) {
        for (let j = 0; j < menu[i].items.length; j++) {
          if (menu[i].items[j].id === cartItem.itemId) {
            tempItem = menu[i].items[j];
            setOriginalItemFromMenu(tempItem);
            break;
          }
        }
      }
      // console.log("singleItem: ", singleItem);
    }
  }, [menu]);

  return (
    <>
      {originalItemFromMenu ? (
        <CustomizeModGrpListComp
          cartItem={cartItem}
          originalItemFromMenu={originalItemFromMenu}
          checkModifiersWithMinQtySelected={checkModifiersWithMinQtySelected}
        />
      ) : null}

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
            readOnly
            value={orderingItem.qty}
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
          onClick={() => onConfirmModification()}
        >
          Confirm - {Money.moneyFormat(orderingItem.priceSum)}
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

export default CustomizeOffCanvas;
