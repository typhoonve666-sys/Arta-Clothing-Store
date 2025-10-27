/* ========== Core Helpers ========== */
const _ = (sel, ctx = document) => ctx.querySelector(sel);
const __ = (sel, ctx = document) => ctx.querySelectorAll(sel);
const on = (el, ev, fn) => el.addEventListener(ev, fn);


/* ========== Cart ========== */
let cart = JSON.parse(localStorage.getItem('artaCart')) || [];
const saveCart = () => localStorage.setItem('artaCart', JSON.stringify(cart));


function addToCart(id) {
  const products = getAllProducts(); // ← اینو اضافه کن
  const item = products.find(p => p.id === id);
  if (!item) return;
  const exist = cart.find(c => c.id === id);
  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1
    });
  }
  saveCart();
  renderCart();
  updateCount();
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
  updateCount();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeItem(id);
  saveCart();
  renderCart();
  updateCount();
}

function updateCount() {
  const count = cart.reduce((a, b) => a + b.qty, 0);
  _('#cartCount').textContent = count;
}

function updateTotal() {
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);
  _('#totalPrice').textContent = total.toLocaleString('fa-IR') + ' تومان';
}

/* ========== Product Details Modal ========== */
let currentProduct = null;

function openPro(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;

  _('#proName').textContent = currentProduct.name;
  _('#proPrice').textContent = currentProduct.price.toLocaleString('fa-IR') + ' تومان';
  _('#proImg').src = currentProduct.image;

  // رنگ‌ها
  _('#proColorBtns').innerHTML = currentProduct.colors
    .map(c => `<button class="color-btn" onclick="selectColor(this)">${c}</button>`)
    .join('');

  // سایزها
  _('#proSizeBtns').innerHTML = currentProduct.sizes
    .map(s => `<button class="size-btn" onclick="selectSize(this)">${s}</button>`)
    .join('');

  // ویژگی‌ها & توضیحات
  _('#proSpecs').innerHTML = currentProduct.specs?.map(s => `<li>${s}</li>`).join('') || '';
  _('#proDesc').textContent = currentProduct.description || 'توضیحاتی ثبت نشده.';

  _('#proModal').style.display = 'grid';
}

function closePro() {
  _('#proModal').style.display = 'none';
}

function selectColor(btn) {
  btn.parentElement.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectSize(btn) {
  btn.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function toggleAcc(head) {
  const body = head.nextElementSibling;
  body.classList.toggle('open');
  if (document.body.classList.contains('dark')) {
    head.style.background = '#333';
    body.style.background = '#222';
  }
}

/* ========== Action Buttons Inside Modal ========== */
function orderWhatsApp() {
  const color = $('.color-btn.active')?.textContent || 'انتخاب نشده';
  const size = $('.size-btn.active')?.textContent || 'انتخاب نشده';
  const msg = `سلام، لطفاً "${currentProduct.name}" رنگ ${color} سایز ${size} رو برام سفارش بدی.`;
  window.open(`https://wa.me/989123456789?text=${encodeURIComponent(msg)}`, '_blank');
}

function fastOrder() {
  alert('سفارش سریع شما ثبت شد؛ در اسرع وقت با شما تماس گرفته می‌شود.');
}

function sizeHelp() {
  alert('کارشناسان ما به زودی برای راهنمایی سایز مناسب با شما تماس می‌گیرند.');
}

/* ========== Dark Mode ========== */
$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('t', document.body.classList.contains('dark') ? 'd' : 'l');
});
if (localStorage.getItem('t') === 'd') document.body.classList.add('dark');

