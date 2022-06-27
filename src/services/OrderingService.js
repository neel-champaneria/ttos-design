import APIResource from "../services/APIResource";

export const checkoutService = async (data) => {
  return await APIResource.post("open/api/slave/order", data);
};

export const checkoutTTOSService = async (data, qrId) => {
  // console.log("data sent for order: ", data);
  return await APIResource.post(
    "open/api/slave/order/createOrder-withoutAuth-qrid",
    data,
    {
      headers: {
        "qr-code": qrId,
      },
    }
  );
};

export const getOrderByQRService = async (qrId) => {
  // console.log("data >>>>>>>>>>>>>>>>>>>>>>>>>>>> : ", qrId);
  return await APIResource.get(
    `open/api/slave/order/fetchMyOrders?qrid=${qrId}&status=INIT`,
    {
      headers: {
        "qr-code": qrId,
      },
    }
  );
};

export const getOrderReceipt = async (orderId, data) => {
  return await APIResource.post(
    `open/api/slave/order/receipt/${orderId}`,
    data
  );
};

export const orderStatusService = async (orderId) => {
  return await APIResource.get(`open/api/slave/order/status/${orderId}`);
};

export const updateDeliveryDateTimeService = async (user, data) => {
  return await APIResource.post("api/slave/user/updateDeliveryTime", data, {
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
};

export const stripePaymentProcessService = async (data) => {
  return await APIResource.post("open/api/slave/order/payment-ttos/" + data.id);
};

export const fomoPaymentProcessService = async (data) => {
  // return await APIResource.post("open/api/slave/payment/fomo/" + data.id);
  return await APIResource.post("open/api/slave/payment/fomo/ttos/" + data.id);
};
