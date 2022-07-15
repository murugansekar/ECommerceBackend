const ordersContainer = document.getElementById('ordersContainer')
var orderItems = document.getElementsByClassName("ordersContainer")[0];
const ordersPage = document.getElementById('ordersPage');
axios.get('http://localhost:3000/orders')
.then((res) => { 
    orderItems.innerHTML='';
    if(res.data.orders.length<=0) {console.log("Nothing there!")} 
    else{  
        res.data.orders.forEach(order => {
            var orderId = document.createElement("div")
            orderId.innerHTML = `<br><button class="orderBox-btn"><h2>OrderID : #${order.id}</h2></button>`;
            orderItems.append(orderId) 
            for(let i=0;i<order.products.length;i++)
            {
                display(order.products[i].title,order.products[i].price,order.products[i].OrderDetails.quantity)
            } 
            });
        } 
    })
.catch((err)=>{console.log(err)})

function display(title,price,quantity)
{
    let orderShopBoxx = document.createElement("div")
    orderShopBoxx.classList.add('order-box')
    let orderBoxContent = `
    <div class="order-box">
        <div class="order-product-title">${title}</div>
        <div class="order-price">${price}</div>
        <div class="order-quantity">${quantity}</div>
    </div>`;
    orderShopBoxx.innerHTML = orderBoxContent;
    orderItems.append(orderShopBoxx)
}
