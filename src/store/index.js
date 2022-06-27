import { createStore, applyMiddleware, combineReducers } from "redux";
import { HYDRATE, createWrapper } from "next-redux-wrapper";
import thunkMiddleware from "redux-thunk";
import {
  orderingItemReducer,
  menuReducer,
  orderingCartReducer,
  appReducer,
  userReducer,
  resReducer,
  resCustomersReducer,
  resOrdersReducer,
  resWaitingOrdersReducer,
  promotionReducer,
  openAPIKeyManagementReducer,
  QrReducer,
} from "../reducers";
import logger from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const resReducerPersistConfig = {
  key: "resReducer",
  blacklist: ["menu"],
  storage: storage,
};

const combinedReducer = combineReducers({
  resReducer: persistReducer(resReducerPersistConfig, resReducer),
  userReducer,
  appReducer,
  orderingItemReducer,
  menuReducer,
  orderingCartReducer,
  resCustomersReducer,
  resOrdersReducer,
  resWaitingOrdersReducer,
  promotionReducer,
  openAPIKeyManagementReducer,
  QrReducer,
});

const reducer = (state, action) => {
  const isServer = typeof window === "undefined";
  if (action.type === HYDRATE) {
    //console.log(state, action, isServer)
    //merge
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

const getMiddleWare = () => {
  const isServer = typeof window === "undefined";
  return isServer ? [thunkMiddleware] : [logger, thunkMiddleware];
};

const makeConfiguredStore = (reducer) =>
  createStore(reducer, bindMiddleware(getMiddleWare()));

const makeStore = ({ isServer }) => {
  if (isServer) {
    // initialState = initialState || {fromServer: 'foo'};

    return makeConfiguredStore(reducer);
  } else {
    // we need it only on client side
    // const {persistStore, persistReducer} = require('redux-persist');
    // const storage = require('redux-persist/lib/storage').default;

    const persistConfig = {
      key: "nextjs",
      //whitelist: ['fromClient'], // make sure it does not clash with server keys
      blacklist: [
        "menuReducer",
        "resOrdersReducer",
        "resCustomersReducer",
        "resReducer",
        "orderingItemReducer",
        "openAPIKeyManagementReducer",
      ],
      storage,
    };

    const persistedReducer = persistReducer(persistConfig, reducer);
    const store = makeConfiguredStore(persistedReducer);

    store.__persistor = persistStore(store); // Nasty hack

    return store;
  }
};

export const wrapper = createWrapper(makeStore);