/* ========== Auth ========== */
let isLogin = true;
function toggleAuth() {
  _('#authModal').classList.toggle('active');
}
function toggleAuthMode() {
  isLogin = !isLogin;
  _('#authTitle').textContent = isLogin ? 'ورود به حساب' : 'ثبت‌نام';
  _('#name').style.display = isLogin ? 'none' : 'block';
  _('#authModal form button').textContent = isLogin ? 'ورود' : 'ثبت‌نام';
  _('#switchText').innerHTML = isLogin ? 'حساب ندارید؟' : 'حساب دارید؟';
}
function submitAuth(e) {
  e.preventDefault();
  const phone = _('#phone').value.trim();
  const password = _('#password').value;
  const name = _('#name').value.trim();
  if (!isLogin && !name) return alert('نام خود را وارد کنید!');
  localStorage.setItem('artaUser', JSON.stringify({ phone, name: name || 'کاربر' }));
  toggleAuth();
  updateUserLabel();
  alert(isLogin ? 'با موفقیت وارد شدید!' : 'ثبت‌نام شما انجام شد!');
}
function updateUserLabel() {
  const user = JSON.parse(localStorage.getItem('artaUser'));
  _('#userLabel').textContent = user ? `سلام، ${user.name}` : 'ورود / ثبت‌نام';
}

/* ========== Filter ========== */
function filterProducts() {
  const s = _('#searchInput').value.trim();
  const c = _('#colorFilter').value;
  const p = _('#priceFilter').value;

  let filtered = products.filter(pr => {
    if (s && !pr.name.includes(s)) return false;
    if (c && !pr.colors.includes(c)) return false;
    if (p) {
      const [min, max] = p.split('-').map(Number);
      if (pr.price < min || pr.price > max) return false;
    }
    return true;
  });
  renderProducts(filtered);
}

/* ========== Render Products ========== */
function renderProducts(list = products) {
  const container = _('#productsContainer');
  container.innerHTML = '';
  list.forEach(p => {
    container.insertAdjacentHTML('beforeend', `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="price">${p.price.toLocaleString('fa-IR')} تومان</div>
          <div class="props">${p.props || ''}</div>
          <button onclick="addToCart(${p.id})">افزودن به سبد</button>
          <button class="detail-btn" onclick="openPro(${p.id})">مشاهده کامل</button>
        </div>
      </div>
    `);
  });
}

/* ========== Init ========== */
renderProducts();
updateCount();
updateUserLabel();


function submitOrder() {
  const orderDetails = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      cart: JSON.stringify(cart),
      totalPrice: document.getElementById("totalPrice").innerText,
  };

  fetch("/submit-order", {
      method: "POST",
      body: JSON.stringify(orderDetails),
      headers: {
          "Content-Type": "application/json",
      },
  }).then(response => response.json()).then(data => {
      if (data.success) {
          alert("سفارش شما با موفقیت ثبت شد.");
          // ارسال پیام یا ایمیل
          sendEmailToAdmin(orderDetails);
      } else {
          alert("خطا در ثبت سفارش.");
      }
  });
}

function sendEmailToAdmin(orderDetails) {
  // این تابع باید از یک سرویس ایمیل برای ارسال اطلاعات سفارش به شما استفاده کند
}
document.getElementById('checkout-form').addEventListener('submit', function (e) {
  // انیمیشن
  document.getElementById('order-status').style.display = 'block';
  document.getElementById('order-complete').style.display = 'none';

  // اجازه بده فرم طبیعی ارسال شود
  // e.preventDefault();   ← این خط را پاک کن یا کامنت کن
});


// داده‌های نمونه برای سفارشات و محصولات
const orders = [
  { orderId: 1, customerName: "علی محمدی", products: "تی‌شرت برند مشکی", totalAmount: 189000, status: "در حال پردازش" },
  { orderId: 2, customerName: "سارا رضایی", products: "تی‌شرت برند آبی", totalAmount: 250000, status: "ارسال شده" },
  { orderId: 3, customerName: "محمد حسین‌زاده", products: "تی‌شرت برند سفید", totalAmount: 500000, status: "در حال پردازش" }
];

const products = JSON.parse(localStorage.getItem('products')) || [];

