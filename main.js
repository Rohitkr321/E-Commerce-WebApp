const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const fs = require("fs")
const session = require("express-session")
const multer = require("multer")
const db = require("./database");
const { json } = require("express/lib/response");
const userModel = require("./database/models/user.js");
const { Module } = require("module");
const { isBuffer } = require("util");
db.start();
app.set("view engine", "ejs")
/*************************************************
                MiddileWare
 *************************************************/
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(__dirname + "/uploads"))
app.use("/static", express.static(__dirname + '/static'))
app.use("/static", express.static(__dirname + '/utilis'))


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg");
    }
})

var upload = multer({ storage: storage })
app.use(session({
    secret: 'Rohit',
    resave: false,
    saveUninitialized: true,
}))
/***************************************************
        server run on 5000 port
 ***************************************************/
let port = 5000;
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})

/******************************************************
        Authorization and Authentication
 ******************************************************/
const auth = require('./routes/auth')
app.use(auth)

/******************************************************
                MyCart MiddleWare
 ******************************************************/
const cart = require('./routes/mycart')
app.use(cart)

/******************************************************
                    Admin panel
 *******************************************************/
const admin = require("./routes/admin");
const productModel = require("./database/models/productModel");
app.use("/admin", admin);




/*************************   Start Point   ************************************* */

app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        userModel.findOne({ username: req.session.username }).then(function (users) {
            console.log(users)
            productModel.find({}).then(data => {
                res.render("dashboard.ejs", { username: users.name })
            })
        })
    }
    else {
        productModel.find({}).then(data  => {
            res.render("dashboard.ejs", { username: "" })
        })
    }
})


/**************    Endpoint to handle Load More Button   **************************/

app.get("/loadmore/:item", (req, res) => {
    let item = Number(req.params.item);
    console.log(item)
    productModel.find({}).limit(item).then(products=>{
            res.status(200).json({ product: products })
    });
})


app.get("/countproduct",(req,res)=>{
    
    productModel.count({},(err,count)=>{
        res.json({count:count});
    })
})



