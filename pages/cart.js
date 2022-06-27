import { useDispatch, useSelector } from "react-redux";
import {
  paymentGatewayProviderList,
  RE_CALCULATE_ORDER_PRICE,
} from "./../src/constants/index";
import {
  decreaseQuantityFromCartAction,
  increaseQuantityFromCartAction,
  removeItemFromCartAction,
  saveOrderingInfoToCartAction,
} from "../src/actions/OrderingCartAction";
import { useEffect, useState } from "react";
import SingleItemCart from "../src/components/cartComponent/singleCartItem";
import { useRouter } from "next/router";
import { Money } from "../src/utils/money";
import { ToastContainer, Toast, Spinner } from "react-bootstrap";
import Link from "next/link";
import { checkOutTTOSAction } from "./../src/actions/OrderingCartAction";
import { fetchAppConfig, fetchMenuAction } from "../src/actions/MenuAction";
import { loadStripe } from "@stripe/stripe-js";
import { stripePaymentProcessService } from "../src/services/OrderingService";

const CartPage = () => {
  const dispatch = useDispatch();

  const router = useRouter();

  const qrInfo = useSelector((state) => state.QrReducer);

  const orderingCart = useSelector((state) => state.orderingCartReducer);
  const promotions = useSelector((state) => state.appReducer?.promotions);
  const storeConfig = useSelector((state) => state.appReducer?.storeConfig);
  const taxConfig = useSelector((state) => state.appReducer?.taxConfig);
  const paymentConfig = useSelector((state) => state.appReducer?.paymentMethod);
  const qrConfig = useSelector((state) => state.appReducer?.qrConfig);
  const user = useSelector((store) => store.userReducer);

  const restaurant = useSelector((store) => store.resReducer);
  let paymentProviderStr = restaurant?.paymentProvider || "{}";
  let paymentProvider = JSON.parse(paymentProviderStr);
  const paymentProviderName = Object.keys(paymentProvider)[0];

  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastErrorMsg, setToastErrorMsg] = useState("");
  const [showTableQrErrorToast, setShowTableQrErrorToast] = useState(false);
  const [qtyInCart, setQtyInCart] = useState(0);

  const [gotoUserInfoPage, setGotoUserInfoPage] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isMenuFetchingLoading, setIsMenuFetchingLoading] = useState(false);
  const [isMenuAndInfoSuccess, setIsMenuAndInfoSuccess] = useState(false);

  /* useEffect(() => {
    dispatch({ type: RE_CALCULATE_ORDER_PRICE });
  }, [promotions, storeConfig, taxConfig, paymentConfig]); */

  /* useEffect(() => {
    dispatch(saveOrderingInfoToCartAction({ paymentMethod: "COD" }));
  }, []); */

  useEffect(async () => {
    try {
      if (
        Object.keys(qrInfo).length !== 0 &&
        qrInfo.tableId &&
        qrInfo.qrId &&
        qrInfo.tableName
      ) {
        setIsMenuFetchingLoading(true);
        const menuResponse = await dispatch(fetchMenuAction(qrInfo.qrId));
        const restaurantInfoResposne = await dispatch(
          fetchAppConfig(qrInfo.qrId)
        );
        if (!menuResponse.status) {
          if (menuResponse?.error?.qrExpire) {
            router.replace("/qr-expired");
          } else {
            router.replace("/something-wrong");
          }
        }
        if (!restaurantInfoResposne.status) {
          if (restaurantInfoResposne?.error?.qrExpire) {
            router.replace("/qr-expired");
          } else {
            router.replace("/something-wrong");
          }
        }
        if (menuResponse.status && restaurantInfoResposne.status) {
          dispatch({ type: RE_CALCULATE_ORDER_PRICE });
          // dispatch(saveOrderingInfoToCartAction({ paymentMethod: "CRP" }));
          setIsMenuFetchingLoading(false);
          setIsMenuAndInfoSuccess(true);
        }
      } else if (!qrInfo.qrId) {
        router.replace("/qr-not-found");
      }
    } catch (error) {
      router.replace("/something-wrong");
    }
  }, []);

  useEffect(() => {
    if (orderingCart) {
      if (
        orderingCart.customerName &&
        orderingCart.customerPhone &&
        orderingCart.customerEmail
      ) {
        setGotoUserInfoPage(false);
      } else {
        setGotoUserInfoPage(true);
      }
    }
  }, [orderingCart]);

  const onStripePayment = async (paymentProvider, checkoutResponse) => {
    let publicKey = "";

    paymentGatewayProviderList.map((itm) => {
      if (paymentProvider[itm.value.toUpperCase()]) {
        publicKey = paymentProvider[itm.value.toUpperCase()].publicKey;
      }
    });

    console.log("checkoutResponse: ", checkoutResponse);
    try {
      const stripePromise = loadStripe(publicKey);
      const stripe = await stripePromise;
      const transactionId = checkoutResponse && checkoutResponse?.id;
      /* const stripeSessionRes = await stripePaymentProcessService({
        id: transactionId,
      }); */
      let stripeResult;

      console.log("stripe ===>", stripe);
      // console.log("stripeSessionRes ===>", stripeSessionRes);

      // When the customer clicks on the button, redirect them to Checkout.
      /* if (stripeSessionRes.status) {
        stripeResult = await stripe.redirectToCheckout({
          sessionId: stripeSessionRes.jsonData.sessionId,
        });
      } else {
      } */

      stripeResult = await stripe.redirectToCheckout({
        sessionId: checkoutResponse.initPaymentResponse.sessionId,
      });

      if (stripeResult?.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
        console.log("stripeResult error ===>", stripeResult);
        setLoading(false);
        setShowErrorToast(true);
        setToastErrorMsg(stripeResult?.error.message);
      }
    } catch (error) {
      console.log(error);
      console.log(error.message);
      setLoading(false);
      setShowErrorToast(true);
      setToastErrorMsg("Something went wrong while opening checkout page");
    }
  };

  /* const onFomoPayment = (checkoutResponse) => {
    setLoading(false);
    setShowErrorToast(true);
    setToastErrorMsg("FOMO Pay is not implemented yet");
  }; */

  const onFomoPayment = async (checkoutResponse) => {
    // const transactionId = checkoutResponse && checkoutResponse?.id;
    // const fomoRes = await fomoPaymentProcessService({ id: transactionId });
    // console.log("onFomoPayment fomoRes ===>", fomoRes);

    try {
      if (checkoutResponse.initPaymentResponse.url) {
        await router.push(checkoutResponse.initPaymentResponse.url);
      } else {
        setLoading(false);
        setShowErrorToast(true);
        setToastErrorMsg("Something went wrong while opening checkout page");
      }
    } catch (error) {
      console.log(error);
      console.log(error.message);
      setLoading(false);
      setShowErrorToast(true);
      setToastErrorMsg("Something went wrong while opening checkout page");
    }
  };

  const onPlaceOrder = async () => {
    try {
      if (!qrInfo.tableId || !qrInfo.qrId) {
        setShowTableQrErrorToast(true);
        return;
      }
      setLoading(true);
      const {
        orderItems,
        subTotal,
        discount,
        total,
        totalTax,
        paymentMethod,
        deliveryFee,
      } = orderingCart;
      const data = {
        subTotal,
        totalTax,
        discount,
        total,
        paymentMethod: qrConfig.isPAM ? "PAM" : "PPO",
        deliveryZoneId: 0,
        deliveryFee,
        orderItems,
        tableNr: qrInfo.tableId,
        qrId: qrInfo.qrId,
        tax1Val: taxConfig.enable ? taxConfig.tax1Value : 0,
        tax2Val: taxConfig.enable ? taxConfig.tax2Value : 0,
        tax3Val: taxConfig.enable ? taxConfig.tax3Value : 0,
        priceExclude: taxConfig.priceExclude,
        applySurcharge: taxConfig.applySurcharge,
        tax1Name: taxConfig.enable ? taxConfig.tax1Name : "",
        tax2Name: taxConfig.enable ? taxConfig.tax2Name : "",
        tax3Name: taxConfig.enable ? taxConfig.tax3Name : "",
        percentage: taxConfig.surchargePercentage,
        autoSurcharge: taxConfig.autoSurcharge,
        serviceName: taxConfig.surchargeName || "",
        servicePercentage: taxConfig.surchargeAmount || 0,
        paymentGateway: !qrConfig.isPAM
          ? paymentProviderName == "STRIPE"
            ? "STRIPE"
            : "FOMO"
          : "NONE",
      };
      const onlinePayment = !qrConfig.isPAM;
      const response = await dispatch(checkOutTTOSAction(data, qrInfo.qrId));
      if (response.status) {
        if (data.paymentMethod === "PPO") {
          if (response.orderAccepted && !qrConfig.isPAM) {
            localStorage.setItem("checkoutTime", -1);
            if (paymentProviderName == "STRIPE") {
              onStripePayment(paymentProvider, response.jsonData);
            } else if (paymentProviderName == "FOMOPAY") {
              onFomoPayment(response.jsonData);
            } else {
              setLoading(false);
              setShowErrorToast(true);
              setToastErrorMsg("Payment not configured. Contact Restaurant.");
            }
          }
        } else {
          localStorage.setItem("checkoutTime", new Date().getTime());
        }
      }
      if (response.status) {
        if (response.orderAccepted) {
          if (!onlinePayment) {
            router.replace("/orderPlacedSuccessfully");
            setLoading(false);
          }
        } else {
          if (response.rejectReason === "QR expired") {
            setShowErrorToast(true);
            setToastErrorMsg(
              "QR code expired. Please scan new QR code to order food."
            );
            setLoading(false);
          } else {
            setShowErrorToast(true);
            setToastErrorMsg("Something went wrong");
            setLoading(false);
          }
        }
      } else {
        /* setShowErrorToast(true);
        setToastErrorMsg("Something went wrong");
        setLoading(false); */
        if (response.error.qrExpire) {
          router.replace("/qr-expired");
        } else {
          router.replace("/something-wrong");
        }
      }
    } catch (error) {
      router.replace("/something-wrong");
    }
  };

  useEffect(() => {
    if (router.isReady) {
      if (router.query?.failed === "true") {
        setShowErrorToast(true);
      }
      if (router.query?.TableQRfailed === "true") {
        setShowTableQrErrorToast(true);
      }
    }
    calculateQty();
  }, [router, orderingCart]);

  const calculateQty = () => {
    if (orderingCart.orderItems.length > 0) {
      let tempQty = 0;
      const { orderItems } = orderingCart;
      for (let i = 0; i < orderItems.length; i++) {
        tempQty += orderItems[i].qty;
      }
      setQtyInCart(tempQty);
    } else {
      setQtyInCart(0);
    }
  };

  return (
    <>
      {loading || isMenuFetchingLoading ? (
        <>
          <div className="container d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" variant="secondary" />
          </div>
        </>
      ) : (
        <>
          {/* Table Number */}
          <div className="mb-2">
            <div className="text-center text-white table_strip">
              TABLE {qrInfo.tableName}
            </div>
          </div>
          <div className="container p0">
            <div className="d-flex p-cart mt10 mb20">
              <h1 className="cart_title mr-auto">Your Cart ({qtyInCart})</h1>
              <img src="/bag.svg" alt="cart" />
            </div>
          </div>

          <div className="container">
            {orderingCart.orderItems.length > 0 ? (
              <>
                <div className="cart_quantity">
                  {orderingCart.orderItems.map((item, itemIndex) => {
                    return <SingleItemCart key={itemIndex} item={item} />;
                  })}
                </div>

                <div className="bottom_block mt80 mb60">
                  <div className="bg-white p_bottom">
                    <div className="d-flex mb4">
                      <p className="medium_para mr-auto mb0">Sub Total:</p>
                      <p className="medium_para mb0">
                        {Money.moneyFormat(orderingCart.subTotal)}
                      </p>
                    </div>
                    <>
                      {orderingCart?.taxObj?.map((tax, idx) => {
                        return (
                          <div className="d-flex mb4" key={idx}>
                            <p className="medium_para mr-auto mb0">
                              {tax.taxName}
                            </p>
                            <p className="medium_para mb0">
                              {Money.moneyFormat(tax.totalTax)}
                            </p>
                          </div>
                        );
                      })}
                    </>
                    <div className="d-flex">
                      <p className="medium_font font-bold mr-auto mb0">
                        Total:
                      </p>
                      <p className="medium_font font-bold mb0">
                        {Money.moneyFormat(orderingCart.total)}
                      </p>
                    </div>
                    {/* <Link href="/userInfoForOrder"> */}
                    <button
                      className="btn red-btn w100 mt15 medium_sizebtn"
                      onClick={() => {
                        onPlaceOrder();
                      }}
                    >
                      {qrConfig.isPAM ? "CONFIRM ORDER" : "PAY"}
                    </button>
                    {/* </Link> */}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="empty_cart thankyou_cart text-center h-80 mt95">
                  <div className="top_thank">
                    <img src="/bigcart.svg" className="mb40" />
                    <p className="big_font red_font font-bold mb10">
                      Your cart is empty
                    </p>
                    <h4 className="grey_text">
                      Looks like you haven&lsquo;t made your choice yet
                    </h4>
                  </div>
                  <Link href="/">
                    <button className="btn red-btn big_btn bottom_btn">
                      ORDER FOOD
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {showTableQrErrorToast && (
            <ToastContainer position="top-center" className="mt-5">
              <Toast onClose={() => setShowTableQrErrorToast(false)}>
                <Toast.Header>
                  <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>
                  QR ID or Table ID Not Found.
                  <br />
                  Please Scan the QR and Order food.
                </Toast.Body>
              </Toast>
            </ToastContainer>
          )}

          {showErrorToast && (
            <ToastContainer position="top-center" className="mt-5">
              <Toast onClose={() => setShowErrorToast(false)}>
                <Toast.Header>
                  <strong className="me-auto">Error</strong>
                </Toast.Header>
                <Toast.Body>{toastErrorMsg}</Toast.Body>
              </Toast>
            </ToastContainer>
          )}
        </>
      )}
    </>
  );
};

export default CartPage;
