let users = JSON.parse(localStorage.getItem("users")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let tab = "shop";

/* ================= DEFAULT PRODUCTS ================= */

function initDefaultProducts(){
    if(localStorage.getItem("init_done")) return;

    products = [
        { id:1, name:"Notebook", price:50, stock:50, image:"./notebook.png", seller:"Admin" },
        { id:2, name:"Slippers", price:120, stock:50, image:"./slippers.png", seller:"Admin" },
        { id:3, name:"School Uniform", price:300, stock:50, image:"./uniform.png", seller:"Admin" }
    ];

    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("init_done", "true");
}

initDefaultProducts();
render();

/* ================= SAVE ================= */

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

function saveProducts(){
    localStorage.setItem("products", JSON.stringify(products));
}

/* ================= UTIL ================= */

function getVal(id){
    return document.getElementById(id).value.trim();
}

function toast(msg){
    let t=document.createElement("div");
    t.className="toast";
    t.innerText=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2000);
}

/* ================= AUTH ================= */

function loginPage(){
    document.getElementById("app").innerHTML=`
    <div class="center"><div class="card">
        <h2>Login</h2>
        <input id="email" placeholder="Email">
        <input id="pass" type="password" placeholder="Password">
        <button onclick="login()">Login</button>

        <p onclick="registerPage()" style="color:#4f46e5;cursor:pointer;margin-top:10px;">
            Create Account
        </p>
    </div></div>`;
}

function registerPage(){
    document.getElementById("app").innerHTML=`
    <div class="center"><div class="card">
        <h2>Create Account</h2>

        <input id="name" placeholder="Full Name">
        <input id="email" placeholder="Email">
        <input id="pass" type="password" placeholder="Password">

        <button onclick="register()">Register</button>

        <p onclick="loginPage()" style="color:#4f46e5;cursor:pointer;margin-top:10px;">
            Back to Login
        </p>
    </div></div>`;
}

function register(){
    let name=getVal("name");
    let email=getVal("email");
    let pass=getVal("pass");

    if(!name||!email||!pass) return toast("Fill all fields");
    if(users.find(u=>u.email===email)) return toast("Email already used");

    users.push({name,email,pass});
    localStorage.setItem("users",JSON.stringify(users));

    toast("Account created!");
    loginPage();
}

function login(){
    let email=getVal("email");
    let pass=getVal("pass");

    let user=users.find(u=>u.email===email && u.pass===pass);
    if(!user) return toast("Invalid login");

    currentUser=user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    render();
}

function logout(){
    currentUser=null;
    render();
}

/* ================= MAIN ================= */

function render(){
    cart = JSON.parse(localStorage.getItem("cart")) || []; // FIX CART SYNC

    if(!currentUser){
        loginPage();
    }else{
        appPage();
    }
}

/* ================= APP ================= */

function appPage(){
    document.getElementById("app").innerHTML=`
    <div class="header">
        <div class="brand">CampusCart</div>

        <div class="nav">
            <button onclick="switchTab('shop')">Shop</button>
            <button onclick="switchTab('add')">Add</button>
            <button onclick="switchTab('cart')">Cart (${cart.length})</button>
            <button onclick="logout()">Logout</button>
        </div>
    </div>

    <div class="hero">
        <h1>Campus Marketplace</h1>
    </div>

    <div id="content"></div>`;

    renderTab();
}

function switchTab(t){
    tab=t;
    renderTab();
}

/* ================= TABS ================= */

function renderTab(){
    let c=document.getElementById("content");

    if(tab==="shop"){
        c.innerHTML=`<div class="grid" id="list"></div>`;
        showProducts();
    }

    if(tab==="add"){
        c.innerHTML=`
        <div class="center"><div class="card">
            <input id="pname" placeholder="Product Name">
            <input id="price" placeholder="Price">
            <input id="stock" placeholder="Stock">
            <input type="file" id="img">
            <button onclick="addProduct()">Add</button>
        </div></div>`;
    }

    if(tab==="cart") showCart();
}

