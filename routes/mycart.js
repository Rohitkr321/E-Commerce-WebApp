const express = require("express")
const router = express.Router();
const { request } = require("http");
const userModel = require("../database/models/user.js");
const cartModel = require("../database/models/cart.js");
const productModel = require("../database/models/productModel")

//Check If User is login
router.get("/checklogin", (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendStatus(200);
    }
    else {
        res.sendStatus(403);
    }
})



router.get("/addtocart/:id", (req, res) => {

    if (req.session.isLoggedIn) {
        let productId = req.params.id
        cartModel.findOne({ username: req.session.username, id: productId }).then(data => {
            if (data) {
                res.sendStatus(409);
            }
            else {
                productModel.findOne({_id : productId}).then(data => {
                    cartModel.create(
                        {
                            username: req.session.username,
                            id: productId,
                            productName: data.name,
                            image: data.image,
                            description: data.description,
                            price: data.price,
                            quantity: 1
                        },
                        (err) => {
                            if (err) {
                                console.log(err);
                            }
                        }
                    )

                })

                res.sendStatus(200);
            }
        })

    }
    else {
        res.sendStatus(403)
    }
})

router.get("/mycart", (req, res) => {
    if (req.session.isLoggedIn) {
        userModel.findOne({ username: req.session.username }).then(function (users) {
            res.render("cart.ejs", { name: users.name });
        })
    }
    else {
        res.redirect("/")
    }

})

router.get("/productinmycart", (req, res) => {
    if (req.session.isLoggedIn) {
        cartModel.find({ username: req.session.username }).then(data => {
            res.json({ product: data })
        })
    }
    else {
        res.json({ product: [] })
    }
})

router.get("/increasequantity/:id", (req, res) => {
    if (req.session.isLoggedIn) {
             console.log("hello")
            let productAlreadyInCart =1;
            productModel.findOne({_id : req.params.id}).then(product=>{
                let ourProduct
                if(product){
                    ourProduct = product
                }
                else{
                    ourProduct = {stock:0}
                }
                cartModel.find({ id: req.params.id }).then(data => {
                    for (let i = 0; i < data.length; i++) {
                        productAlreadyInCart += data[i].quantity
                    }
                    if (ourProduct.stock < productAlreadyInCart) {
                        res.sendStatus(409);
                    }
                    else {
                        cartModel.updateOne({ id: req.params.id, username: req.session.username }, { $inc: { 'quantity': 1 } }, (err) => {
                            console.log(req.session.username)
                            if (err) {
                                console.log(err);
                                res.sendStatus(400);
                            }
                            else {
                                res.sendStatus(200);
                            }
                        })
                    }
                })
            })

    }
    else {
        res.sendStatus(400);
    }
})


router.get("/decreasequantity/:id", (req, res) => {
    if (req.session.isLoggedIn) {
        cartModel.findOne({ id: req.params.id, username: req.session.username }).then(data => {
            if (data.quantity < 2) {
                res.sendStatus(409);
            }
            else {
                cartModel.updateOne({ id: req.params.id, username: req.session.username }, { $inc: { 'quantity': -1 } }, (err) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    }
                    else {
                        res.sendStatus(200);
                    }
                })
            }
        })
    }
})


router.get("/deletefromcart/:id", (req, res) => {
    if (req.session.isLoggedIn) {
        cartModel.deleteOne({ id: req.params.id ,username:req.session.username}, (err) => {
            if (err) {
                console.log(err);
            }
            else {
                res.sendStatus(200);
            }
        })
    }
    else {
        res.sendStatus(403);
    }
})

module.exports = router