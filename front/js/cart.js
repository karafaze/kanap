'use strict';
// function for existing product index. 

const apiUrl = new URL('http://localhost:3000/api/products');
const apiPostUrl = new URL('http://localhost:3000/api/products/order');
const currentUrl = new URL(document.location);
const productList = document.querySelector('#cart__items');

// console.log(`${window.location.origin}/front/html/confirmation`)
const key = 'basket';

// retrieve list of product object from localStorage
let productsArray = JSON.parse(localStorage.getItem(key));

// first set the total amounts
if (productsArray != null && productsArray.length > 0){
    updateTotal(productsArray, totalPrice, totalQuantity)
}



// writting the HTML
productsArray.forEach( function(product) {
    // for each of the products, we add a new article with corresponding values
    productList.innerHTML += `
    <article class="cart__item" data-id="${product['id']}" data-color="${product['colors']}">
        <div class="cart__item__img">
            <img src="${product['imgUrl']}" alt="${product['imgAlt']}">
        </div>
        <div class="cart__item__content">
            <div class="cart__item__content__description">
                <h2>${product['title']}</h2>
                <p>${product['colors']}</p>
                <p>${product['price']} €</p>
            </div>
            <div class="cart__item__content__settings">
                <div class="cart__item__content__settings__quantity">
                    <p>Qté : </p>
                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value=${product['quantity']}>
                </div>
                <div class="cart__item__content__settings__delete">
                    <p class="deleteItem">Supprimer</p>
                </div>
            </div>
        </div>
    </article>
    `;
})

// handling changes in user orders

// Updating quantity
// retrieves collection off all input quantity
let inputValue = document.querySelectorAll('input.itemQuantity');
// for each of these inputs, add an eventlistener for any change
inputValue.forEach(function(elem){
    elem.addEventListener('change', function(event){
        event.preventDefault();
        
        let existingProductIndex = getProductIdentifier(elem)

        // we then replace the product by an updated one
        productsArray.splice(
            existingProductIndex, 1, updateQuantity(productsArray[existingProductIndex], +this.value)
            )
        
        // send back the updated basket FUNCTION
        localStorage.setItem(key, JSON.stringify(productsArray))
        // updates quantity and sum when changes occurs
        updateTotal(productsArray, totalPrice, totalQuantity)
    });

})

// Deleting items
// retrieves collection of all delete buttons
let deleteButton = document.querySelectorAll('.deleteItem')
// for each of these buttons, add an eventlistener for click
deleteButton.forEach(function(elem){
    elem.addEventListener('click', function(event){
        event.preventDefault();

        // make sure the user clicked on delete button on purpose
        let confirmDeletion = confirm('You are about to delete this product. Are you sure ?');
        if (confirmDeletion){
            let existingProductIndex = getProductIdentifier(elem)

            // array.splice takes out the product 
            // we update the basket and remove the node from the page
            productsArray.splice(existingProductIndex, 1)
            localStorage.setItem(key, JSON.stringify(productsArray))
            elem.closest('article.cart__item').remove()

            // updates quantity and sum when changes occurs
            updateTotal(productsArray, totalPrice, totalQuantity)
        } 
    })
})

function getProductIdentifier(htmlElem){
    // we retrieve the ID and color of the product modified
    let productContainer = htmlElem.closest('article.cart__item');
    let productId = productContainer.dataset.id;
    let productColor = productContainer.dataset.color;
    
    // from that, we retrieve the index it holds inside the array
    let existingProductIndex = productsArray.findIndex((product) =>
    product.id == productId && 
    product.colors == productColor
    )
    
    return existingProductIndex;
}

function updateQuantity(productObj, quantity){
    // add controls over value of quantity
    if (quantity > 100){
        alert('You have reached the limit.')
    } else if (quantity <= 0){
        alert('Please enter a correct value (1-100) for quantity.\n Delete the item if you don\'t want it anymore')
    } else {
        productObj['quantity'] = quantity;
    }
    return productObj;
}

function updateTotal(productArray, priceHtmlElem, quantityHtmlElem){
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


// handling user form
let userData = {}
let userForm = document.querySelector('form');

userForm.addEventListener('change', function(event){
    switch(event.target){
        case firstName:
            checkFirstName(firstName.value.trim().toLowerCase(), event.target);
            break;
        case lastName:
            checkLastName(lastName.value.trim().toLowerCase(), event.target);
            break;
        case address:
            checkAddress(address.value.trim().toLowerCase(), event.target);
            break;
        case city:
            checkCity(city.value.trim().toLowerCase(), event.target)
            break;
        case email:
            checkEmail(email.value.trim().toLowerCase(), event.target);
            break;
        default:
            console.log('Something else was changed');
            console.log(event.target)
    }
})

function checkFirstName(userInput, eventTarget){
    let regexp = /^([a-z\p{L}]+)([-\s]?[a-z\p{L}]+)?$/gui;
    let userName = userInput.match(regexp);
    if (userName){
        // if inputs checks out, save it to userData object
        userData["firstName"] = userName[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}
function checkLastName(userInput, eventTarget){
    let regexp = /^([a-z\p{L}]+)([-'\s]?[a-z\p{L}]+){0,4}$/gui;
    let userLastName = userInput.match(regexp);
    if (userLastName){
        // if inputs checks out, save it to userData object
        userData["lastName"] = userLastName[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}
function checkAddress(userInput, eventTarget){
    let regexp = /^[\d]{1,3}\s?(bis)?\s(rue|boulevard|bd|avenue|allée|allee)\s([-\w\s\d\p{L}]+)$/gui;
    let userAddress = userInput.match(regexp);
    if (userAddress){
        // if inputs checks out, save it to userData object
        userData["address"] = userAddress[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}
function checkCity(userInput, eventTarget){
    let regexp = /^[a-z\p{L}]+([-a-z\p{L}]+){0,4}$/u;
    let userCity = userInput.match(regexp);
    if (userCity){
        // if inputs checks out, save it to userData object
        userData["city"] = userCity[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}
function checkEmail(userInput, eventTarget){
    let regexp = /^([\w.-_]+)@[a-z]+\.[a-z]+(\.[a-z]+){0,2}$/gi;
    // let regexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let userEmail = userInput.match(regexp);
    if (userEmail){
        // if inputs checks out, save it to userData object
        userData["email"] = userEmail[0];
        eventTarget.nextElementSibling.textContent = '';
    } else {
        // if error, reset input value and show error message
        eventTarget.nextElementSibling.textContent = 'Something went wrong here. Might check your input again'
    }
}

let productIds = []
order.addEventListener('click', function(event){
    event.preventDefault();
    if (userData.hasOwnProperty('firstName') &&
        userData.hasOwnProperty('lastName') &&
        userData.hasOwnProperty('address') &&
        userData.hasOwnProperty('city') &&
        userData.hasOwnProperty('email')){
            productIds = productsArray.map((product) => product.id);
            if (productIds.length > 0){
                sendData()
            } else {
                alert('You need items in your basket to make a order.')
            }
    } else {
        console.log('You are missing info')
    }
})


async function sendData(){
    let order = {
        contact: userData,
        products: productIds
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
    window.location.href = createRedirectUrl(response.orderId)
    localStorage.clear();
}

function createRedirectUrl(orderId){
    let url = String(document.location);
    url = url.replace(/cart/, 'confirmation')
    let urlRedirect = new URL(url)
    urlRedirect.searchParams.set('orderId', orderId)
    return urlRedirect.href;
}