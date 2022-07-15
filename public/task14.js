const conatiner = document.getElementById('shopping');
const paginationc = document.getElementById('pagination')
const toastContainer = document.getElementById('toastContainer')
const cartIcon = document.getElementById('cart-icon')
const cart = document.querySelector('.cart')
const closeCart = document.getElementById('close-cart')
var paginationItems = document.getElementsByClassName("pagination")[0];
var productItems = document.getElementsByClassName("shop-content")[0];
var cartItems = document.getElementsByClassName("cart-content")[0];
var paginationCartItems = document.getElementsByClassName("paginationCart")[0];
const paginationcc = document.getElementById('paginationCart')

cartIcon.onclick = () => {
    displayCartPage(1)
}

function displayCartPage(cartPage)
{
    let urll= "http://3.101.37.27:3000/cart/"+cartPage;
    axios.get(urll).then((res)=>{
        cartItems.innerHTML='' 
        paginationCartItems.innerHTML=''   
        for(var i=0;i<res.data.products.length;i++)
        {
            var title = res.data.products[i].title;
            var price = res.data.products[i].price;
            var quantity = res.data.products[i].cartItem.quantity;
            var img = res.data.products[i].imageUrl;
            displayCart(title,price,img,quantity)
        }
        if(res.data.currentPage!==1 && res.data.previousPage!==1 )
            paginationCart(1)
        if(res.data.hasPreviousPage)
            paginationCart(res.data.previousPage)
        paginationCart(res.data.currentPage)
        if(res.data.hasNextPage)
            paginationCart(res.data.nextPage)       
        updateTotal();
        
        }).catch((err)=>console.log(err))   
}

closeCart.onclick = () => {
    cart.classList.remove("active")
}

if(document.readyState=='loading')
{
    document.addEventListener('DOMContentLoaded',ready)
}
else
{
    ready();
}

function ready()
{
    var removeCartButtons = document.getElementsByClassName('cart-remove')
    for(let i=0;i<removeCartButtons.length;i++)
    {
        var button = removeCartButtons[i]
        button.addEventListener('click', removeCartItem)
    }
    var quantityInputs = document.getElementsByClassName('cart-quantity')
    for(var i=0;i< quantityInputs.length;i++)
    {
        var input = quantityInputs[i]
        input.addEventListener('change',quantityChanged)
    }
}

function quantityChanged(e)
{
    var input = e.target
    if(isNaN(input.value)||input.value<=0)
    input.value=1;
    updateTotal()
}

function removeCartItem(e)
{
    var buttonClicked = e.target;
    buttonClicked.parentElement.remove();
    updateTotal();
}

function initialzing()
{
    paginationItems.innerHTML=''
    productItems.innerHTML=''
}

function updateTotal()
{
    axios.get('http://3.101.37.27:3000/cart').then((res)=>{
        var total=0;
        for(var i=0;i<res.data.products.length;i++)
        {
            var price = parseFloat(res.data.products[i].price);
            var quantity = parseFloat(res.data.products[i].cartItem.quantity);
            total=total+price*quantity
        }
        total=Math.round(total*100)/100;
        document.getElementsByClassName('total-price')[0].innerText = "$"+total;
        cart.classList.add("active");
    }).catch((err)=>console.log(err))                      
}

conatiner.addEventListener('click',(e)=>{
    if (e.target.className=='add-cart')
    {
        const id = e.target.parentNode.id
        const img = document.querySelector(`#${id} img`).src;
        const title = document.querySelector(`#${id} h2`).innerText;
        const price = document.querySelector(`#${id} span`).innerText;
        const actualId = `${id.slice(1)}`;
        addToCart(actualId,title)       
    }
})

paginationc.addEventListener('click',(e)=>{
    if(e.target.className=='pagination-btn')
    {
        const pageNumber = `${e.target.id.slice(3)}`
        displayPage(pageNumber)
    }
})

paginationcc.addEventListener('click',(e)=>{
    if(e.target.className=='paginationCart-btn')
    {
        const pageNumber = `${e.target.id.slice(4)}`
        displayCartPage(pageNumber)
    }
})

function Toast(title)
    {
        const notification = document.createElement('div')
        notification.classList.add("toast")
        notification.innerHTML = "Your Product : "+title+" is added to the cart";
        toastContainer.appendChild(notification)
        setTimeout(()=>{notification.remove()},600)
    }

document.getElementsByClassName("btn-buy")[0].addEventListener("click",PurchaseButtonClicked)

function PurchaseButtonClicked()
{
    axios.post('http://3.101.37.27:3000/createOrder')
    .then((res) => { 
        const lastOrderIndex = res.data.orders.length
        const orderId = res.data.orders[lastOrderIndex-1].id
        alert(" Order sucessfully placed with order id = " + orderId);
    })
    .catch((err)=>{console.log(err)})
    
}


window.addEventListener('DOMContentLoaded', () =>{displayPage(1)})

function displayPage(pno)
{
    let url = "http://3.101.37.27:3000/?page="+pno;
    axios.get(url).then((data)=>{
        initialzing()
        for(var i=0;i<data.data.products.rows.length;i++)
        {
            var title=data.data.products.rows[i].title;
            var price=data.data.products.rows[i].price;
            var imgUrl=data.data.products.rows[i].imageUrl;
            var id=data.data.products.rows[i].id;
            displayProducts(title,price,imgUrl,id)
        }
        if(data.data.currentPage!==1 && data.data.previousPage!==1 )
        pagination(1)
        if(data.data.hasPreviousPage)
            pagination(data.data.previousPage)
        pagination(data.data.currentPage)
        if(data.data.hasNextPage)
            pagination(data.data.nextPage)       
    })
}

function pagination(pageNumber)
{
    var paginationBox = document.createElement("div")
    paginationBox.innerHTML = `<button class="pagination-btn" id="pno${pageNumber}">${pageNumber}</button>`;
    paginationItems.append(paginationBox)       
}
function paginationCart(pageNumber)
{
    var paginationCartBox = document.createElement("div")
    paginationCartBox.innerHTML = `<button class="paginationCart-btn" id="cpno${pageNumber}">${pageNumber}</button>`;
    paginationCartItems.append(paginationCartBox)       
}

function displayProducts(title,price,imgUrl,id)
{
    var productBox = document.createElement("div")
    productBox.classList.add('product-box')
    var productBoxContent =`<div class="product-box" id="p${id}">
                                <img src="${imgUrl}" alt="" class="product-img">
                                <h2 class="product-title">${title}</h2>
                                <span class="price">$${price}</span>
                                <button class="add-cart">Add to Cart</button>
                            </div>`; 
    productBox.innerHTML = productBoxContent;
    productItems.append(productBox)   
}

function addToCart(productId,title)
{
    axios.post('http://3.101.37.27:3000/cart', {productId:productId}).then((res) => {
        Toast(title);updateTotal();
    }).catch((err)=>{console.log(err)})
}


function displayCart(title,price,img,quantity)
{
    var cartShopBox = document.createElement("div")
    cartShopBox.classList.add('cart-box')
    var cartBoxContent = `
    <img src="${img}" alt="" class="cart-img">
    <div class="detail-box">
        <div class="cart-product-title">${title}</div>
        <div class="cart-price">${price}</div>
        <input type="number" value="${quantity}" class="cart-quantity">
    </div>
    <i class='bx bxs-trash cart-remove'></i>`;
    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox)
    cartShopBox.getElementsByClassName('cart-remove')[0].addEventListener('click', removeCartItem)
    cartShopBox.getElementsByClassName('cart-quantity')[0].addEventListener('change', quantityChanged)
}





















