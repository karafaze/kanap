'use strict';

const apiUrl = new URL('http://localhost:3000/api/products');
const currentUrl = new URL(document.location);
const productId = currentUrl.searchParams.get('id');

getData();


addToCart.addEventListener('click', function(event){
    event.preventDefault();
    const storageKey = 'basket';
    // checking firsts the user inputs
    if (!(quantity.value > 0 && quantity.value <= 100)){
        alert('Please indicate a quantity between 1 and 100.')
    } else if (colors.value == ''){
        alert('Please choose a color for the model')
    } else if (localStorage.length > 0){
        // we only enter here if we already at least 1 product stored

        // retrieve array of products objects from localStorage
        let productsArray = JSON.parse(localStorage.getItem(storageKey));

        // retrive index of product we are updating
        let existingProductIndex = productsArray.findIndex((product) =>
            product.title == title.textContent && 
            product.colors == colors.options[colors.selectedIndex].text
        )
        // if product index is equal or above 0
        if (existingProductIndex >= 0){
            // make sure the user really want to add more of this item
            let confirmDecision = confirm(`You already have this item in your basket?\nDo you wish to modify quantity ?`);
            if (confirmDecision){
                // make a copy of that product object
                let productToUpdate = productsArray[existingProductIndex]
                // replace it from a 'quantity updated' product in the array
                productsArray.splice(existingProductIndex, 1, checkQuantity(productToUpdate))
                localStorage.setItem(storageKey, JSON.stringify(productsArray))
            }
        } else {
            // if product index is -1 it means it is not yet in the basket
            // so we add a new entry in the basket storage
            productsArray.push(newProductEntry());
            localStorage.setItem(storageKey, JSON.stringify(productsArray))
        }
    } else {
        // basket is empty so we create one
        let productsArray = [];
        let newProduct = newProductEntry()
        productsArray.push(newProduct)
        localStorage.setItem(storageKey, JSON.stringify(productsArray))
    }
})

function newProductEntry(){
    // function to create a product object
    // returns a created object
    let product = {}; 
    product['id'] = currentUrl.searchParams.get('id');
    product['quantity'] = +quantity.value;
    product['colors'] = colors.options[colors.selectedIndex].text;
    product['title'] = title.textContent;
    product['imgUrl'] = document.querySelector('.item__img > img').src;
    product['imgAlt'] = document.querySelector('.item__img > img').alt;
    return product;
}

function checkQuantity(product){
    // here we check if the amount desired is between 1 and 100
    if (product.quantity == 100){
        alert('It seems you have reached the maximum (100) available.')
    } else if (+quantity.value == 100){
        alert(`Sorry you cannot order more than 100 item of this model...\nYou are currently ordering ${product.quantity}.\nRest available : ${100 - +product.quantity}`)
    } else if (+product.quantity < 100 && (+quantity.value + +product.quantity) > 100){
        alert(`Sorry, we do not have that much stock. The limit is set to 100.\nYou can only order ${100 - +product.quantity} more`)
    } else {
        product.quantity = +product.quantity + +quantity.value;
    }
    return product;
}

async function getData(){
    // retrieves one array corresponding to unique product id
    const posts = await fetch(`${apiUrl}/${productId}`);
    const productDetail = await posts.json();

    // from productDetail array, insert corresponding element 
    // to generate product details with specific function below
    insertProductName(productDetail.name);
    insertProductImage(productDetail.imageUrl, productDetail.altTxt);
    insertPrice(productDetail.price);
    insertProductDescription(productDetail.description)
    insertProductColors(productDetail.colors)
}

function insertProductName(name){
    // inserts product name in page title and product title
    let pageTitle = document.querySelector('title');
    let productTitle = document.querySelector('#title');
    pageTitle.textContent = name;
    productTitle.textContent = name;
}

function insertProductImage(src, alt){
    // create a new image matching the product
    let imgWrapper = document.querySelector('.item__img')
    let productImage = document.createElement('img');
    productImage.src = src;
    productImage.alt = alt;
    imgWrapper.append(productImage)
}

function insertPrice(price){
    // add corresponding price 
    let productPrice = document.querySelector('#price');
    productPrice.textContent = price;
}

function insertProductDescription(description){
    // add lorem description to product
    let productDescription = document.querySelector('#description')
    productDescription.textContent = description;
}

function insertProductColors(colorArray){
    // select the select tag 
    let optionSelector = document.querySelector('#colors');
    // iterate over array of colors 
    // and create a new option to be added to select tag
    for (let i=0; i < colorArray.length; i++){
        let newColorOption = document.createElement('option')
        newColorOption.value = colorArray[i].toLowerCase();
        newColorOption.text = colorArray[i]
        optionSelector.add(newColorOption)
    }
}
