(function () {
  function getQrcode(productId) {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    };

    return fetch("/apps/qrcodes/code?product_id="+productId, fetchOptions);
  }

  function initializeQrcode() {
    const elem = document.getElementById("product-qrcode-block");
    console.log(elem.dataset)
    getQrcode(elem.dataset.productId)
  }

  initializeQrcode();
})();