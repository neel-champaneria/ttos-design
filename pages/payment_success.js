import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cleanCartAction } from "../src/actions/OrderingCartAction";
import { saveAs } from "file-saver";
import { getOrderReceipt } from "../src/services/OrderingService";
import { Spinner, ToastContainer, Toast } from "react-bootstrap";

const PaymentSuccess = () => {
  const qrInfo = useSelector((state) => state.QrReducer);
  const restaurantProfile = useSelector((state) => state.resReducer);
  const qrConfig = useSelector((state) => state.appReducer?.qrConfig);
  const dispatch = useDispatch();
  const router = useRouter();
  const [pdfDownloadSrc, setPdfDownloadSrc] = useState("");
  const [isReceiptUrlLoading, setIsReceiptUrlLoading] = useState(false);
  const [isReceiptUrlFetchedSuccessfully, setIsReceiptUrlFetchedSuccessfully] =
    useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const getReceiptURL = async () => {
    try {
      if (router?.isReady && router?.query?.orderId) {
        setIsReceiptUrlLoading(true);
        const response = await getOrderReceipt(router?.query?.orderId, {
          logo: restaurantProfile?.logo,
          tableName: qrInfo.tableName,
          restaurantName: restaurantProfile?.name,
        });
        if (response.status && response?.jsonData?.url) {
          console.log("response: ", response);
          setPdfDownloadSrc(response?.jsonData?.url);
          setIsReceiptUrlLoading(false);
          setIsReceiptUrlFetchedSuccessfully(true);
        } else {
          setIsReceiptUrlLoading(false);
          setIsReceiptUrlFetchedSuccessfully(false);
          setShowErrorToast(true);
        }
      }
    } catch (error) {
      setIsReceiptUrlLoading(false);
      setIsReceiptUrlFetchedSuccessfully(false);
      setShowErrorToast(true);
    }
  };

  useEffect(async () => {
    dispatch(cleanCartAction());
    getReceiptURL();
  }, [router]);

  const downloadButtonAndLink = () => {
    return (
      <>
        {router.isReady && router.query.orderId && (
          <>
            {!isReceiptUrlLoading && isReceiptUrlFetchedSuccessfully ? (
              <>
                <Link href={pdfDownloadSrc} download>
                  <p className="item_title mt15 font-semi-bold mb35">
                    <i className="fa fa-download mr5" aria-hidden="true"></i>
                    Receipt
                  </p>
                </Link>
              </>
            ) : (
              <>
                {!isReceiptUrlFetchedSuccessfully && (
                  <>
                    {isReceiptUrlLoading ? (
                      <>
                        <p className="item_title mt15 font-semi-bold mb35">
                          <Spinner
                            animation="border"
                            variant="secondary"
                            size="sm"
                          />
                          Getting receipt download link
                        </p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={getOrderReceipt}
                          disabled={isReceiptUrlLoading}
                          className="receipt-button mb35"
                        >
                          {" "}
                          <p className="item_title mt15 font-semi-bold">
                            Retry to get receipt download link
                          </p>
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  };

  const saveFile = async () => {
    try {
      const response = await getOrderReceipt(router.query.orderId, {
        logo: restaurantProfile?.logo,
        tableName: qrInfo.tableName,
        restaurantName: restaurantProfile?.name,
      });
      if (response.status && response?.jsonData?.url) {
        console.log("response: ", response);
        saveAs(response?.jsonData?.url, `${router.query.orderId}-receipt.pdf`);
      }
    } catch (error) {}
  };

  return (
    <>
      <div className="mb-2">
        <div className="text-center text-white table_strip">
          TABLE {qrInfo.tableName}
        </div>
      </div>
      <div className="thankyou_cart text-center">
        <div className="mb70">
          <img src="/thankyou.png" className="mb30" />
          <h1 className="font-bold">Payment Successful!</h1>
          <p className="title-font mb20 px-4">
            Thank you! You have completed your payment.
          </p>
          {!qrConfig.isPAM ? (
            <p className="medium_para bg-green text-center">
              Your order is now being processed.
            </p>
          ) : null}

          {/* Res. Logo */}
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
        {/*         {qrConfig.isPAM ? (
          <>
            <Link href="/">
              <p className="item_title mt15 font-semi-bold mb35">
                <i className="fa fa-download mr5" aria-hidden="true"></i>
                Receipt
              </p>
            </Link>
            <button
              className="btn red-btn w100 big_btn"
              onClick={() => {
                router.replace("/order");
              }}
            >
              MY ORDERS
            </button>
            <Link href="/">
              <p className="item_title mt15 font-bold">Back To Home</p>
            </Link>
          </>
        ) : (
          <>
            <Link href="/">
              <p className="item_title mt15 font-semi-bold mb35">
                <i className="fa fa-download mr5" aria-hidden="true"></i>
                Receipt
              </p>
            </Link>
            <button
              className="btn red-btn w100 big_btn"
              onClick={() => {
                router.replace("/");
              }}
            >
              Back To Home
            </button>
          </>
        )} */}

        {qrConfig.isStatic && qrConfig.isPAM ? (
          <>
            {downloadButtonAndLink()}
            <button
              className="btn red-btn w100 big_btn"
              onClick={() => {
                router.replace("/order");
              }}
            >
              ORDER HISTORY
            </button>
            <Link href="/">
              <p className="item_title mt15 font-bold">Back To Home</p>
            </Link>
          </>
        ) : (
          <>
            {downloadButtonAndLink()}
            <button
              className="btn red-btn w100 big_btn"
              onClick={() => {
                router.replace("/");
              }}
            >
              Back To Home
            </button>
          </>
        )}

        {showErrorToast && (
          <ToastContainer position="top-center" className="mt-5">
            <Toast onClose={() => setShowErrorToast(false)}>
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body>
                Something went wrong while getting receipt link
              </Toast.Body>
            </Toast>
          </ToastContainer>
        )}
        {/* <Link href="/">
          <p className="item_title mt15 font-semi-bold mb35">
            <i className="fa fa-download mr5" aria-hidden="true"></i>
            Receipt
          </p>
        </Link>
        <button
          className="btn red-btn w100 big_btn"
          onClick={() => {
            router.replace("/");
          }}
        >
          Back To Home
        </button> */}

        {/* <Link href="/">
          <p className="item_title mt15 font-bold">Back To Home</p>
        </Link> */}
      </div>
    </>
  );
};

export default PaymentSuccess;
