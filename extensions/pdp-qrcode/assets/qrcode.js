(function () {
  function getQrcode(productId) {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    };

    return fetch("/apps/abp-demo-proxy/qrcode?product_id="+productId, fetchOptions);
  }

  function initializeQrcode() {
    const elem = document.getElementById("product-qrcode-block");
    console.log(elem.dataset)
    getQrcode(elem.dataset.productId)
  }

  initializeQrcode();
})();