// رندر کردن سفارشات
function renderOrders() {
  const ordersTableBody = document.getElementById("ordersTable").getElementsByTagName("tbody")[0];
  ordersTableBody.innerHTML = ""; // Clear previous data

  orders.forEach(order => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${order.orderId}</td>
          <td>${order.customerName}</td>
          <td>${order.products}</td>
          <td>${order.totalAmount.toLocaleString('fa-IR')} تومان</td>
          <td>${order.status}</td>
          <td>
              <button onclick="changeOrderStatus(${order.orderId})">تغییر وضعیت</button>
          </td>
      `;

      ordersTableBody.appendChild(row);
  });
}

// تغییر وضعیت سفارش
function changeOrderStatus(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (order) {
      if (order.status === "در حال پردازش") {
          order.status = "ارسال شده";
      } else {
          order.status = "در حال پردازش";
      }
      renderOrders(); // دوباره سفارشات را رندر می‌کنیم
  }
}

// رندر کردن محصولات
function renderProducts() {
  const productsTableBody = document.getElementById("productsTable").getElementsByTagName("tbody")[0];
  productsTableBody.innerHTML = ""; // Clear previous data

  products.forEach(product => {
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.price.toLocaleString('fa-IR')} تومان</td>
          <td><img src="${product.image}" alt="${product.name}" style="width:50px;"></td>
          <td>
              <button onclick="editProduct(${product.id})">ویرایش</button>
              <button onclick="deleteProduct(${product.id})">حذف</button>
          </td>
      `;

      productsTableBody.appendChild(row);
  });
}

// ویرایش محصول
function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) {
      alert(`ویرایش محصول: ${product.name}`);
      // اینجا باید کد ویرایش محصول را بنویسید
  }
}

// حذف محصول
function deleteProduct(id) {
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
      products.splice(index, 1); // حذف محصول
      renderProducts(); // دوباره جدول را رندر می‌کنیم
  }
}

// افزودن محصول جدید
document.getElementById("addProductForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("productName").value;
  const price = parseInt(document.getElementById("productPrice").value);
  const image = document.getElementById("productImage").files[0];

  if (name && price && image) {
      const newProduct = {
          id: products.length + 1,
          name: name,
          price: price,
          img: URL.createObjectURL(image) // فقط برای نمایش تصویر در مرورگر
      };
      products.push(newProduct);
      renderProducts(); // جدول محصولات را دوباره رندر می‌کنیم
      document.getElementById("addProductForm").reset(); // پاک کردن فرم
  }
});

// بارگذاری داده‌ها
renderOrders();
renderProducts();

// بارگذاری محصولات از localStorage
function renderProductsInSite() {
  const productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = ""; // پاک کردن داده‌های قبلی

  // دریافت محصولات از localStorage
  const products = JSON.parse(localStorage.getItem("products")) || [];

  // نمایش هر محصول در صفحه
  products.forEach(product => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `
          <img src="${product.image}" alt="${product.name}" style="width:100px;">
          <h3>${product.name}</h3>
          <p>${product.price.toLocaleString('fa-IR')} تومان</p>
      `;

      productsContainer.appendChild(productCard);
  });
}

// بارگذاری محصولات در سایت هنگام بارگذاری صفحه
renderProductsInSite();

// داخل پنل، قبل از ذخیره در localStorage
const canvas = document.createElement('canvas');
const ctx    = canvas.getContext('2d');
const size   = Math.min(img.width, img.height); // مربع
canvas.width = canvas.height = size;
ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, 0, 0, size, size);
const squareBase64 = canvas.toDataURL('image/jpeg', 0.9);

// squareBase64 را ذخیره کن



