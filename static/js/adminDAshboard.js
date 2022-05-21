// Will Implement Load more Button If needed


/******
Code To Delete Product From Admin Page 
******/

let productDivParent = document.getElementById("products")
const allDeleteButtons = document.querySelectorAll(".productdelete")


allDeleteButtons.forEach((delbtn) => {
    delbtn.addEventListener("click", (event) => {
        console.log(event.target.id)

        let request = new XMLHttpRequest()
        request.open("get",`/admin/delete/${event.target.id}`);
        request.send();
        request.addEventListener("load",()=>{
            if(request.status===200){
                let nodeToRemove = document.getElementById(`del${event.target.id}`)
                productDivParent.removeChild(nodeToRemove);
                swal(
                    {
                        text: "Product Deleted Successfully",
                        icon: "success"
                    }
                )
            }
            else{
                swal(
                    {
                        text: "Something isn't Right Try Again ",
                        icon: "error"
                    }
                )
            }
            loadCount();
        })

    })
})

/******
Code For Loading Count In Admin Dashboard
******/
let countNode = document.getElementById("count")

function loadCount(){
    let request = new XMLHttpRequest()
    request.open("get","/countproduct")
    request.send()
    request.addEventListener("load",()=>{
        let count = JSON.parse(request.responseText)
        countNode.innerHTML=count.count
    })
}

loadCount()