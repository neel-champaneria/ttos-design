import axios from "axios";
import Cookies from "universal-cookie";
import moment from "moment";

const cookies = new Cookies();
const API_VERSION = "/v1";

class ApiResource {
  constructor(opt) {
    let isServer = typeof window === "undefined";
    var baseUrl = null;
    var tenantUrl = null;
    var pubKey = null;
    var jsEcrypt = null;

    if (!isServer) {
      // baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace('{{host}}', window.location.hostname);
      // tenantUrl = window.location.hostname;
      //   baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      //   tenantUrl = "staging2.ellieeats.sg";
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "ttos-design.vercel.app"
      ) {
        baseUrl = process.env.NEXT_PUBLIC_DEV_BASE_URL;
        tenantUrl = process.env.NEXT_PUBLIC_DEV_TENANT_URL;
      } else {
        let hostname = window.location.hostname;
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(
          "{{host}}",
          hostname.substring(5)
        );
        tenantUrl = hostname.substring(5);
      }
      pubKey = process.env.NEXT_PUBLIC_OPEN_API;
      var JSEncrypt = require("jsencrypt").default;
      jsEcrypt = new JSEncrypt();
      jsEcrypt.setPublicKey(pubKey);
    }

    this.instance = axios.create({
      baseURL: baseUrl + API_VERSION,
      timeout: 93000,
    });

    this.instance.interceptors.request.use((request) => {
      //   const times = moment().add(30, "s");
      //   let data = tenantUrl + ":" + times;
      //   request.headers["x-client-key"] = jsEcrypt.encrypt(data);
      //   const API_key = "8ee4c3eb-89a2-41be-b37a-6b9cb056f968";
      //   const secret_key =
      //     "$2a$10$5wQ.RXhOZd7NWQ54Z5q/DuOhD9MfKFbsmX/t5Eo7bO0qPoWCShOdK";
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "ttos-design.vercel.app"
      ) {
        const API_key = process.env.NEXT_PUBLIC_DEV_API_KEY;
        const secret_key = process.env.NEXT_PUBLIC_DEV_SECRET_KEY;
        const api_secret = API_key + ":" + secret_key;
        const base64 = btoa(api_secret);
        request.headers["x-client-key"] = "Basic " + base64;
      } else {
        const times = moment().add(30, "s");
        let data = tenantUrl + ":" + times;
        request.headers["x-client-key"] = jsEcrypt.encrypt(data);
      }

      return request;
    });

    this.instance.interceptors.response.use((response) => {
      //should detect cookie expired here
      //console.log("response", response)
      return response;
    });
  }

  injectAuthToken(config = {}) {
    /*let state = storeState.getState();
        let token = state.userReducer.logged
             ? state.userReducer.userLogged.authorization
             : null;
         if (token == null) return;*/
    // console.log("injectAuthToken called for: ", config);
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      // console.log("!config.headers.Authorization condition");
      config.headers.Authorization = "";
    }
    /* let access_token = cookies.get("access_token");
    if (!access_token) {
      console.log("!access_token condition");
      config.headers.cookie = null;
    } */
  }

  parseError(e) {
    // console.log("Error ", e.response);
    if (e.response && e.response.data) {
      return {
        status: e.response.data.status == 200,
        msg: e.response.data.title,
        error: e.response.data,
      };
    } else {
      return {
        status: false,
        msg: "Can not connect",
      };
    }
  }

  request(method, url, params, config) {
    //Inject authorization token
    this.injectAuthToken(method === "get" ? params : config);
    return this.instance[method](url, params, config);
  }

  get(url, config = {}) {
    // console.log("get method called for: ", url, " with config: ", config);
    return this.request("get", url, config)
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }

  post(url, params, config = {}) {
    return this.request("post", url, params, config)
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }

  downloadPost(url, params, config = {}) {
    return this.request("post", url, params, config)
      .then((resp) => {
        return resp;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }

  delete(url, params, config = {}) {
    return this.request("delete", url, params, config)
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }

  put(url, params, config = {}) {
    return this.request("put", url, params, config)
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }

  patch(url, params) {
    return this.instance
      .patch(url, { ...params })
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        return this.parseError(e);
      });
  }
}

//export single instance
export default new ApiResource();
