const menuContainer = document.getElementById('menu-items');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElem = document.getElementById('cart-total');
const placeOrderBtn = document.getElementById('place-order-btn');
const logoutBtn = document.getElementById('logout-btn');
const paymentError = document.getElementById('payment-error');

const cardNumberContainer = document.getElementById('card-number-container');
const cardNumberInput = document.getElementById('card-number');
const cardNumberError = document.getElementById('card-number-error');

const upiIdContainer = document.getElementById('upi-id-container');
const upiIdInput = document.getElementById('upi-id');
const upiIdError = document.getElementById('upi-id-error');
const customerSupport = document.getElementById('support');

let cart = {};

/**
 * Render the cart items and total price; enable/disable order button accordingly
 */
function renderCart() {
  const items = Object.values(cart);
  if (items.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotalElem.textContent = 'Total: ₹0.00';
    placeOrderBtn.disabled = true;
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = '';
  items.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-qty" aria-label="Quantity controls for ${item.name}">
        <button aria-label="Decrease quantity" data-id="${item.id}" data-action="decrease">−</button>
        <span aria-live="polite" aria-atomic="true">${item.quantity}</span>
        <button aria-label="Increase quantity" data-id="${item.id}" data-action="increase">+</button>
      </div>
      <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartTotalElem.textContent = `Total: ₹${total.toFixed(2)}`;
  placeOrderBtn.disabled = false;
}

/**
 * Add item to cart or increment quantity
 */
function addToCart(id, name, price) {
  if (cart[id]) {
    cart[id].quantity += 1;
  } else {
    cart[id] = { id, name, price, quantity: 1 };
  }
  renderCart();
}

/**
 * Update item quantity or remove if zero
 */
function updateQuantity(id, action) {
  if (!cart[id]) return;

  if (action === 'increase') {
    cart[id].quantity += 1;
  } else if (action === 'decrease') {
    cart[id].quantity -= 1;
    if (cart[id].quantity <= 0) {
      delete cart[id];
    }
  }
  renderCart();
}

/**
 * Generate a unique order ID
 */
function generateOrderID() {
  return 'ORD' + Date.now() + Math.floor(1000 + Math.random() * 9000);
}

/**
 * Format date/time as string
 */
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
}

/**
 * Create and show a modal dialog with receipt HTML and a close button
 */
function createModal(contentHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.innerHTML = contentHtml;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    cart = {};
    renderCart();
    paymentError.textContent = '';
    clearPaymentInputs();
  });

  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * Download receipt as a .txt file
 * @param {string} text Receipt content
 */
function downloadReceipt(text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canteen_order_receipt.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get the selected payment method or null
 */
function getSelectedPaymentMethod() {
  const payments = document.getElementsByName('payment');
  for (const p of payments) {
    if (p.checked) return p.value;
  }
  return null;
}

/**
 * Clear payment input fields and error messages
 */
function clearPaymentInputs() {
  cardNumberInput.value = '';
  cardNumberError.textContent = '';
  upiIdInput.value = '';
  upiIdError.textContent = '';
  cardNumberContainer.style.display = 'none';
  upiIdContainer.style.display = 'none';
}

/**
 * Show or hide payment input fields based on selected method
 */
function handlePaymentChange() {
  clearPaymentInputs();
  const method = getSelectedPaymentMethod();
  if (method === 'Credit/Debit Card') {
    cardNumberContainer.style.display = 'block';
    cardNumberInput.required = true;
    upiIdInput.required = false;
  } else if (method === 'UPI') {
    upiIdContainer.style.display = 'block';
    upiIdInput.required = true;
    cardNumberInput.required = false;
  } else {
    cardNumberInput.required = false;
    upiIdInput.required = false;
  }
}

/**
 * Build receipt text for download
 */
function buildReceiptText(data) {
  let itemsText = '';
  data.items.forEach(item => {
    itemsText += `${item.name} x ${item.quantity} = ₹${item.lineTotal.toFixed(2)}\n`;
  });

  let paymentDetail = '';
  if (data.paymentMethod === 'Credit/Debit Card' && data.cardNumber)
    paymentDetail = `Card Number: ${data.cardNumber}\n`;
  else if (data.paymentMethod === 'UPI' && data.upiId)
    paymentDetail = `UPI ID: ${data.upiId}\n`;

  return `Order Receipt
-----------------------
Order ID: ${data.orderId}
Name: ${data.customerName}
Date & Time: ${data.orderDate}
Payment Method: ${data.paymentMethod}
${paymentDetail}
Ordered Items:
${itemsText}
Total Price: ₹${data.total.toFixed(2)}

Thank you for your order! Your canteen items will be prepared shortly.
`;
}

// Event listeners

menuContainer.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const itemEl = e.target.closest('.menu-item');
    if (!itemEl) return;
    addToCart(itemEl.dataset.id, itemEl.dataset.name, parseFloat(itemEl.dataset.price));
  }
});

