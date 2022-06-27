import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cleanCartAction } from "../src/actions/OrderingCartAction";

const PaymentSuccess = () => {
  const qrInfo = useSelector((state) => state.QrReducer);
  const qrConfig = useSelector((state) => state.appReducer?.qrConfig);
  const restaurantProfile = useSelector((state) => state.resReducer);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <>
      <div className="mb-2">
        <div className="text-center text-white table_strip">
          TABLE {qrInfo.tableName}
        </div>
      </div>
      <div className="thankyou_cart text-center">
        <div className="mb70">
          <img src="/payment-failed.png" className="mb30" />
          <h1 className="font-bold">Payment Failed!</h1>
          <p className="px-5 title-font dark_text mb20">
            Your transaction has been declined. Please try again.
          </p>
          {/* <p className="medium_para bg-green text-center">
            Your order is now being processed.
          </p> */}

          {restaurantProfile?.logo ? (
            <>
              <div className="mt15">
                <img
                  className="company-logo"
                  alt="Logo"
                  src={restaurantProfile.logo}
                ></img>
              </div>
            </>
          ) : null}
        </div>

        <button
          className="btn red-btn w100 big_btn"
          onClick={() => {
            qrConfig.isPAM ? router.replace("/order") : router.replace("/cart");
          }}
        >
          RETRY
        </button>
        <Link href="/">
          <p className="item_title mt15 font-bold">Back To Home</p>
        </Link>
      </div>
    </>
  );
};

export default PaymentSuccess;
