const express = require("express");
const userModel = require("../database/models/user");
const productModel = require("../database/models/productModel");
const fs = require("fs")
const router = express.Router();
const token = require("../utilis/encrypt");
const multer = require("multer");
const sha256 = token.sha256
const encrypt = token.encrypt
const decrypt = token.decrypt
const sendMail = require("../utilis/sendMail")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        let newFileName = file.originalname.split(".")[0] + Date.now() + ext;
        cb(null, newFileName)
    }
})

let upload = multer({ storage: storage })


router.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect("/admin/admindashboard");
    }
    else {
        res.redirect("/admin/login");
    }

})


router.get("/login", (req, res) => {
    if (req.session.isLoggedIn && req.session.userType === 'admin') {
        res.redirect("admin/admindashboard");
    }
    else {
        res.render("./admin/adminLogin.ejs", { message: "" })
    }
})

router.post("/login", (req, res) => {
    let username = req.body.username
    let password = req.body.password
    userModel.findOne({ username: username, password: sha256(password) }).then((user) => {
        if (user === null) {
            res.render("./admin/adminLogin.ejs", { message: "Username/Password is not correct 😶😶" })
        }
        else if (!user.isVerified) {
            res.render("./admin/adminLogin.ejs", { message: "Please Verify Your Email Before Login 🙂🙂" })
        }
        else if (user.userType !== 'admin') {
            res.render("./admin/adminLogin.ejs", { message: "You Are Not Authorized As Admin" });
        }
        else {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.userType = 'admin'
            res.redirect("/admin/admindashboard");
        }
    })
})



//C
router.route("/addproduct")
    .get((req, res) => {
        if (req.session.isLoggedIn) {
            res.render("./admin/addProduct.ejs", { error: "", success: "" })
        }
        else {
            res.redirect("/admin/login");
        }

    })
    .post(upload.single("image"), (req, res) => {
        let fileName = req.file.originalname
        let arr = fileName.split(".")
        let extension = arr[arr.length - 1];
        if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" || req.file.size > 250000) {
            res.render("./admin/addProduct.ejs", { error: "Image file should be in jpg, png or jpeg and size not greater than 250KB", success: "" })
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("File Deleted");
                }
            })

        }
        else {
            productModel.create({ name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock, image: req.file.path }, err => {
                if (err) {
                    console.log(err)
                    res.render("./admin/addProduct.ejs", { error: "Something isn't right Try Again", success: "" })
                }
                else {
                    res.render("./admin/addProduct.ejs", { error: "", success: "Product Added Successfully" })
                }
            })
        }
    })

//R
router.get("/admindashboard", (req, res) => {
    if (req.session.isLoggedIn) {
        if (req.session.userType === 'admin') {
            productModel.find({}).then(data => {
                res.render("./admin/adminDashboard.ejs", { product: data })
            })
        }
        else {
            // res.send("working")
            res.render("./admin/adminLogin.ejs", { message: "You are not authorized as Admin " })
        }
    }
    else {
        res.redirect("/admin/login");
    }

})

//U
router.route("/updateproduct/:id")
    .get((req, res) => {
        // res.send(req.params.id)

        if (req.session.isLoggedIn) {
            productModel.findOne({ _id: req.params.id }).then(product => {
                if (product) {
                    res.render("./admin/updateProduct.ejs", { error: "", success: "", product: product })
                }
                else {
                    res.redirect("/admin/admindashboard")
                }
            })
        }
        else {
            res.redirect("/admin/admindashboard")
        }
    })
    .post((req, res) => {
        productModel.updateOne({ _id: req.params.id }, { name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock }, (err, data) => {
            productModel.findOne({ _id: req.params.id }).then(product => {
                if (err) {
                    console.log(err);
                    res.render("./admin/updateProduct.ejs", { error: "Something isn't right Try Again", success: "", product: product })
                }
                else {
                    res.render("./admin/updateProduct.ejs", { error: "", success: "Product Updated Successfully", product: product })
                }

            })

        })
    })

//D
router.get("/delete/:id", (req, res) => {
    if (req.session.isLoggedIn) {

        productModel.findOne({ _id: req.params.id }).then(product => {
            fs.unlink(product.image, (err) => {
                if (err) { console.log(err) }
                else {
                    console.log("Product Image Deleted")
                }
            })
            productModel.deleteOne({ _id: req.params.id }, err => {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                }
                else {
                    res.sendStatus(200);
                }
            })
        })

    }
    else {
        res.redirect("/admin/admindashboard")
    }

})


router.route("/requestadmin")

    .get((req, res) => {
        console.log(req.session.isLoggedIn)
        if (req.session.isLoggedIn) {
            res.render("./admin/requestAdmin.ejs", { message: "", username: req.session.username })
        }
        else {
            res.redirect("/login")
        }
    })
    .post((req, res) => {
        console.log(req.session)
        if (req.session.isLoggedIn) {
            if (req.session.userType === 'admin') {
                res.render("./admin/requestAdmin.ejs", { message: "You are already an Admin", username: req.session.username })
            }
            else {

                let encryptedObj = encrypt(req.session.username)
        let f = encryptedObj.iv;
        let s = encryptedObj.encryptedData;
        let str = f + "_" + s;
                let html = `<h2>Admin request</h2>` + `<p>Email - ${req.body.username}</p>`
                    + `<a href="http://localhost:5000/admin/makeadmin/${str}">Click Here </a>To Make This User As Admin`
                    + ` =>=> <a href="http://localhost:5000/admin/denyadmin/${str}">Click Here </a>For Deny Request`;

                sendMail("rohitkumar9122565209@gmail.com", "","Request For Admin", html, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.render("./admin/requestAdmin.ejs", { message: "Mail Sent Successfully, wait for resonse from Admin", username: "" })
                    }
                })
            }

        }
        else {
            res.redirect("/login")
        }

    })

router.get("/makeadmin/:id", (req, res) => {

    let str = req.params.id;

    let arr = str.split("_");

    let obj = { iv: arr[0], encryptedData: arr[1] }
    let username = decrypt(obj)
    userModel.updateOne({ username: username }, { userType: "admin" }, (err) => {
        console.log(err);
        let html = `<h3 style="text-align:center;color:green">Congratulations You are Promoted To Admin</h3>` + `<a href="http://localhost:5000/admin/login"><button style="background-color:green">Login Now</button></a> as Admin User`
        sendMail(username, "Update On Admin Request","", html, (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            else {
                res.send("Promoted To Admin And Mail Sent Successfully");
            }
        })
    })
})

router.get("/denyadmin/:id", (req, res) => {

    let str = req.params.id;
    let arr = str.split("_");
    let obj = { iv: arr[0], encryptedData: arr[1] }
    let username = decrypt(obj)
    userModel.updateOne({ username: username }, { userType: "admin" }, (err) => {
        console.log(err);
        let html = `<h4>Sorry, We can Not Make You as an Admin Now</h4>` + `Till Then enjoy Shopping with Us`
        sendMail(username, "Update On Admin Request",'', html, (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            else {
                res.send("Sorry Mail Sent Successfully");
            }
        })
    })

})



module.exports = router