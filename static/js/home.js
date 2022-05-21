/*****************
Code For Load More 
*****************/

const loadButton = document.getElementById("load");
const productNodeToAppend = document.getElementById("products");
let addToCartButtons = document.querySelectorAll(".cartButton");
const messageNode = document.getElementById("message");
const myCardDiv = document.getElementById("mycartdiv");
const myCardBtn = document.getElementById("mycartbtn");


let loadCount = 3;

loadButton.onclick = loadProduct


function onLoad() {
    showOrHideLoadMoreButton();
    loadProduct();
    addToCartButtons = document.querySelectorAll(".cartButton");
    addListenerToCartButtonAfterLoadingProduct();
}


onLoad()


function showOrHideLoadMoreButton() {
    let request = new XMLHttpRequest();
    request.open("get", `/countproduct`);
    request.send();
    request.addEventListener("load", () => {
        let count = JSON.parse(request.responseText)
        if (count.count <= loadCount) {
            loadButton.style.display = "none";
        }
    })
}



function loadProduct() {

    let itemLoaded = loadCount;

    let request = new XMLHttpRequest();
    request.open("get", `/loadmore/${itemLoaded}`);
    request.send();
    request.addEventListener("load", () => {

        if (request.status === 200) {
            let productsInJson = JSON.parse(request.responseText)
            let html = "";
            let products = productsInJson.product
            loadCount = itemLoaded + 3;
            if (products.length) {
                products.forEach(product => {
                    html += addProductToHome(product);
                });
                productNodeToAppend.innerHTML = html;
                addToCartButtons = document.querySelectorAll(".cartButton");
                addListenerToCartButtonAfterLoadingProduct();
                console.log("render product")
            }
            else {
                html = "No Product To Show"
            }
        }
    })

}


function addProductToHome(product) {
    let singleHtml = `
    <div class="col-md-4 mb-4">
                <div class="card" style="width: 18rem;">
                    <img class="card-img-top" src="${product.image}" alt="Card image cap">
                    <div class="card-body">
                        <h5  style="text-align:center"class="card-title">
                            ${product.name}
                        </h5>
                        <p>Price : ₹${product.price}</p>
                        <button class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#m${product._id}">View Details</button>
                        <button  class="btn btn-success cartButton" id="${product._id}">🛒Add To Cart</button>
                    </div>
                </div>

                <div class="modal fade" id="m${product._id}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">${product.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                              <p> <span class="fw-bold">Price - ₹</span> 
                                 ${product.price} 
                              </p>
                            <p> <span class="fw-bold">Description - </span> ${product.description}</p>
                            <p> <span class="fw-bold">Stock - </span> ${product.stock}pice Reamaining</p>
                          </div>
                        </div>
                      </div>
                </div>
            </div>
    `
    return singleHtml;
}


/*
Code For Load More End
*/


/********************
Code For Add To Cart
********************/



addListenerToCartButtonAfterLoadingProduct();

function addListenerToCartButtonAfterLoadingProduct() {
    return addToCartButtons.forEach(btn => {
        btn.addEventListener("click", (event) => {
            let idOfProductToBeAddedInCart = event.target.id;

            let request = new XMLHttpRequest();
            request.open("get", `/addtocart/${idOfProductToBeAddedInCart}`)
            request.send()
            request.addEventListener("load", () => {
                let status = request.status
                if (status === 200) {
                    swal(
                        {
                            text: "Product Added To Cart Successfully",
                            icon: "success"
                        }
                    )
                }
                else if (status === 409) {
                    swal(
                        {
                            text: "Product Already Added To Cart",
                            icon: "warning"
                        }
                    )
                }
                else {
                    swal(
                        {
                            text: "Please Login To Add Product In Your Cart !",
                            icon: "warning"
                        }
                    )
                }


            })


        })
    })

}

/*
Code For Add To Cart
*/



/***************
Code For My Cart Page Forwarding
****************/

myCardBtn.addEventListener("click", () => {
    let request = new XMLHttpRequest();
    request.open("get", "/checklogin")
    request.send();
    request.addEventListener("load", () => {
        let status = request.status
        console.log(status)
        if (status === 200) {
            location.href = "/mycart"
        }
        else {
            swal(
                {
                    text: "Please Login To View Your Cart !",
                    icon: "warning"
                }
            )
        }

    })
})

/*
Code For My Cart Page Forwarding End
*/