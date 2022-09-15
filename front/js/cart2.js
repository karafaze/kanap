'use strict';

const apiUrl = new URL('http://localhost:3000/api/products');
const currentUrl = new URL(document.location);
const productList = document.querySelector('#cart__items');

// console.log(localStorage)

let productIdArray = [];
// retrives all object containing product data
for (let key of Object.keys(localStorage)){
    productIdArray.push(JSON.parse(localStorage.getItem(key)))
}
console.log(productIdArray)

let productsArray = []
// convertings objects to array
for (let i = 0; i < productIdArray.length; i++){
    productsArray.push(Object.values(productIdArray[i]))
}
console.log(productsArray)
// fetch requests for all products within baskets
let requests = productsArray.map((arr) => fetch(`${apiUrl}/${arr[0]}`))


Promise.all(requests)
    .then(
        responses => Promise.all(responses.map(response => response.json()))
    )
    .then(
        productData => productData.forEach(product => {
            productList.innerHTML += `
            <article class="cart__item" data-id="{product-ID}" data-color="{product-color}">
                <div class="cart__item__img">
                    <img src="${product.imageUrl}" alt=${product.altTxt}>
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${product.name}</h2>
                        <p>Couleur</p>
                        <p>${product.price} €</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : </p>
                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="0">
                        </div>
                        <div class="cart__item__content__settings__delete">
                            <p class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>
            `
        })
    )

// function createProductStructure(){
//     let article = document.createElement('article');
//     let divImgWrapper = document.createElement('div');
//     let productImage = document.createElement('img');
//     let divContentWrapper = document.createElement('div');
//     let divContentWrapperDetail = document.createElement('div');
//     let productName = document.createElement('h2');
//     let productColor = document.createElement('p');
//     let productPrice = document.createElement('p');

// }
