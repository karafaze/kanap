"use strict";

// initialize urls for product and order api
const apiUrl = new URL("http://localhost:3000/api/products");
const apiPostUrl = new URL("http://localhost:3000/api/products/order");
// select product section 
const productSection = document.querySelector("#cart__items");
// create basket key for localeStorage
const key = "basket";
// initialize empty userData
let userData = {};

// start with retrieving localeStorage
let basketArray = JSON.parse(localStorage.getItem(key));

// handling basket items and infos display
// first control if basket is filled
if (basketArray != null && basketArray.length > 0) {
    // start by making a copy of localeStorage basket
    let localBasketArray = [...basketArray];
    // request the API for product that match id in local basket
    let requests = localBasketArray.map((product) =>
        fetch(`${apiUrl}/${product["id"]}`)
    );
    // use promise.all to handle multiple requests
    Promise.all(requests)
        .then((responses) =>
            Promise.all(responses.map((product) => product.json()))
        )
        .then(function (products) {
            // for each product in local basket, add prices
            products.forEach((product) => {
                localBasketArray.find((localProduct) => {
                    if (localProduct["id"] == product["_id"]) {
                        localProduct["price"] = product["price"];
                    }
                });
            });
            // returning local basket
            return localBasketArray;
        })
        .then(function (products) {
            // with basket fully filled : 
            // add the html to create product list
            addProductHtml(products);
            // initialize total quantity and total sum 
            updateTotal(products, totalPrice, totalQuantity)
            // add event listeners to input/delete/order button
            addInputModifier(products);
            addDeleteModifier(products);
            addOrderConfirmation(products);
            return products;
        });
} else {
    // if basket empty, still add event listener and validation to form
    // in case it's filled with no products
    addOrderConfirmation([]);
}

function addProductHtml(productArray) {
    productArray.forEach(function (product) {
        productSection.innerHTML += `
                <article class="cart__item" data-id="${product["id"]}" data-color="${product["colors"]}">
                    <div class="cart__item__img">
                        <img src="${product["imgUrl"]}" alt="${product["imgAlt"]}">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${product["title"]}</h2>
                            <p>${product["colors"]}</p>
                            <p>${product["price"]} €</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté : </p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value=${product["quantity"]}>
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>
                `;
    });
}

function addInputModifier(productArray) {
    // select all input elements in dom
    let inputValue = document.querySelectorAll("input.itemQuantity");
    inputValue.forEach(function (elem) {
        // add event for each input element
        elem.addEventListener("change", function (event) {
            event.preventDefault();
            // retrieve product index in array
            let existingProductIndex = getProductIdentifier(elem, productArray);
            // modifiy the product in place with updated quantity
            productArray.splice(
                existingProductIndex,
                1,
                updateQuantity(productArray[existingProductIndex], +this.value)
            );
            // create a copy of basket without price to update localeStorage
            let onlineBasketArray = copyLocalBasket(productArray);
            localStorage.setItem(key, JSON.stringify(onlineBasketArray));
            // update total quantity and sum
            updateTotal(productArray, totalPrice, totalQuantity)
        });
    });
}

function addDeleteModifier(productArray) {
    // select all delete elements in dom
    let deleteButton = document.querySelectorAll(".deleteItem");
    deleteButton.forEach(function (elem) {
        elem.addEventListener("click", function (event) {
            event.preventDefault();
            // make sure the user clicked on delete button on purpose
            let confirmDeletion = confirm(
                "You are about to delete this product. Are you sure ?"
            );
            if (confirmDeletion) {
                // retrieve product index in array
                let existingProductIndex = getProductIdentifier(elem, productArray);

                // array.splice takes out the product
                productArray.splice(existingProductIndex, 1);

                // create a copy of basket without price to update localeStorage
                let onlineBasketArray = copyLocalBasket(productArray);
                localStorage.setItem(key, JSON.stringify(onlineBasketArray));
                updateTotal(productArray, totalPrice, totalQuantity)
                // remove node from dom
                elem.closest("article.cart__item").remove();
            }
        });
    });
}

function getProductIdentifier(htmlElem, productArray) {
    // we retrieve the ID and color of the product modified
    let productContainer = htmlElem.closest("article.cart__item");
    let productId = productContainer.dataset.id;
    let productColor = productContainer.dataset.color;
    console.log(productArray)
    // from that, we retrieve the index it holds inside the array
    let existingProductIndex = productArray.findIndex(
        (product) => product.id == productId && product.colors == productColor
    );

    return existingProductIndex;
}

function updateQuantity(productObj, quantity) {
    // add controls over value of quantity
    if (quantity > 100) {
        alert("You have reached the limit.");
    } else if (quantity <= 0) {
        alert(
            "Please enter a correct value (1-100) for quantity.\n Delete the item if you don't want it anymore"
        );
    } else {
        productObj["quantity"] = quantity;
    }
    return productObj;
}

