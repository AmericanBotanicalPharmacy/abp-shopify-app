(function () {
  function getQrcode(productId) {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    };

    return fetch("/apps/qrcodes/code", fetchOptions);
  }

  function initializeQrcode() {
    const elem = document.getElementById("product-qrcode-block");
    console.log(elem.dataset)
  }

  initializeQrcode();
})();