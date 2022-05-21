const myCardDiv = document.getElementById("mycartdiv");
const myCardBtn = document.getElementById("mycartbtn");
const cardProductsDiv = document.getElementById("cartProducts");

let deleteButtons;
let allPlusButtons;
let allMinusButtons;
let html = "";


function onLoad() {
    myCardDiv.removeChild(myCardBtn);
    deleteButtons = document.querySelectorAll(".deleteButton")
    loadProduct();
}
onLoad();

function loadProduct() {


    let request = new XMLHttpRequest();
    request.open("get", `/productinmycart`);
    request.send();
    request.addEventListener("load", () => {
        let productsInJson = JSON.parse(request.responseText)
        let products = productsInJson.product
        if (products.length) {
            products.forEach(product => {
                html += addProductToHome(product);
            });
            cardProductsDiv.innerHTML = html;
            deleteButtons = document.querySelectorAll(".deleteButton");
            allPlusButtons = document.querySelectorAll(".plusbtn");
            allMinusButtons = document.querySelectorAll(".minusbtn");

            allListenerToPlusButton();
            allListenerToMinusButton();
            addListenerToDeleteButtonAfterLoadingProduct();
            console.log("render product")
        }
        else {
            cardProductsDiv.innerHTML = `<h1 style="color:red;text-align:center">Nothing in cart🙄</h1>`;
        }

    })

}



function addProductToHome(product) {
    let singleHtml = `
    <div class="col-md-4 mb-4" id="del${product.id}">
                <div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="${product.image}" alt="Card image cap">
                    <div class="card-body">
                        <h5 style="text-align:center"class="card-title">
                            ${product.productName}
                        </h5>
                        <p>Price : ${product.price}</p>
                        <p>Quantity : <span id="q${product.id}"> ${product.quantity} </span><button class="plusbtn" id="plus${product.id}">+</button> <button class="minusbtn" id="minus${product.id}">-</button></p>
                        <button class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#m${product.id}">View Details</button>
                        <button style="margin-left:40px"class="btn btn-danger deleteButton" id="${product.id}">🗑Delete</button>
                    </div>
                </div>

                <div class="modal fade" id="m${product.id}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title"> ${product.productName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                              <p> <span class="fw-bold">Price - </span> 
                                  ${product.price} 
                              </p>
                            <p> <span class="fw-bold">Description - </span> ${product.description}</p>
                          </div>
                        </div>
                      </div>
                </div>
            </div>
    `
    return singleHtml;
}

//Code For Updating Quantity in Cart 

function allListenerToPlusButton() {
    return allPlusButtons.forEach(pbtn => {
        pbtn.addEventListener("click", (event) => {
            let manipulatedId = event.target.id
            let productIdClicked = manipulatedId.slice(4)
            let currentQuantity = document.getElementById(`q${productIdClicked}`)
            let newQuantity = Number(currentQuantity.innerText);
            newQuantity++;
            console.log(newQuantity);
            // Update In DB
            let request = new XMLHttpRequest();
            request.open("get", `/increasequantity/${productIdClicked}`)
            request.send();
            request.addEventListener("load", () => {
                let status = request.status;
                console.log(status);
                if (status === 200) {
                    // console.log(newQuantity, "from 200")
                    
                }
                else if (status === 409) {
                    swal(
                        {
                            text: "This Product is no more Available In Stock",
                            icon: "warning"
                        }
                    )
                    newQuantity--;
                }
                else {
                    swal({
                        text: "Something Isn't Right Try Again",
                        icon: "error"
                    })
                    newQuantity--;
                }
                currentQuantity.innerText = newQuantity;
            })
            console.log(currentQuantity);
        })
    })

}

function allListenerToMinusButton() {
    return allMinusButtons.forEach(mbtn => {
        mbtn.addEventListener("click", (event) => {
            let manipulatedId = event.target.id
            let productIdClicked = manipulatedId.slice(5)
            let currentQuantity = document.getElementById(`q${productIdClicked}`)
            let newQuantity = Number(currentQuantity.innerText);
            newQuantity--;

            //Update In DB
            let request = new XMLHttpRequest();
            request.open("get", `/decreasequantity/${productIdClicked}`)
            request.send();
            request.addEventListener("load", () => {
                let status = request.status;
                if (status === 200) {
                   console.log("--")
                }
                else if (status === 409) {
                    swal(
                        {
                        text: "Minimum Quantity Should be 1",
                        icon: "error"
                        }
                    )
                    newQuantity++;
                }
                else {
                    swal({
                        text: "Something Isn't Right Try Again",
                        icon: "error"
                    })
                    newQuantity++;
                }
                currentQuantity.innerText = newQuantity;
            })
            console.log(productIdClicked);
        })
    })

}





// addListenerToDeleteButtonAfterLoadingProduct();

function addListenerToDeleteButtonAfterLoadingProduct() {
    return deleteButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
            let idOfProductToBeDeletedFromCart = event.target.id;
            console.log(idOfProductToBeDeletedFromCart)
            let request = new XMLHttpRequest();
            request.open("get", `/deletefromcart/${idOfProductToBeDeletedFromCart}`)
            request.send()
            request.addEventListener("load", () => {
                let status = request.status
                if (status === 200) {
                    swal(
                        {
                            text: "Product Removed From Cart Successfully",
                            icon: "success"
                        }
                    )
                    let productToBeDeleted = document.getElementById(`del${idOfProductToBeDeletedFromCart}`);
                    cardProductsDiv.removeChild(productToBeDeleted);
                }
                else {
                    swal(
                        {
                            text: "oops Something Not Right.. Try Again",
                            icon: "warning"
                        }
                    )
                }
            })
        })
    })

}
