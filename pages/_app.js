import { useDispatch, useSelector, useStore } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";

import { fetchMenuAction, fetchAppConfig } from "./../src/actions/MenuAction";
import Layout from "../src/components/layout/Layout";
import { wrapper } from "./../src/store/index";
import { Money } from "./../src/utils/money";

import "bootstrap/dist/css/bootstrap.css";
import "../styles/globals.css";
import variables from "../styles/variables.module.scss";
import styles from "../styles/styles.scss";
import tempStyles from "../styles/tempStyles.scss";
import "font-awesome/css/font-awesome.min.css";

function MyApp({ Component, pageProps, router }) {
  const store = useStore((state) => state);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.userReducer);
  const resName = useSelector((state) => state.appReducer?.name);
  const promotions = useSelector((state) => state.appReducer?.promotions);
  const storeConfig = useSelector((state) => state.appReducer?.storeConfig);
  const taxConfig = useSelector((state) => state.appReducer?.taxConfig);
  const paymentConfig = useSelector((state) => state.appReducer?.paymentMethod);
  const maintaining =
    useSelector((state) => state.appReducer?.maintaining) || "F";

  /*   useEffect(() => {
    dispatch(fetchMenuAction());
    dispatch(fetchAppConfig());
  }, [dispatch]); */

  useEffect(() => {
    Money.init(storeConfig, taxConfig, promotions, user, paymentConfig || []);
  }, [storeConfig, taxConfig, promotions, user, paymentConfig]);

  return (
    <PersistGate persistor={store.__persistor} loading={<div>loading</div>}>
      {router.route === "/qr-expired" ||
      router.route === "/something-wrong" ||
      router.route === "/qr-not-found" ? (
        <>
          <Component {...pageProps} />
        </>
      ) : (
        <>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </>
      )}
    </PersistGate>
  );
}

export default wrapper.withRedux(MyApp);
