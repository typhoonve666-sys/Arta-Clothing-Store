const orders = [
    { orderId: 1, customerName: "علی محمدی", products: "تی‌شرت برند مشکی", totalAmount: 189000, status: "در حال پردازش" },
    { orderId: 2, customerName: "سارا رضایی", products: "تی‌شرت برند آبی", totalAmount: 250000, status: "ارسال شده" },
    { orderId: 3, customerName: "محمد حسین‌زاده", products: "تی‌شرت برند سفید", totalAmount: 500000, status: "در حال پردازش" }
];

const products = [
    { id: 1, name: "تی‌شرت برند مشکی", price: 189000, img: "images/tshirt-black.png" },
    { id: 2, name: "تی‌شرت برند آبی", price: 250000, img: "images/tshirt-blue.png" },
    { id: 3, name: "تی‌شرت برند سفید", price: 500000, img: "images/tshirt-white.png" }
];

// رندر کردن سفارشات
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const tbody  = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">هیچ سفارشی ثبت نشده است.</td></tr>';
        return;
    }

    orders.forEach((order, idx) => {
        const productsText = Array.isArray(order.products)
            ? order.products.map(p => `${p.name} (${p.quantity || 1} عدد)`).join(' ، ')
            : (order.products || '---');

        const row = document.createElement('tr');
        row.innerHTML = `
       <td>${idx + 1}</td>
        <td>${order.name || '---'}</td>
        <td>${productsText}</td>
        <td>${Number(order.totalPrice || 0).toLocaleString('fa-IR')} تومان</td>
        <td>${order.location || '---'}</td>
        <td>${order.phone || '---'}</td>
        <td>${order.status || 'در حال پردازش'}</td>
        <td><button onclick="changeOrderStatus(${index})">تغییر وضعیت</button></td>
       <td><button class="btn-del" onclick="deleteContact(${idx})">🗑 حذف</button></td>
    `;
        tbody.appendChild(row);
    });
}

// --------------------------------------------------
// 2. تغییر وضعیت سفارش
// --------------------------------------------------
function changeOrderStatus(index) {

    /* --------- حذف مخاطب --------- */
function deleteContact(index) {
    if (!confirm('آیا مطمئن هستید می‌خواهید این سفارش را حذف کنید؟')) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.splice(index, 1);                 // حذف از آرایه
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();                            // به‌روزرسانی جدول (بدون رفرش کامل صفحه)
}
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders[index]) {
        orders[index].status = orders[index].status === 'در حال پردازش' ? 'ارسال شده' : 'در حال پردازش';
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();          // رفرش جدول
    }
}

// --------------------------------------------------
// 3. بارگذاری محصولات از LocalStorage
// --------------------------------------------------
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody  = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">محصولی ثبت نشده است.</td></tr>';
        return;
    }

    products.forEach((p, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${Number(p.price || 0).toLocaleString('fa-IR')} تومان</td>
            <td><img src="${p.image || p.img}" alt="${p.name}" style="width:60px;border-radius:8px;"></td>
            <td>
                <button onclick="editProduct(${p.id})">ویرایش</button>
                <button onclick="deleteProduct(${idx})">حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// --------------------------------------------------
// 4. حذف محصول
// --------------------------------------------------
function deleteProduct(index) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

// --------------------------------------------------
// 5. افزودن محصول جدید
// --------------------------------------------------
document.getElementById('addProductForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name  = document.getElementById('productName').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const desc  = document.getElementById('productDescription').value.trim();
    const file  = document.getElementById('productImage').files[0];

    if (!name || !price || !file) {
        alert("لطفاً همه فیلدها را پر کنید.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({
            id: Date.now(),
            name: name,
            price: price,
            description: desc,
            image: ev.target.result      // Base64
        });
        localStorage.setItem('products', JSON.stringify(products));
        alert("محصول افزوده شد.");
        e.target.reset();
        loadProducts();
    };
    reader.readAsDataURL(file);
});

// --------------------------------------------------
// 6. اجرای اولیه
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadProducts();
});

// بعد از ذخیره محصول جدید
localStorage.setItem('products', JSON.stringify(products));

// ارسال سیگنال به صفحه اصلی (اختیاری ولی کاربردی)
window.dispatchEvent(new Event('storage'));

// بعد از ذخیره محصول جدید
localStorage.setItem('products', JSON.stringify(products));

// ارسال سیگنال به صفحه اصلی (اختیاری ولی کاربردی)
window.dispatchEvent(new Event('storage'));

document.getElementById('productsGrid')

/* ---------- ویرایش محصول ---------- */
function editProduct(index){
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const p = products[index];
    if(!p) return;
  
    document.getElementById('editIndex').value   = index;
    document.getElementById('editName').value    = p.name;
    document.getElementById('editPrice').value   = p.price;
    document.getElementById('editDesc').value    = p.description || '';
    document.getElementById('editImage').value   = p.image;
    document.getElementById('editProductModal').style.display = 'block';
  }
  
  function saveEdit(){
    const idx = document.getElementById('editIndex').value;
    const products = JSON.parse(localStorage.getItem('products')) || [];
    if(!products[idx]) return;
  
    products[idx].name        = document.getElementById('editName').value.trim();
    products[idx].price       = parseInt(document.getElementById('editPrice').value);
    products[idx].description = document.getElementById('editDesc').value.trim();
    products[idx].image       = document.getElementById('editImage').value.trim();
  
    localStorage.setItem('products', JSON.stringify(products));
    document.getElementById('editProductModal').style.display = 'none';
    loadProducts();   // رفرش جدول
  }
  
  /* بستن مودال با × */
  document.querySelector('#editProductModal .close').onclick = () =>
    document.getElementById('editProductModal').style.display = 'none';

  function deleteContact(index) {
    if (!confirm('آیا مطمئن هستید می‌خواهید این سفارش را حذف کنید؟')) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.splice(index, 1);                 // حذف از آرایه
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();                            // به‌روزرسانی جدول (بدون رفرش کامل صفحه)
}

console.log('loadOrders اجرا شد، تعداد سفارشات:', orders.length);