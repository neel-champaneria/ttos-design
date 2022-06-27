import { useSelector } from "react-redux";
import { Money } from "../../utils/money";
import SingleOrderItem from "./singleOrderItem";
import { useEffect, useState } from "react";
import { paymentGatewayProviderList } from "../../constants";
import { loadStripe } from "@stripe/stripe-js";
import {
  fomoPaymentProcessService,
  stripePaymentProcessService,
} from "../../services/OrderingService";
import { Spinner, Toast, ToastContainer } from "react-bootstrap";
import { useRouter } from "next/router";

const SingleOrder = ({ order }) => {
  const taxConfig = useSelector((state) => state.appReducer?.taxConfig);
  const router = useRouter();

  const qrConfig = useSelector((state) => state.appReducer?.qrConfig);
  const restaurant = useSelector((state) => state.resReducer);

  let paymentProviderStr = restaurant?.paymentProvider || "{}";
  let paymentProvider = JSON.parse(paymentProviderStr);
  const paymentProviderName = Object.keys(paymentProvider)[0];

  const [sortedOrder, setSortedOrder] = useState([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastErrorMsg, setToastErrorMsg] = useState("");

  useEffect(() => {
    if (order.orderItems.length > 0) {
      const tempSortedOrder = [];
      tempSortedOrder = order.orderItems.sort((a, b) => a.id - b.id);
      setSortedOrder(tempSortedOrder);
    }
  }, [order]);

  const onPayNow = async (orderId) => {
    setIsPaymentLoading(true);
    let publicKey = "";

    if (paymentProviderName == "STRIPE") {
      try {
        paymentGatewayProviderList.map((itm) => {
          if (paymentProvider[itm.value.toUpperCase()]) {
            publicKey = paymentProvider[itm.value.toUpperCase()].publicKey;
          }
        });

        const stripePromise = loadStripe(publicKey);
        const stripe = await stripePromise;
        const transactionId = orderId;
        const stripeSessionRes = await stripePaymentProcessService({
          id: transactionId,
        });
        let stripeResult;

        console.log("stripe ===>", stripe);
        console.log("stripeSessionRes ===>", stripeSessionRes);

        // When the customer clicks on the button, redirect them to Checkout.
        if (stripeSessionRes.status) {
          stripeResult = await stripe.redirectToCheckout({
            sessionId: stripeSessionRes.jsonData.sessionId,
          });
        } else {
          setIsPaymentLoading(false);
        }

        if (stripeResult?.error) {
          // If `redirectToCheckout` fails due to a browser or network
          // error, display the localized error message to your customer
          // using `result.error.message`.
          console.log("stripeResult error ===>", stripeResult);
          setIsPaymentLoading(false);
          setShowErrorToast(true);
          setToastErrorMsg(stripeResult?.error.message);
        }
      } catch (error) {
        console.log(error);
        console.log(error.message);
        setIsPaymentLoading(false);
        setShowErrorToast(true);
        setToastErrorMsg("Something went wrong while opening checkout page");
      }
    } else if (paymentProviderName == "FOMOPAY") {
      try {
        const transactionId = orderId;
        const fomoRes = await fomoPaymentProcessService({ id: transactionId });
        console.log("onFomoPayment fomoRes ===>", fomoRes);

        if (fomoRes.status) {
          await router.push(fomoRes.jsonData.url);
        } else {
          setIsPaymentLoading(false);
          setShowErrorToast(true);
          setToastErrorMsg("Something went wrong while opening checkout page");
        }
      } catch (error) {
        console.log("FOMO PAY: Catch: ", error);
        setIsPaymentLoading(false);
        setShowErrorToast(true);
        setToastErrorMsg("Something went wrong while opening checkout page");
      }
    } else {
      setIsPaymentLoading(false);
      setShowErrorToast(true);
      setToastErrorMsg("Payment not configured. Contact Restaurant.");
    }
  };

  return (
    <>
      {sortedOrder && sortedOrder.length > 0 && (
        <>
          {order.orderItems.map((item, idx) => {
            return <SingleOrderItem key={idx} item={item} />;
          })}
          <div className="bottom_block mb60">
            <div className="bg-white p_reorder_bottom">
              <div className="d-flex mb4">
                <p className="medium_para mr-auto mb0">Sub Total:</p>
                <p className="medium_para mb0">
                  {Money.moneyFormat(order.subTotal)}
                </p>
              </div>
              {order.tax > 0 && (
                <div className="d-flex mb4">
                  <p className="medium_para mr-auto mb0">Tax:</p>
                  <p className="medium_para mb0">
                    {Money.moneyFormat(order.tax)}
                  </p>
                </div>
              )}
              {order.serviceCharge > 0 && (
                <div className="d-flex mb4">
                  <p className="medium_para mr-auto mb0">
                    {taxConfig.surchargeName}:
                  </p>
                  <p className="medium_para mb0">
                    {Money.moneyFormat(order.serviceCharge)}
                  </p>
                </div>
              )}
              <div className="d-flex">
                <p className="medium_font font-bold mr-auto mb0">Total:</p>
                <p className="medium_font font-bold mb0">
                  {Money.moneyFormat(
                    Money.orderPriceRoundForFetchOrder(order.total)
                  )}
                </p>
              </div>
              {qrConfig.isPAM && qrConfig.qrPaymentType == "ONLINE" ? (
                <>
                  <button
                    className="btn red-btn w100 mt15 medium_sizebtn"
                    disabled={isPaymentLoading}
                    onClick={() => {
                      onPayNow(order.id);
                    }}
                  >
                    {isPaymentLoading ? (
                      <>
                        <Spinner animation="border" variant="light" size="sm" />
                      </>
                    ) : (
                      "PAY NOW"
                    )}
                  </button>
                </>
              ) : null}
              {qrConfig.isPAM && qrConfig.qrPaymentType == "BOTH" ? (
                <>
                  <button
                    className="btn red-btn w100 mt15 medium_sizebtn"
                    disabled={isPaymentLoading}
                    onClick={() => {
                      onPayNow(order.id);
                    }}
                  >
                    {isPaymentLoading ? (
                      <>
                        <Spinner animation="border" variant="light" size="sm" />
                      </>
                    ) : (
                      "PAY NOW"
                    )}
                  </button>
                  <p className="medium_para bg-gray text-center mt20 small-width">
                    OR
                  </p>
                  <p className="item_title mt15 font-bold px-4">
                    Please proceed to pay at the counter after your delicious
                    meal. Thank you.
                  </p>
                </>
              ) : null}
            </div>
            {qrConfig.isPAM && qrConfig.qrPaymentType == "COUNTER" ? (
              <>
                <p className="item_title mt15 font-bold px-4">
                  Please proceed to pay at the counter after your delicious
                  meal. Thank you.
                </p>
              </>
            ) : null}
          </div>

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

export default SingleOrder;
