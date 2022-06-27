import Link from "next/link";
import { Money } from "../../utils/money";

const CartInfoComponent = ({ numOfQty, total, subTotal }) => {
  return (
    <>
      <div className="bottom_cart">
        <div className="red_block">
          <div className="d-flex">
            <div className="mr-auto left_section">
              <p className="light mb8">
                {numOfQty} {numOfQty > 1 ? "Items" : "Item"}
              </p>
              <p className="font-bold mb0">{Money.moneyFormat(total)}</p>
            </div>
            <div className="right_section">
              <Link href="/cart">
                <h4 className="pt15 cursor-pointer">GO TO CART</h4>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartInfoComponent;
