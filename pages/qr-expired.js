const QrExpired = () => {
  return (
    <>
      <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
        <div style={{ height: "160px", width: "160px" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              lineHeight: "160px",
              textAlign: "center",
            }}
          >
            <img
              src="./qr-invalid.png"
              alt="invalid-qr"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "inline-block",
                margin: "0 auto",
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
        <h2>QR is Expired.</h2>
        <h2>Please Scan the new QR Code.</h2>
        <h2>You can contact staff for assistance.</h2>
        <h2 style={{ color: "#fe0000" }}>Thank You</h2>
      </div>
    </>
  );
};

export default QrExpired;
