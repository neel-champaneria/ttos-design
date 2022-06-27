import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Offcanvas, Button } from "react-bootstrap";

import { createOrderingItemAction } from "../../actions/OrderingItemAction";
import { sortModifierGroupItems, sortModifiers } from "../../utils/utils";
import { Money } from "../../utils/money";

import AddToCartOffCanvas from "./AddToCartOffCanvas";
import RemoveFromCartOffCanvas from "./RemoveFromCartOffCanvas";

const SingleItem = ({ category, item }) => {
  const orderingCart = useSelector((state) => state.orderingCartReducer);

  const [itemPrice, setItemPrice] = useState(item.price);
  let priceFromModId = 0;
  let priceFromModifier = null;
  let priceFromModifierGroupItem = null;

  const [alreadyAddedInCart, setAlreadyAddedInCart] = useState(false);
  const [alreadyAddedObjectInCart, setAlredayAddedObjectInCart] = useState([]);
  const [alreadyAddedQty, setAlreadyAddedQty] = useState(0);

  useEffect(() => {
    if (orderingCart?.orderItems.length > 0) {
      const { orderItems } = orderingCart;
      const tempAddedObjects = [];
      const tempQty = 0;
      for (let i = 0; i < orderItems.length; i++) {
        if (orderItems[i].itemId === item.id) {
          setAlreadyAddedInCart(true);
          tempQty += orderItems[i].qty;
          tempAddedObjects.push(orderItems[i]);
        }
      }
      setAlredayAddedObjectInCart(tempAddedObjects);
      setAlreadyAddedQty(tempQty);
    } else {
      setAlredayAddedObjectInCart([]);
    }
  }, [orderingCart]);

  if (parseFloat(itemPrice, 0) == 0) {
    let modifiersGroupItems = item?.modifierGroupItems || [];
    if (modifiersGroupItems.length > 0) {
      sortModifierGroupItems(modifiersGroupItems, "asc", "sequence");
      let modifiersGroupItem = modifiersGroupItems[0];
      let temp = sortModifiers(
        modifiersGroupItem.modifierGroup.modifiers,
        "asc",
        "price"
      );
      for (let i = 0; i < temp.length; i++) {
        if (
          temp[i].enable &&
          !(temp[i]?.disableItemList || "").includes(item.id + ",") &&
          temp[i].price > 0
        ) {
          itemPrice = temp[i].price;
          priceFromModId = temp[i].id;
          priceFromModifier = temp[i];
          priceFromModifierGroupItem = modifiersGroupItem;
          break;
        }
      }
    }
  }

  const [showAddToCartPopper, setShowAddToCartPopper] = useState(false);
  const [showRemoveFromCartPopper, setShowRemoveFromCartPopper] =
    useState(false);
  const dispatch = useDispatch();

  const offCanvasAddToCartOpen = () => {
    setShowAddToCartPopper(true);
    const tempOrderingItem = {
      name: item.name,
      image: item.image,
      itemId: item.id,
      priceSum: item.price,
      price: item.price,
      tax1Id: item.tax1Id,
      tax2Id: item.tax2Id,
      tax3Id: item.tax3Id,
      qty: 1,
      sequence: 1,
      catName: category.name,
      modifiers: [],
    };
    dispatch(createOrderingItemAction(tempOrderingItem));
  };

  const offCanvasAddToCartClose = () => {
    setShowAddToCartPopper(false);
  };

  const offCanvasRemoveFromCartOpen = () => {
    setShowRemoveFromCartPopper(true);
  };

  const offCanvasRemoveFromCartClose = () => {
    setShowRemoveFromCartPopper(false);
  };

  return (
    <div>
      <div className="item-img-container img-top-rounded">
        <img
          className="d-block img-fluid cover-img img-top-rounded"
          src={item.image ? item.image : "/item-placeholder.png"}
        />
      </div>
      <div className="color-white p-3 img-bottom-rounded">
        <p className="line_clamp height_44 mb5">{item.name}</p>
        <p className="small_para">{Money.moneyFormat(itemPrice)}</p>
        {alreadyAddedInCart ? (
          <div className="d-flex justify-content-between mt-3 ">
            {/* quantity-increase-decrease-container */}
            <Button
              className="red-btn right-border-radius "
              variant="danger"
              onClick={offCanvasRemoveFromCartOpen}
            >
              <i className="fa fa-minus"></i>
            </Button>
            <span className="mid_quantity">
              {
                // alreadyAddedObjectInCart.length
                alreadyAddedQty
              }
            </span>
            <Button
              className="red-btn left-border-radius"
              variant="danger"
              onClick={offCanvasAddToCartOpen}
            >
              <i className="fa fa-plus"></i>
            </Button>
          </div>
        ) : (
          <Button
            className="w-100"
            variant="danger"
            onClick={offCanvasAddToCartOpen}
          >
            Add
          </Button>
        )}
      </div>

      <div className="d-flex justify-content-center">
        <Offcanvas
          show={showAddToCartPopper}
          onHide={offCanvasAddToCartClose}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3 className="line_clamp font-bold">{item.name}</h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <hr className="solid" />
            <AddToCartOffCanvas
              isAddToCartDialogOpen={showAddToCartPopper}
              item={item}
              itemPrice={itemPrice}
              priceFromModId={priceFromModId}
              priceFromModifier={priceFromModifier}
              priceFromModifierGroupItem={priceFromModifierGroupItem}
              offCanvasAddToCartClose={offCanvasAddToCartClose}
            />
          </Offcanvas.Body>
        </Offcanvas>
      </div>

      <div className="d-flex justify-content-center">
        <Offcanvas
          show={showRemoveFromCartPopper}
          onHide={offCanvasRemoveFromCartClose}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3>{item.name}</h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <hr className="solid" />
            <RemoveFromCartOffCanvas
              alreadyAddedObjectInCart={alreadyAddedObjectInCart}
              setAlreadyAddedInCart={setAlreadyAddedInCart}
              setShowRemoveFromCartPopper={setShowRemoveFromCartPopper}
              alreadyAddedInCart={alreadyAddedInCart}
            />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
};

export default SingleItem;
