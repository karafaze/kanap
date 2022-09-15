'use strict';

const apiUrl = new URL('http://localhost:3000/api/products');

// set up base url const for products
const indexUrl = new URL(document.location)
const productURL = indexUrl.toString().replace('index', 'product')

// contains the items wrapper
const itemsWrapper = document.querySelector('#items');

getData()

async function getData(){
    // send request to api, receive and returns them as JSON object
    const posts = await fetch(apiUrl);
    const postsArray = await posts.json();

    // iterate over data object and create a post for each element
    postsArray.forEach(post => {
        // retrieve post structure from function
        const {
            link: linkItem, 
            article: articleWrapper, 
            img: postImage, 
            title: postTitle, 
            body: postBody} = getPostStructure();
            
        // create unique URL for each product and its id
        const itemUrl = new URL(productURL);
        itemUrl.searchParams.set('id', `${post._id}`);
        linkItem.href = itemUrl;
        // set image attributes
        postImage.src = post.imageUrl;
        postImage.alt = post.altTxt;

        // set title and body description
        postTitle.textContent = post.name;
        postBody.textContent = post.description;

        // add corresponding classes
        postTitle.classList.add('productName')
        postBody.classList.add('productDescription')

        // create final post and append it to item container
        itemsWrapper.append(createPost(
            linkItem, articleWrapper, postImage, postTitle, postBody
            ))
        }
    )
}

function getPostStructure(){
    // will create a basic post structure and return object with HTML element
    const linkItem = document.createElement('a');
    const articleWrapper = document.createElement('article');
    const postImage = document.createElement('img');
    const postTitle = document.createElement('h4');
    const postBody = document.createElement('p');
    return {
        link: linkItem,
        article: articleWrapper,
        img: postImage,
        title: postTitle,
        body: postBody,
    }
}

function createPost(wrapper, article, img, title, body){
    // receives HTML objects and returns a post ready to be displayed
    article.append(img);
    article.append(title);
    article.append(body);
    wrapper.append(article)
    return wrapper;
}