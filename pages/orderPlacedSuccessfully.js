import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useEffect } from "react";
import { cleanCartAction } from "../src/actions/OrderingCartAction";
import { useRouter } from "next/router";

const OrderPlacedSuccessfully = () => {
  const qrConfig = useSelector((state) => state.appReducer?.qrConfig);
  const restaurantProfile = useSelector((state) => state.resReducer);
  const qrInfo = useSelector((state) => state.QrReducer);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(cleanCartAction());
  }, []);

  return (
    <>
      <div className="mb-2">
        <div className="text-center text-white table_strip">
          TABLE {qrInfo.tableName}
        </div>
      </div>
      <div className="thankyou_cart text-center">
        <div className="top_thank">
          <img src="/thankyou.png" className="mb30" />
          <h1 className="font-bold">Thank You!</h1>
          <p className="title-font font-bold mb20">for your order</p>
          <p className="medium_para bg-green text-center">
            Your order is now being processed.
          </p>
          {qrConfig.isPAM && qrConfig.qrPaymentType == "COUNTER" ? (
            <p className="medium_para mb70">
              Please proceed to pay at the counter after your delicious meal.
              Thank you.
            </p>
          ) : null}
        </div>
        {/* <img src="/big-eatery.png" className="mb30" /> */}

        {restaurantProfile?.logo ? (
          <>
            <div className="mt15">
              <img
                className="company-logo mb30"
                alt="Logo"
                src={restaurantProfile.logo}
              ></img>
            </div>
          </>
        ) : null}

        {qrConfig.isPAM ? (
          <button
            className="btn red-btn w100 big_btn"
            onClick={() => {
              router.replace("/order");
            }}
          >
            ORDER HISTORY
          </button>
        ) : null}
        <Link href="/">
          <p className="item_title mt15 font-bold">Back To Home</p>
        </Link>
      </div>
    </>
  );
};

export default OrderPlacedSuccessfully;