cartItemsContainer.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    updateQuantity(e.target.dataset.id, e.target.dataset.action);
  }
});

const paymentRadios = document.getElementsByName('payment');
Array.from(paymentRadios).forEach(radio => radio.addEventListener('change', handlePaymentChange));

placeOrderBtn.addEventListener('click', () => {
  paymentError.textContent = '';
  cardNumberError.textContent = '';
  upiIdError.textContent = '';

  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty. Please add items before placing an order.');
    return;
  }

  const paymentMethod = getSelectedPaymentMethod();
  if (!paymentMethod) {
    paymentError.textContent = 'Please select a payment method.';
    return;
  }

  if (paymentMethod === 'Credit/Debit Card') {
    const cardVal = cardNumberInput.value.trim();
    if (!cardVal) {
      cardNumberError.textContent = 'Card number is required.';
      return;
    }
    if (!/^\d{13,19}$/.test(cardVal.replace(/\s+/g, ''))) {
      cardNumberError.textContent = 'Enter a valid card number (13 to 19 digits).';
      return;
    }
  }

  if (paymentMethod === 'UPI') {
    const upiVal = upiIdInput.value.trim();
    if (!upiVal) {
      upiIdError.textContent = 'UPI ID is required.';
      return;
    }
    const upiPattern = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/;
    if (!upiPattern.test(upiVal)) {
      upiIdError.textContent = 'Enter a valid UPI ID (e.g. name@bank).';
      return;
    }
  }

  const customerName = prompt('Please enter your name for the order:');
  if (!customerName || !customerName.trim()) {
    alert('Name is required to place order.');
    return;
  }

  const orderId = generateOrderID();
  const orderDateObj = new Date();
  const formattedDate = formatDateTime(orderDateObj);

  let orderTotal = 0;
  let itemsListHtml = '';
  const itemsForReceipt = [];

  Object.values(cart).forEach(item => {
    const lineTotal = item.price * item.quantity;
    orderTotal += lineTotal;
    itemsListHtml += `<li>${item.name} × ${item.quantity} = ₹${lineTotal.toFixed(2)}</li>`;
    itemsForReceipt.push({
      name: item.name,
      quantity: item.quantity,
      lineTotal: lineTotal
    });
  });

  const cardNumberToShow = paymentMethod === 'Credit/Debit Card' ? cardNumberInput.value.trim() : '';
  const upiIdToShow = paymentMethod === 'UPI' ? upiIdInput.value.trim() : '';

  const billHtml = `
    <h2>Order Receipt</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Name:</strong> ${customerName.trim()}</p>
    <p><strong>Date & Time:</strong> ${formattedDate}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    ${cardNumberToShow ? `<p><strong>Card Number:</strong> ${cardNumberToShow}</p>` : ''}
    ${upiIdToShow ? `<p><strong>UPI ID:</strong> ${upiIdToShow}</p>` : ''}
    <h3>Ordered Items:</h3>
    <ul>${itemsListHtml}</ul>
    <p><strong>Total Price:</strong> ₹${orderTotal.toFixed(2)}</p>
    <p>Thank you for your order! Your canteen items will be prepared shortly.</p>
  `;

  const receiptText = buildReceiptText({
    orderId,
    customerName: customerName.trim(),
    orderDate: formattedDate,
    paymentMethod,
    cardNumber: cardNumberToShow,
    upiId: upiIdToShow,
    items: itemsForReceipt,
    total: orderTotal
  });

  createModal(billHtml);

  // Add Receipt Download button dynamically inside modal after append
  // (Alternatively, createModal can be modified to accept and add download button)
  setTimeout(() => {
    const modal = document.querySelector('.modal-content');
    if (!modal) return;

    const existingDownloadBtn = modal.querySelector('.modal-download-btn');
    if (existingDownloadBtn) return; // prevent duplicates

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'modal-close-btn modal-download-btn';
    downloadBtn.textContent = 'Download Receipt';
    downloadBtn.style.marginBottom = '10px';
    downloadBtn.addEventListener('click', () => downloadReceipt(receiptText));
    modal.prepend(downloadBtn);
  }, 0);
});

logoutBtn.addEventListener('click', () => {
  alert('You have been logged out.');
  window.location.href = 'login.html'; // adjust as needed
});

customerSupport.addEventListener("click", function() {
    window.location.assign("support.html")
});

// Initialize
renderCart();
handlePaymentChange();