function updateTotal(productArray, priceHtmlElem, quantityHtmlElem){
    // calls function to update total sum and total article
    priceHtmlElem.textContent = updateTotalSum(productArray);
    quantityHtmlElem.textContent = updateTotalArticleSum(productArray)
}

function updateTotalSum(productsArray){
    // defines sum to 0 
    let totalSum = 0;
    // for each product add the corresponding sum to total
    productsArray.forEach((product) => {
        totalSum += (product.price * product.quantity)
    })
    return totalSum;
}

function updateTotalArticleSum(productsArray){
    // defines sum to 0
    let articleSum = 0;
    // for each product add the corresponding sum to total
    productsArray.forEach((product) => {
        articleSum += product.quantity
    })
    return articleSum
}

function copyLocalBasket(productArray) {
    // initialize empty array
    let newArray = [];
    for (let product of productArray) {
        // copy the array in place to new array
        newArray.push(JSON.parse(JSON.stringify(product)));
    }
    for (let product of newArray) {
        // for each product, delete prices propriety
        delete product["price"];
    }
    return newArray;
}


// handling user form
function validateUserInformation(){
    let userFormElem = document.querySelector('form');
    // add event listener to listen for any change in the form
    userFormElem.addEventListener('change', function(event){
        // for each form, input are validated by regex and added to userData contact
        switch(event.target){
            case firstName:
                checkFirstName(firstName.value.trim().toLowerCase(), event.target, userData);
                break;
            case lastName:
                checkLastName(lastName.value.trim().toLowerCase(), event.target, userData);
                break;
            case address:
                checkAddress(address.value.trim().toLowerCase(), event.target, userData);
                break;
            case city:
                checkCity(city.value.trim().toLowerCase(), event.target, userData)
                break;
            case email:
                checkEmail(email.value.trim().toLowerCase(), event.target, userData);
                break;
        }
    });
    return userData;
}

function checkFirstName(userInput, eventTarget, userForm){
    let regexp = /^([a-z\p{L}]+)([-\s]?[a-z\p{L}]+)?$/gui;
    let userName = userInput.match(regexp);
    if (userName){
        // if inputs checks out, save it to userData object
        userForm["firstName"] = userName[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

function checkLastName(userInput, eventTarget, userForm){
    let regexp = /^([a-z\p{L}]+)([-'\s]?[a-z\p{L}]+){0,4}$/gui;
    let userLastName = userInput.match(regexp);
    if (userLastName){
        // if inputs checks out, save it to userData object
        userForm["lastName"] = userLastName[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

function checkAddress(userInput, eventTarget, userForm){
    let regexp = /^[\d]{1,3}\s?(bis)?\s(rue|boulevard|bd|avenue|allée|allee)\s([-\w\s\d\p{L}]+)$/gui;
    let userAddress = userInput.match(regexp);
    if (userAddress){
        // if inputs checks out, save it to userData object
        userForm["address"] = userAddress[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

function checkCity(userInput, eventTarget, userForm){
    let regexp = /^[a-z\p{L}]+([-a-z\p{L}]+){0,4}$/u;
    let userCity = userInput.match(regexp);
    if (userCity){
        // if inputs checks out, save it to userData object
        userForm["city"] = userCity[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

function checkEmail(userInput, eventTarget, userForm){
    let regexp = /^([\w.-_]+)@[a-z]+\.[a-z]+(\.[a-z]+){0,2}$/gi;
    // let regexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let userEmail = userInput.match(regexp);
    if (userEmail){
        // if inputs checks out, save it to userData object
        userForm["email"] = userEmail[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

function addOrderConfirmation(productArray){
    let productIds = [];
    validateUserInformation()
    order.addEventListener('click', function(event){
        event.preventDefault();
        if (userData.hasOwnProperty('firstName') &&
            userData.hasOwnProperty('lastName') &&
            userData.hasOwnProperty('address') &&
            userData.hasOwnProperty('city') &&
            userData.hasOwnProperty('email')){
                if(productArray[0] != null){
                    productIds = productArray.map((product) => product.id);
                    sendData(productIds, userData)
                } else {
                    alert('There are no products in your basket.')
                }
        } else {
            alert('We still need some information about you. Please fill in the form.')
        }
    })
}

async function sendData(ids, userData){
    // initialize order object to be sent to API
    let order = {
        contact: userData,
        products: ids
    };
    let request = await fetch(
        apiPostUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(order),
        });
    let response = await request.json();
    // redirect user to confirmation page
    window.location.href = createRedirectUrl(response.orderId);
    // empty local storage
    localStorage.clear();
}

function createRedirectUrl(orderId){
    // retrieve url as a string
    let url = String(document.location);
    // regex used to create new address
    url = url.replace(/cart/, 'confirmation')
    // create url as a URL object
    let urlRedirect = new URL(url)
    // add parameters in url and returns href
    urlRedirect.searchParams.set('orderId', orderId)
    return urlRedirect.href;
}