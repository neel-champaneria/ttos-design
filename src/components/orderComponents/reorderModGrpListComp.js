import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setModifierAction } from "../../actions/OrderingItemAction";
import { Money } from "../../utils/money";
import { sortModifierGroupItems, sortModifiers } from "../../utils/utils";
import { Form, Button } from "react-bootstrap";

const ReorderModGrpListComp = ({
  itemFromOrderHistory,
  itemFromMenu,
  checkModifiersWithMinQtySelected,
  availableSelectedModifiers,
}) => {
  const dispatch = useDispatch();

  // console.log("itemFromOrderHistory: ", itemFromOrderHistory);
  const [modifierIds, setModifierIds] = useState([]);

  const [currentModSeq, setCurrentModSeq] = useState(
    itemFromOrderHistory.orderItemModifiers[
      itemFromOrderHistory.orderItemModifiers.length - 1
    ]?.seq + 1 || 0
  );

  const [modifiers, setModifiers] = useState([]);

  const [
    modifierGroupIdWithMinQty_isRequired,
    setModifierGroupIdWithMinQty_isRequired,
  ] = useState([]);

  const [
    modifierGroupObjectWithMinQty_isRequired,
    setModifierGroupObjectWithMinQty_isRequired,
  ] = useState([]);

  const [addToCartConfirm, setAddToCartConfirm] = useState(false);

  useEffect(() => {
    // console.log("itemFromMenu: ", itemFromMenu);
    setModifiers([...availableSelectedModifiers]);
    const tempModifierIds = availableSelectedModifiers.map(
      (modifier) => modifier.modifierId
    );
    setModifierIds([...tempModifierIds]);
    dispatch(setModifierAction(availableSelectedModifiers));
  }, [availableSelectedModifiers, dispatch]);

  useEffect(() => {
    if (Object.keys(itemFromMenu).length > 0) {
      const { modifierGroupItems } = itemFromMenu;
      // console.log("modifierGroupItems: ", modifierGroupItems);
      const tempModifierGroupIdWithMinQty_isRequired = [];
      const tempModifierGroupObjectWithMinQty_isRequired = [];
      // console.log("modifierGroupItems: ", modifierGroupItems);
      // console.log("modifierGroupItems.length: ", modifierGroupItems.length);
      for (let i = 0; i < modifierGroupItems.length; i++) {
        const { minQty, modifierGroup } = modifierGroupItems[i];
        const { id: modifierGroupId, modifiers } = modifierGroup;
        if (minQty > 0) {
          tempModifierGroupIdWithMinQty_isRequired.push(modifierGroupId);
          tempModifierGroupObjectWithMinQty_isRequired.push(modifierGroup);
        }
      }

      for (let i = 0; i < modifierGroupItems.length; i++) {
        const currentModifierGroup = modifierGroupItems[i];
        const { minQty, modifierGroup } = modifierGroupItems[i];
        const { id: modifierGroupId, modifiers } = modifierGroup;
        const currentModifierGroupIdWithMinQtyIndex =
          tempModifierGroupIdWithMinQty_isRequired.indexOf(modifierGroupId);

        if (minQty > 0) {
          const foundAllSelectedModifierWithMinQty = modifierIds
            .map((selectedModId) => {
              let tempId;
              modifiers.map((mod) => {
                if (selectedModId === mod.id) {
                  tempId = selectedModId;
                }
              });
              return tempId;
            })
            .filter(Boolean);

          if (foundAllSelectedModifierWithMinQty.length >= minQty) {
            tempModifierGroupIdWithMinQty_isRequired.splice(
              currentModifierGroupIdWithMinQtyIndex,
              1
            );
            tempModifierGroupObjectWithMinQty_isRequired.splice(
              currentModifierGroupIdWithMinQtyIndex,
              1
            );
          }
        }
      }

      setModifierGroupIdWithMinQty_isRequired(
        tempModifierGroupIdWithMinQty_isRequired
      );
      setModifierGroupObjectWithMinQty_isRequired(
        tempModifierGroupObjectWithMinQty_isRequired
      );
    }
  }, [modifierIds, itemFromMenu]);

  useEffect(() => {
    let isSelected = true;
    if (modifierGroupIdWithMinQty_isRequired.length > 0) {
      isSelected = false;
    }
    checkModifiersWithMinQtySelected(
      isSelected,
      modifierGroupObjectWithMinQty_isRequired
    );
  }, [modifierGroupIdWithMinQty_isRequired]);

  const onIncreaseModifierQuantity = (
    event,
    modifier,
    minQty,
    maxQty,
    modGroup
  ) => {
    if (event) {
      event.stopPropagation();
    }

    setCurrentModSeq(currentModSeq + 1);
    const tempModifier = {
      ...modifier,
      seq: currentModSeq,
    };

    const tempModifierIds = [...modifierIds];
    const tempModifiers = [...modifiers];

    tempModifierIds.push(tempModifier.id);
    tempModifiers.push(tempModifier);

    // calc total selected modifier quantity of a mod group
    const totalModifierQty = modGroup.modifiers
      .map((itm) => {
        return tempModifierIds.filter((id) => id === itm.id).length;
      })
      .reduce((a, b) => a + b);

    // prevent add more modifiers if maxQty > 0 && exceed maximum allow
    if (maxQty > 0 && totalModifierQty > maxQty) return;

    setModifierIds(tempModifierIds);
    setModifiers(tempModifiers);
    dispatch(setModifierAction(tempModifiers));
  };

  const onDecreaseModifierQuantity = (
    event,
    modifier,
    minQty,
    maxQty,
    modGroup
  ) => {
    event.stopPropagation();
    const tempModifierIds = [...modifierIds];
    const tempModifiers = [...modifiers];
    const index = tempModifierIds.indexOf(modifier.id);
    if (index > -1) {
      tempModifierIds.splice(index, 1);
      tempModifiers.splice(index, 1);
    }
    setModifierIds(tempModifierIds);
    setModifiers(tempModifiers);

    dispatch(setModifierAction(tempModifiers));
  };

  const countSelectedModifierId = (modifierId) => {
    let count;
    const filterArr = modifierIds.filter((itm) => itm === modifierId);
    count = filterArr.length;
    return count;
  };

  const onRadioModifierChange = (event, modifier, minQty, maxQty, modGroup) => {
    const { modifiers: allModifiersOfGroup } = modGroup;
    let alreadySelectedIdFromRadioGroup;
    let alredaySelectedModifierFromRadioGroup;
    for (let i = 0; i < modifierIds.length; i++) {
      for (let j = 0; j < allModifiersOfGroup.length; j++) {
        if (modifierIds[i] === allModifiersOfGroup[j].id) {
          alreadySelectedIdFromRadioGroup = modifierIds[i];
          alredaySelectedModifierFromRadioGroup = allModifiersOfGroup[j];
          break;
        }
      }
    }

    const tempModifierIds = [...modifierIds];
    const tempModifiers = [...modifiers];

    const index = tempModifierIds.indexOf(alreadySelectedIdFromRadioGroup);

    if (index > -1) {
      tempModifierIds.splice(index, 1);
      tempModifiers.splice(index, 1);
    }

    setCurrentModSeq(currentModSeq + 1);
    const tempModifier = {
      ...modifier,
      seq: currentModSeq,
    };

    tempModifierIds.push(tempModifier.id);
    tempModifiers.push(tempModifier);

    // calc total selected modifier quantity of a mod group
    const totalModifierQty = modGroup.modifiers
      .map((itm) => {
        return tempModifierIds.filter((id) => id === itm.id).length;
      })
      .reduce((a, b) => a + b);

    // prevent add more modifiers if maxQty > 0 && exceed maximum allow
    if (maxQty > 0 && totalModifierQty > maxQty) return;

    setModifierIds(tempModifierIds);
    setModifiers(tempModifiers);
    dispatch(setModifierAction(tempModifiers));
  };

  return (
    <>
      {modifierIds &&
        sortModifierGroupItems(
          itemFromMenu.modifierGroupItems,
          "asc",
          "sequence"
        ).map((modifierGroupItem) => {
          // console.log("modifierIds: ", modifierIds);
          const {
            minQty,
            maxQty = 0,
            modifierGroup: modGroup,
          } = modifierGroupItem;

          let modifierConditionText = "";
          let isModGroupEnable = false;

          for (let i = 0; i < modGroup.modifiers.length; i++) {
            const disableItemList =
              modGroup.modifiers[i]?.disableItemList || "";
            if (!disableItemList.includes(itemFromMenu.id + ",")) {
              isModGroupEnable = true;
              break;
            }
          }

          if (minQty > 0) {
            if (maxQty > 0) {
              modifierConditionText = `(At least ${minQty} and allow max ${maxQty})`;
            } else {
              modifierConditionText = `(At least ${minQty})`;
            }
          }

          if (isModGroupEnable) {
            return (
              /* To render modifier group with radio buttons */
              <div key={modGroup.id} id={`modGroup_${modGroup.id}`}>
                {minQty === 1 && maxQty === 1 ? (
                  <div className="mb-3">
                    <p className="font-bold mb0">{modGroup.name}</p>
                    <p className="small_para half-opacity">
                      {modifierConditionText}
                    </p>
                    {sortModifiers(modGroup.modifiers, "asc", "price").map(
                      (modifier) => {
                        const disableItemList = modifier?.disableItemList || "";
                        if (disableItemList.includes(itemFromMenu.id + ","))
                          return;
                        return (
                          <div className="d-flex mb5" key={modifier.id}>
                            <Form.Check
                              type="radio"
                              name={modGroup.name}
                              value={modifier.name}
                              label={modifier.name}
                              checked={countSelectedModifierId(modifier.id)}
                              onChange={() => {
                                onRadioModifierChange(
                                  event,
                                  modifier,
                                  minQty,
                                  maxQty,
                                  modGroup
                                );
                              }}
                              className="mr-auto"
                            />
                            <p
                              className={
                                countSelectedModifierId(modifier.id)
                                  ? "medium_para mb0"
                                  : "medium_para mb0 disabled"
                              }
                            >
                              {Money.moneyFormat(modifier.price)}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  /* To render modifier list with minus and plus buttons */
                  <div className="mb-3">
                    <p className="font-bold mb0">{modGroup.name}</p>
                    <p className="small_para half-opacity">
                      {modifierConditionText}
                    </p>
                    {sortModifiers(modGroup.modifiers, "asc", "price").map(
                      (modifier) => {
                        const disableItemList = modifier?.disableItemList || "";
                        if (disableItemList.includes(itemFromMenu.id + ","))
                          return;
                        return (
                          <div
                            className="row mb20 justify-content-between"
                            key={modifier.id}
                          >
                            <div className="col-5">
                              <p className={"medium_para mb0 mr-auto"}>
                                {modifier.name}
                              </p>
                            </div>
                            <div className="light_pink col-4 small_range">
                              <div className="p-d-flex quantity-increase-decrease-container mr-auto ">
                                <Button
                                  className="btn right-border-radius left_quantity h-35"
                                  variant="danger"
                                  onClick={(event) => {
                                    onDecreaseModifierQuantity(
                                      event,
                                      modifier,
                                      minQty,
                                      maxQty,
                                      modGroup
                                    );
                                  }}
                                >
                                  <i className="fa fa-minus"></i>
                                </Button>
                                <input
                                  type="number"
                                  pInputText
                                  id="quantity"
                                  name="quantity"
                                  className="input p-text-center p-ml-1 p-mr-1"
                                  autoComplete="off"
                                  required
                                  readOnly
                                  value={countSelectedModifierId(modifier.id)}
                                />
                                <Button
                                  className="btn left-border-radius right_quantity h-35"
                                  variant="danger"
                                  onClick={(event) => {
                                    onIncreaseModifierQuantity(
                                      event,
                                      modifier,
                                      minQty,
                                      maxQty,
                                      modGroup
                                    );
                                  }}
                                >
                                  <i className="fa fa-plus"></i>
                                </Button>
                              </div>
                            </div>
                            <div className="col-3">
                              <p className={"medium_para mb0 text-right"}>
                                {Money.moneyFormat(modifier.price)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            );
          }
        })}
    </>
  );
};

export default ReorderModGrpListComp;
