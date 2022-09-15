'use strict';

let currentUrl = new URL(document.location);
let userOrderId = currentUrl.searchParams.get('orderId');
orderId.textContent = userOrderId;

