import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { Money } from "../../utils/money";
import ReorderOffcanvas from "./reorderOffcanvas";
import { useDispatch } from "react-redux";
import { createOrderingItemAction } from "../../actions/OrderingItemAction";

const SingleOrderItem = ({ item }) => {
  const [showAddToCartPopper, setShowAddToCartPopper] = useState(false);
  const dispatch = useDispatch();
  const [modifiersList, setModifiersList] = useState(null);

  useEffect(() => {
    if (item) {
      // console.log("singleOrderItem: ", item);
      const map = item.orderItemModifiers.reduce((acc, e) => {
        const tempObj = {
          modifierId: e.modifierId,
          modifierName: e.modifierName,
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
        modifier.qty = quantity * item.quantity;
        modifier.totalQtyPrice = Money.modifierPrice(
          modifier.price,
          modifier.qty
        );
        tempModifierList.push(modifier);
      }
      setModifiersList(tempModifierList);
    }
  }, [item]);

  const offCanvasAddToCartOpen = () => {
    setShowAddToCartPopper(true);
  };

  const offCanvasAddToCartClose = () => {
    setShowAddToCartPopper(false);
  };

  return (
    <>
      <div
        className={`bg-white border-gray p-block container-fluid ${
          item.voidStatus ? " void_order" : ""
        }`}
      >
        <div className="row justify-content-md-center">
          <div className="col-6">
            <h2
              className={`medium_para mt8 overflow-wrap ${
                item.voidStatus ? " void_order" : ""
              }`}
            >
              {item.item.name}
            </h2>
            {item.voidStatus ? (
              <div
                className={`small_para mb10 ${
                  item.voidStatus ? " void_order" : ""
                }`}
              >
                Void
              </div>
            ) : null}
            {/* {item.orderItemModifiers.map((modifier, idx) => {
              return (
                <li
                  key={`${modifier.id}` + `${modifier.seq}`}
                  className={`small_para mb10 ${
                    item.voidStatus ? " void_order" : ""
                  }`}
                  style={{ marginBottom: 0 }}
                >
                  {modifier.modifierName}
                </li>
              );
            })} */}
            {/* <button
              className="reorder_btn"
              onClick={() => offCanvasAddToCartOpen()}
            >
              Reorder
            </button> */}
          </div>

          <div className="col-2">
            <p className="medium_para font_semibold mt8">{item.quantity}</p>
          </div>

          <div className="col-4 text-right">
            <p className="medium_para font_semibold mt8">
              {/* {item.voidStatus ? "-" : Money.moneyFormat(item.priceSum)} */}
              {item.voidStatus
                ? "-"
                : Money.moneyFormat(
                    Money.itemPriceWithQtyMinusModifers(
                      item.price,
                      item.quantity
                    )
                  )}
            </p>
          </div>
        </div>

        {modifiersList && modifiersList.length > 0 ? (
          <div className="row justify-content-md-center mb10">
            {modifiersList &&
              modifiersList.map((modifier, idx) => {
                return (
                  <div
                    key={idx}
                    className={`small_para mb10 d-flex justify-content-evenly overflow-wrap 
                    ${item.voidStatus ? " void_order" : ""}`}
                    style={{ marginBottom: 0 }}
                  >
                    <div className="col-6">
                      {modifier.modifierName} x {modifier.qty}
                    </div>
                    <div className="col-2"></div>
                    <div className="col-4 text-right">
                      {item.voidStatus
                        ? "-"
                        : Money.moneyFormat(modifier.totalQtyPrice)}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : null}

        {item.additionalNote ? (
          <div className="row justify-content-md-center">
            <h2
              className={`medium_para font-bold ${
                item.voidStatus ? " void_order" : ""
              }`}
              style={{ marginBottom: 0 }}
            >
              Special Instructions
            </h2>
            <p
              className={`small_para font_semibold mb10 overflow-wrap ${
                item.voidStatus ? " void_order" : ""
              }`}
            >
              {item.additionalNote}
            </p>
          </div>
        ) : null}

        <div className="row justify-content-md-center">
          <div className="col-6">
            <button
              className="reorder_btn"
              onClick={() => offCanvasAddToCartOpen()}
            >
              Reorder
            </button>
          </div>
          <div className="col-2"></div>
          <div className="col-4"></div>
        </div>
      </div>

      <div className="d-flex justify-content-center">
        <Offcanvas
          show={showAddToCartPopper}
          onHide={offCanvasAddToCartClose}
          placement="bottom"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <h3 className="line_clamp font-bold">{item.item.name}</h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <hr className="solid" />
            <ReorderOffcanvas
              itemFromOrderHistory={item}
              offCanvasAddToCartClose={offCanvasAddToCartClose}
            />
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
};

export default SingleOrderItem;
