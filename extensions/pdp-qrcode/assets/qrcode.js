(function () {
  async function getQrcode(productId) {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    };

    const response = await fetch("/apps/abp-demo-proxy/qrcode?product_id="+productId, fetchOptions);
    const jsonData = await response.json();
    return jsonData;
  }

  async function initializeQrcode() {
    const elem = document.getElementById("product-qrcode-block");
    getQrcode(elem.dataset.productId).then(data=>{
      console.log(data)
      const image = new Image()
      image.src = data.image;
      elem.appendChild(image);  
    })
  }

  initializeQrcode();
})();