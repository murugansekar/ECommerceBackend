const Product = require('../models/product')
const Cart = require('../models/cart')
const CartItem = require('../models/cart-item')
const Order = require('../models/order')
var ITEMS_PER_PAGE = 2;
exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {res.json({products, success:"true"})})
    .catch(err => {console.log(err);});
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page||1;
  let totalItems;
  Product.findAndCountAll({ offset: (page-1)*ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE })
    .then(products => {
      totalItems = products.count;
      res.json({products,
        currentPage : page,
        totalProducts: products.count,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart=>{return cart.getProducts().then(products => {
    res.json({products, success:"true"})
  }).catch(err => console.log(err))}).catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user.getCart().then(cart => {fetchedCart=cart; return cart.getProducts({where: {id:prodId}})})
  .then(products => {
    let  product;
    if(products.length > 0)
    {
      product = products[0]
    }
    
    if(product)
    {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1
      return product;
      //return fetchedCart.addProduct(product, {through:{quantity: newQuantity}})
    } 
    return Product.findByPk(prodId)
  }).then(product => {
    return fetchedCart.addProduct(product,{through: {quantity: newQuantity}})
  })
  .then(() => {res.status(200).json({success:true})})
  .catch(err => {res.status(500).json({success:false})})
  //res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {return cart.getProducts({where: {id:prodId}})})
  .then(products => {
    const product = products[0];
    return product.cartItem.destroy()
  }).then( result => {
    res.redirect('/cart')
  })
  .catch(err => console.log(err))
};


exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};


exports.getCartIndex = async (req, res, next) => {
  const page = +req.params.pageNumber||1;
  var totalItemss = await CartItem.count()
  req.user.getCart().then(cart=>{return cart.getProducts({ offset: (page-1)*ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE }).then(products => {
    res.json({products,
      currentPage : page,
      totalProducts: totalItemss,
      hasNextPage: ITEMS_PER_PAGE * page < totalItemss,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItemss / ITEMS_PER_PAGE)
    })
  }).catch(err => console.log(err))}).catch(err => console.log(err))
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user.getCart()
    .then(cart => {fetchedCart = cart; return cart.getProducts();})
    .then(products => {return req.user.createOrder()
        .then(order => {return order.addProducts(products.map(product => {
              product.OrderDetails = { quantity: product.cartItem.quantity };
              return product;}) );  })
        .catch(err => console.log(err));
    }).then(result => {return fetchedCart.setProducts(null);})
    .then(result => {res.redirect('/orders');})
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: ['products']})
    .then(orders => {res.json({orders: orders});})
    .catch(err => console.log(err));
};
