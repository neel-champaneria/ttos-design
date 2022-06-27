import Link from "next/link";
import { Form, Navbar, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { saveOrderingInfoToCartAction } from "../src/actions/OrderingCartAction";
import { useDispatch, useSelector } from "react-redux";
import { checkOutTTOSAction } from "./../src/actions/OrderingCartAction";
import { useState } from "react";
import { emailRegex, singaporePhoneRegex } from "./../src/utils/utils";

const UserInfoForOrder = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const orderingCart = useSelector((state) => state.orderingCartReducer);
  const qrInfo = useSelector((state) => state.QrReducer);
  const [loading, setLoading] = useState(false);
  const email_pattern = RegExp(emailRegex, "i");
  const phone_pattern = RegExp(singaporePhoneRegex);

  const validate = (values) => {
    const errors = {};
    if (!values.firstName) {
      errors.firstName = "First Name is required.";
    }

    if (!values.lastName) {
      errors.lastName = "Last Name is required.";
    }

    if (!values.email) {
      errors.email = "Email is required.";
    } else if (!email_pattern.test(values.email)) {
      errors.email = "Invalid email address";
    }

    if (!values.contact) {
      errors.contact = "Phone Number is required.";
    } else if (!phone_pattern.test(values.contact)) {
      errors.contact = "Invalid phone number";
    }

    return errors;
  };

  const checkOut = async (firstName, lastName, contact, email) => {
    if (!qrInfo.tableId || !qrInfo.qrId) {
      router.replace("/cart?TableQRfailed=true");
      return;
    }
    setLoading(true);
    const { orderItems, subTotal, discount, total, totalTax } = orderingCart;
    const data = {
      customerName: `${firstName} ${lastName}`,
      customerPhone: contact,
      customerEmail: email,
      customerPassword: email,
      deliveryPostalCode: "101010",
      deliveryAddress1: "address 2",
      deliveryAddress2: "address 1",
      orderItems,
      subTotal,
      discount,
      total,
      totalTax,
      tableNr: qrInfo.tableId,
      qrId: qrInfo.qrId,
      paymentMethod: "COD",
    };
    const response = await dispatch(checkOutTTOSAction(data));
    console.log("chekout function created =>=> ", response);
    if (response.status) {
      setLoading(false);
      router.replace("/orderPlacedSuccessfully");
    } else {
      setLoading(false);
      router.replace("/cart?failed=true");
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName:
        orderingCart?.customerName.length > 0
          ? orderingCart.customerName.split(" ")[0]
          : "",
      lastName:
        orderingCart?.customerName.length > 0
          ? orderingCart.customerName.split(" ")[1]
          : "",
      email:
        orderingCart?.customerEmail.length > 0
          ? orderingCart.customerEmail
          : "",
      contact:
        orderingCart?.customerPhone.length > 0
          ? orderingCart.customerPhone
          : "",
    },
    validate,
    onSubmit: (values) => {
      // alert(JSON.stringify(values, null, 2));
      const { firstName, lastName, contact, email } = values;
      const data = {
        customerName: `${firstName} ${lastName}`,
        customerPhone: contact,
        customerEmail: email,
        allowEditMethodAddressForm: true,
      };
      dispatch(saveOrderingInfoToCartAction(data));
      checkOut(firstName, lastName, contact, email);
    },
  });

  const onClickFail = () => {
    router.replace("/cart?failed=true");
  };

  return (
    <>
      {loading ? (
        <div className="container d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="secondary" />
        </div>
      ) : (
        <>
          <div className="user_login text-center pt31pl34">
            <div className="header">
              <Navbar>
                <Navbar.Brand>
                  <Link href="/">
                    <img
                      src="/prev.svg"
                      alt="previous"
                      className="cursor-pointer"
                    />
                  </Link>
                  <h1 className="menu_title ml10">Back</h1>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                  <Navbar.Text>
                    <Form.Select
                      aria-label="Default select example"
                      className="transparent-select"
                    >
                      <option>English</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </Form.Select>
                  </Navbar.Text>
                </Navbar.Collapse>
              </Navbar>
            </div>
            {/* <div className="container mb-2">
              <div className="header">
                <Navbar>
                  <Navbar.Brand>
                    <Link href="/">
                      <img src="/prev.svg" alt="previous" />
                    </Link>
                    <h1 className="menu_title ml10">Back</h1>
                  </Navbar.Brand>
                </Navbar>
              </div>
            </div> */}
            <img src="/big-eatery.png" className="mb40 h-130 mt30" />
            <form onSubmit={formik.handleSubmit}>
              <div className="form_content">
                <div className="d-flex mb15">
                  <div className="mr-auto w-50">
                    <Form.Control
                      type="text"
                      className="h50"
                      placeholder="First Name"
                      id="firstName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.firstName}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-start mb-0">
                        {formik.errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="ml20 w-50">
                    <Form.Control
                      type="text"
                      className="h50"
                      placeholder="Last Name"
                      id="lastName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.lastName}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-start mb-0">
                        {formik.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb15">
                  <Form.Control
                    type="tel"
                    className="h50"
                    placeholder="Phone Number"
                    id="contact"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.contact}
                  />
                  {formik.touched.contact && formik.errors.contact && (
                    <p className="text-start">{formik.errors.contact}</p>
                  )}
                </div>
                <div className="mb15">
                  <Form.Control
                    type="email"
                    className="mb15 h50"
                    placeholder="Email"
                    id="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-start">{formik.errors.email}</p>
                  )}
                </div>
                <button
                  className="btn red-btn w-100 text-capitalize ptb17 mt40"
                  type="submit"
                >
                  Order
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default UserInfoForOrder;
