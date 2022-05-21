const express = require("express")
const router = express.Router();
const userModel = require("../database/models/user.js");
const sendMail = require("../utilis/sendMail");
const encryption = require("../utilis/encrypt")
const encrypt = encryption.encrypt;
const decrypt = encryption.decrypt;
const sha256 = encryption.sha256;



router.get('/login', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect("/");
    }
    else {
        res.render("./autho/login.ejs", { message: "" })
    }
})


router.post("/login", (req, res) => {
    readUserDB(req.body.username, req.body.password, (user) => {
        if (user === null) {
            res.render("./autho/login.ejs", { message: "Username/Password is not correct😜" })
        }
        else if (!user.isVerified) {
            res.render("./autho/login.ejs", { message: "Email Not verified😒😢" })
        }
        else {
            req.session.isLoggedIn = true;
            req.session.username = req.body.username;
            req.session.isVerified = true
            req.session.userType = user.userType
            res.redirect("/")
        }
    })
})


router.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/")
})

router.get("/signup", (req, res) => {

    if (req.session.isLoggedIn) {
        res.redirect("/");
    }
    else {
        res.render("./autho/signup.ejs", { message: "" });
    }
})

router.post("/signup", (req, res) => {
    let user = req.body;
    readuserfromDataBase(user.username, (users) => {
        let flag = false;
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === user.username) {
                console.log(i, " ")
                flag = true;
                break;
            }
        }
        if (flag) {
            res.render("./autho/signup.ejs", { message: "Username already exists🙂" })
        }
        else {
            writeUserDB(user, res);
        }
    })
})


function readuserfromDataBase(username, call) {

    userModel.find({ username: username }).then(function (users) {
        call(users)
    })
}

function readUserDB(username, password, call) {
    userModel.findOne({ username: username, password: sha256(password) })
        .then(function (users) {
            call(users)
        })
}

function writeUserDB(user, res) {
    userModel.create({
        username: user.username,
        password: sha256(user.password),
        name: user.name,
        isVerified: false,
    }, () => {
        let encryptedObj = encrypt(user.username)
        let f = encryptedObj.iv;
        let s = encryptedObj.encryptedData;
        let str = f + "_" + s;
        let html = `<h1 style="text-align:center;">Welcome ${user.name}
        <pre>
        <p>Welcome in AajShopping, Please verify the mail for further process</p>` +
            '<a href="http://localhost:5000/verifyUser/' + str + '"><button style="cursor:pointer;background-color:green;width:200px;padding:1%">Click to verify</button></a>'

        sendMail(
            user.username,
            "Welcome in Aajshopping",
            "Please click here to verify",
            html,
            function (err) {
                if (err) {
                    res.render("./autho/signup.ejs", { message: "enable to send email🤔" });
                }
                else {
                    res.render("./autho/signup.ejs", { message: "Please Verify The Email For Login😎😎" })
                }
            }
        )
    })

}


router.get("/verifyUser/:user", function (req, res) {

    let str = req.params.user;

    let arr = str.split("_");

    let obj = { iv: arr[0], encryptedData: arr[1] }
    let decryptedEmail = decrypt(obj)

    userModel.updateOne({ username: decryptedEmail }, { isVerified: true }, (err) => {
        if (err) {
            res.end("User not Verify😣");
        }
        else {
            res.render("./autho/verify.ejs", { message: "Your Verification Complete Click On Login Button😉😉" })
        }
    })
})

router.get("/changePassword", (req, res) => {
    if (req.session.isVerified) {
        res.render("./autho/changePassword.ejs", { message: "" })
    }
    else {
        res.redirect("/")
    }
})

router.post("/changePassword", (req, res) => {
    newPassword = req.body.oldPassword
    coniformNewPassword = req.body.newPassword
    if (newPassword === coniformNewPassword) {
        userModel.updateOne({ username: req.session.username }, { password: sha256(coniformNewPassword) }, (err) => {
            if (err) {
                res.end("User not Verify😣");
            }
            else {
                res.redirect("/logout")
            }
        })
    }
    else {
        res.render("./autho/changePassword.ejs", { message: "Both password doesn't match😐" })
    }

})


router.get("/forgetPassword", (req, res) => {
    res.render("./autho/forgetPassword.ejs", { message: "" })
})

router.post("/forgetPassword", (req, res) => {
    let username = req.body.username
    readuserfromDataBase(req.body.username, (users) => {
        let flag = true;
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === req.body.username) {
                console.log(i, " ")
                flag = false;
                break;
            }
        }
        if (flag) {
            res.render("./autho/forgetPassword.ejs", { message: "Please create Account first🙂🙂" })
        }
        if (!flag) {
            let encryptedObj = encrypt(req.body.username)
            let f = encryptedObj.iv;
            let s = encryptedObj.encryptedData;
            let str = f + "_" + s;
            let html = `<h1>Click Here to forget </h1>` +
                '<a href="http://localhost:5000/forgetPassword/' + str + '">click Please</a>'
            sendMail(
                username,
                "Welcome in Aajshopping",
                "Please click here to verify",
                html,
                function (err) {
                    if (err) {
                        res.render("./autho/signup.ejs", { message: "enable to send email🙄" });
                    }
                    else {
                        res.render("./autho/forgetPassword.ejs", { message: "Please Check The Email For Change the Password🙂🙂" })
                    }
                }
            )
        }
    })
})



router.get("/forgetPassword/:username", (req, res) => {

    let str = req.params.username;
    console.log(str)
    let arr = str.split("_");
    let obj = { iv: arr[0], encryptedData: arr[1] }
    let decryptedEmail = decrypt(obj)
    console.log(decryptedEmail)

    res.render("./autho/setPassword.ejs", { username: decryptedEmail })
})


router.post("/setPassword", (req, res) => {
    userNewPassword = req.body.userNewPassword;
    userConiformNewPassword = req.body.userConiformNewPassword;

    if (userNewPassword === userConiformNewPassword) {

        userModel.updateOne({ username: req.body.username }, { password: sha256(userConiformNewPassword) }, (err) => {
            if (err) {
                res.end("User not Verify");
            }
            else {
                res.render("./autho/verify.ejs", { message: "Your Password is Reset😎😎" })
            }
        })
    }
    else {
        res.render("./autho/setPassword.ejs", { message: "please enter correct password😑😑" })
    }
})
module.exports = router