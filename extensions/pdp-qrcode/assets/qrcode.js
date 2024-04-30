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

  async function initializeQrcode() {
    const elem = document.getElementById("product-qrcode-block");
    const response = await getQrcode(elem.dataset.productId)
    console.log(response)
    const data = response.json()
    const image = new Image()
    image.src = data.image;
    elem.appendChild(image);
  }

  initializeQrcode();
})();