function renderCart() {
  const cart = JSON.parse(localStorage.getItem('artaCart')) || [];
  const container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = '';
  if (!cart.length) {
      container.innerHTML = '<p style="text-align:center;">سبد خالی است</p>';
      return;
  }

  cart.forEach(item => {
      container.innerHTML += `
          <div class="cart-item" style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border:1px solid #ddd;padding:6px;border-radius:4px;">
              <img src="${item.image || 'placeholder.png'}" width="50" style="border-radius:4px;object-fit:cover;">
              <div>
                  <div><strong>${item.name}</strong></div>
                  <div>${item.price.toLocaleString('fa-IR')} تومان</div>
                  <div>تعداد: ${item.qty}</div>
              </div>
              <button onclick="removeItem(${item.id})" style="margin-right:auto;background:#e91e63;color:#fff;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">حذف</button>
          </div>
      `;
  });
}

function updateCount() {
  const cart = JSON.parse(localStorage.getItem('artaCart')) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

renderCart();

let lastProductsHash = '';
setInterval(() => {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const newHash = JSON.stringify(products);
  if (newHash !== lastProductsHash) {
    lastProductsHash = newHash;
    renderProducts(); // همون تابعی که الان داری
  }


  /*****************************************************************
 * ۱) ترکیب محصولاتِ دستی + محصولاتِ پنل مدیرت (localStorage)
 *****************************************************************/
const hardCodedProducts = [
  {id:1 ,name:'تی‌شرت مشکی',price:189000,image:'./tshirt-black.png'},
  {id:2 ,name:'تی‌شرت آبی', price:189000,image:'images/tshirt-blue.png'},
  {id:3 ,name:'تی‌شرت سفید',price:500000,image:'images/tshirt-white.png'},
  {id:4 ,name:'تی‌شرت قهوه‌ای',price:189000,image:'images/tshirt-brown.png'}
];

function getAllProducts() {
  const panel = JSON.parse(localStorage.getItem('products')) || [];
  return [...hardCodedProducts, ...panel];
}

/*****************************************************************
 * ۲) رِندرِ صفحه‌ی اصلی از ترکیب بالا + به‌روزرسانی خودکار
 *****************************************************************/
function renderProducts(list = getAllProducts()) {
  const container = _('#productsContainer');
  container.innerHTML = '';
  list.forEach(p => {
    container.insertAdjacentHTML('beforeend', `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="card-body">
          <h3>${p.name}</h3>
          <div class="price">${p.price.toLocaleString('fa-IR')} تومان</div>
          <div class="props">${p.props || ''}</div>
          <button onclick="addToCart(${p.id})">افزودن به سبد</button>
        </div>
      </div>
    `);
  });
}

// اولین نمایش
renderProducts();

// به‌روزرسانیِ بی‌رفرش هر ۲ ثانیه
let lastHash = '';
setInterval(() => {
  const current = JSON.stringify(getAllProducts());
  if (current !== lastHash) {
    lastHash = current;
    renderProducts();
  }
}, 2000);




/*****************************************************************
 * ۳) اضافه کردنِ سریع به سبد + رندرِ لحظه‌ای سبد
 *****************************************************************/
function addToCart(id) {
  const products = getAllProducts(); // ← اینو اضافه کن
  const item = products.find(p => p.id === id);
  if (!item) return;
  const exist = cart.find(c => c.id === id);
  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: 1
    });
  }
  saveCart();
  renderCart();
  updateCount();
}
});


/* ==================== متغیر وضعیت ==================== */
(function () {
  let isLogin = true; // دیگر خطای تعریف مجدد نمی‌دهد
  // بقیه کدهایتان اینجا بیاید...
})(); // true = ورود | false = ثبت‌نام

/* ==================== توکن & هش ساده ==================== */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(16);
}
function generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
}

/* ==================== باز/بستن مودال ==================== */
function toggleAuth() {
    document.getElementById('authModal').classList.toggle('active');
    document.getElementById('authError').style.display = 'none';
}