/* ================= PRODUCTS ================= */

function addProduct(){
    let name=getVal("pname");
    let price=getVal("price");
    let stock=getVal("stock");
    let file=document.getElementById("img").files[0];

    let reader=new FileReader();

    reader.onload=()=>{

        products.unshift({
            id:Date.now(),
            name,
            price:Number(price),
            stock:Number(stock),
            image:reader.result,
            seller:currentUser.name
        });

        saveProducts();
        toast("Product added!");
        switchTab("shop");
    };

    reader.readAsDataURL(file);
}

/* ================= SHOW PRODUCTS ================= */

function showProducts(){
    let list=document.getElementById("list");
    list.innerHTML="";

    products = JSON.parse(localStorage.getItem("products")) || [];

    products.forEach(p=>{

        let stockText = p.stock > 0 ? `Stock: ${p.stock}` : "SOLD OUT";

        list.innerHTML+=`
        <div class="product">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>₱${p.price}</p>
            <small>${stockText}</small>

            <button onclick="openBuyModal(${p.id})">Buy</button>
            <button onclick="addToCart(${p.id})">Add Cart</button>
        </div>`;
    });
}

/* ================= BUY POPUP ================= */

function openBuyModal(id){
    let p=products.find(x=>x.id===id);

    document.getElementById("content").innerHTML=`
    <div class="center"><div class="card">

        <h2>Complete Your Info</h2>

        <input id="address" placeholder="Address">
        <input id="phone" placeholder="Phone Number">

        <hr>

        <h3>${p.name}</h3>
        <p>₱${p.price}</p>
        <p>Stock: ${p.stock}</p>

        <button onclick="confirmBuy(${p.id})">Confirm Buy</button>
        <button onclick="switchTab('shop')">Cancel</button>

    </div></div>`;
}

/* ================= BUY ================= */

function confirmBuy(id){
    let p=products.find(x=>x.id===id);

    if(!p || p.stock<=0) return toast("Out of stock");

    p.stock--;

    cart.push({
        id:p.id,
        name:p.name,
        price:p.price,
        image:p.image,
        seller:p.seller,
        address: getVal("address"),
        phone: getVal("phone")
    });

    saveProducts();
    saveCart();

    toast("Order placed!");
    switchTab("cart");
}

/* ================= ADD TO CART ================= */

function addToCart(id){
    let p=products.find(x=>x.id===id);

    if(!p || p.stock<=0) return toast("Out of stock");

    p.stock--;

    cart.push({
        id:p.id,
        name:p.name,
        price:p.price,
        image:p.image,
        seller:p.seller
    });

    saveProducts();
    saveCart();

    toast("Added!");
    render();
}

/* ================= CART ================= */

function showCart(){
    let c=document.getElementById("content");

    if(cart.length===0){
        c.innerHTML=`<div class="center"><div class="card">Empty Cart</div></div>`;
        return;
    }

    let total=cart.reduce((a,b)=>a+Number(b.price),0);

    c.innerHTML=`
    <div class="center"><div class="card">

        <h3>Your Cart</h3>

        ${cart.map(i=>`
            <div style="padding:10px;border-bottom:1px solid #eee;">
                <img src="${i.image}" width="50" style="border-radius:8px">

                <p><b>${i.name}</b></p>
                <p>Price: ₱${i.price}</p>
                <p>Seller: ${i.seller}</p>

                ${i.address ? `<p>Address: ${i.address}</p>` : ""}
                ${i.phone ? `<p>Phone: ${i.phone}</p>` : ""}
            </div>
        `).join("")}

        <h3>Total: ₱${total}</h3>

        <button onclick="checkout()">Checkout</button>

    </div></div>`;
}

/* ================= CHECKOUT ================= */

function checkout(){
    cart = []; // CLEAR CART
    saveCart();
    toast("Success!");
    render(); // 🔥 FIX RESET CART BADGE TO 0
}