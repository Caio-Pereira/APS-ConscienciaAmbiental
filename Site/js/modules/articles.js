import { 
  fetchAPI 
} from './library.js'

import { 
  _APIGatewayURL 
} from './variables.js'

export {
  getArticles
}

/**
 * Call APIGatewayInterface function to get all articles information and, for each one on the response, call createArticleCard function
 * 
 */
async function getArticles() {
  let articles = await fetchAPI({
    URL: _APIGatewayURL,
    ENDPOINT: "Articles",
    METHOD: "GET",
  })
  
  articles.items.forEach(element => {
    createArticleCard({
      image:          element.image.S,
      title:          element.title.S,
      description:    element.description.S,
      url:            element.url.S,
      author:         element.author.S,
      minutesReading: element.minutesReading.N,
    })
  });
}


/**
 * Create a new card on index.html containing information about the article
 * 
 * @param {string} imgPath - URL path for retrieving an image from an Amazon S3 bucket
 * @param {string} title - Article title
 * @param {string} description - Article description
 * @param {string} url - URL path to the article
 * @returns {null} This is the result
 */
function createArticleCard({image="", title="", description="", url="",  author="", minutesReading=""} = {}) {
  let articleCardTemplate = document.getElementById("articleCardTemplate");
  let newArticleCard      = articleCardTemplate.cloneNode(true);

  newArticleCard.querySelector("#articleImage").style.backgroundImage = `url(${image})`;
  newArticleCard.querySelector("#articleTitle").innerHTML             = title; 
  newArticleCard.querySelector("#articleDescription").innerHTML       = description;
  newArticleCard.querySelector("#articleURL").href                    = url;
  newArticleCard.querySelector("#articleAuthor").innerHTML            = "Por: " + author;
  newArticleCard.querySelector("#articleMinutesReading").innerHTML    = minutesReading + " min. de leítura";

  articleCardTemplate.after(newArticleCard);
}