/* ==================== toggle بين ورود/ثبت‌نام ==================== */
function toggleAuthMode() {
    isLogin = !isLogin;
    document.getElementById('authTitle').textContent = isLogin ? 'ورود به حساب' : 'ثبت‌نام';
    document.getElementById('name').style.display = isLogin ? 'none' : 'block';
    document.getElementById('submitBtn').textContent = isLogin ? 'ورود' : 'ثبت‌نام';
    document.getElementById('switchText').innerHTML = isLogin
        ? 'حساب ندارید؟ <a href="#" id="switchLink">ثبت‌نام کنید</a>'
        : 'حساب دارید؟ <a href="#" id="switchLink">وارد شوید</a>';
    document.getElementById('switchLink').addEventListener('click', e => {
        e.preventDefault();
        toggleAuthMode();
    });
}

/* ==================== ارسال فرم ==================== */
function submitAuth(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value.trim();
    const errorBox = document.getElementById('authError');

    // اعتبارسنجی سخت‌گیرانه
    const phonePattern = /^09[0-9]{9}$/;
    if (!phonePattern.test(phone)) {
        errorBox.textContent = 'شماره موبایل معتبر وارد کنید (09...)';
        errorBox.style.display = 'block';
        return;
    }
    if (password.length < 8) {
        errorBox.textContent = 'رمز عبور حداقل ۸ کاراکتر باشد';
        errorBox.style.display = 'block';
        return;
    }
    if (!isLogin && name.length < 3) {
        errorBox.textContent = 'نام کامل حداقل ۳ کاراکتر باشد';
        errorBox.style.display = 'block';
        return;
    }

    const userKey = `user_${phone}`;
    const hashedPass = simpleHash(password);

    if (isLogin) {
        /* ====== ورود ====== */
        const existing = JSON.parse(localStorage.getItem(userKey));
        if (!existing) {
            errorBox.textContent = 'حسابی با این شماره یافت نشد!';
            errorBox.style.display = 'block';
            return;
        }
        if (existing.hashedPass !== hashedPass) {
            errorBox.textContent = 'رمز عبور اشتباه است';
            errorBox.style.display = 'block';
            return;
        }
        // ذخیره توکن موقت
        const token = generateToken();
        sessionStorage.setItem('artaUserToken', token);
        sessionStorage.setItem('artaUser', JSON.stringify({phone, name: existing.name}));
    } else {
        /* ====== ثبت‌نام ====== */
        if (localStorage.getItem(userKey)) {
            errorBox.textContent = 'این شماره قبلاً ثبت‌نام کرده!';
            errorBox.style.display = 'block';
            return;
        }
        const userData = {name, phone, hashedPass};
        localStorage.setItem(userKey, JSON.stringify(userData));
        // لاگین خودکار پس از ثبت‌نام
        const token = generateToken();
        sessionStorage.setItem('artaUserToken', token);
        sessionStorage.setItem('artaUser', JSON.stringify({phone, name}));
    }

    toggleAuth();
    updateUserLabel();
    alert(isLogin ? 'با موفقیت وارد شدید!' : 'ثبت‌نام و ورود شما انجام شد!');
}

/* ==================== بستن مودال با کلیک بیرون ==================== */
window.addEventListener('click', e => {
    const modal = document.getElementById('authModal');
    if (e.target === modal) toggleAuth();
});

/* ==================== نمایش نام کاربر ==================== */
function updateUserLabel() {
    const user = JSON.parse(sessionStorage.getItem('artaUser'));
    document.getElementById('userLabel').textContent = user ? `سلام، ${user.name}` : 'ورود / ثبت‌نام';
}

/* ==================== بررسی ورود خودکار (صفحه لود) ================== */
(function () {
    updateUserLabel();
    // اگر بخواهید صفحه‌ای خاص فقط برای کاربران لاگین‌شده باشد:
    // if (!sessionStorage.getItem('artaUserToken')) location.href = 'login.html';
})();

/* ==================== شناسایی رویدادها ==================== */
document.getElementById('authForm').addEventListener('submit', submitAuth);
document.getElementById('switchLink').addEventListener('click', e => {
    e.preventDefault();
    toggleAuthMode();
});







