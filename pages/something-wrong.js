const SomethingWrong = () => {
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
              src="./exclaim.png"
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
        <h2>Something Went Wrong</h2>
      </div>
    </>
  );
};

export default SomethingWrong;
