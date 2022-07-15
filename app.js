const path = require('path');
const express = require('express');

const dotenv = require('dotenv')
dotenv.config()

const bodyParser = require('body-parser');
var cors = require('cors')
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderDetails = require('./models/order-details');

const app = express();
app.use(cors())
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//app.use(bodyParser.urlencoded({ extended: true })); //while adding products
app.use(bodyParser.json()); // while getting inputs json via url
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


app.use((req, res) => {
  res.sendFile(path.join(__dirname,`public/${req.url}`))
});


Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
//constraint can be removed.
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through:CartItem})
Product.belongsToMany(Cart, { through:CartItem})


User.hasMany(Order)

Order.belongsToMany(Product, { through:OrderDetails})
Product.belongsToMany(Order, { through:OrderDetails})

sequelize
  .sync() //{force: true}
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'srm', email: '123@gmail.com' });
    }
    return user;
  })
  .then(user => {
    return user.createCart(); 
  })
  .then(cart => {app.listen(3000)})
  .catch(err => {
    console.log(err);
  })
