export {
  fetchAPI,
  getRadioValue,
  igualMaiorUm,
  shuffle,
  getRandomId,
  validadeNumberInputs,
  showInvalidInputMessage,
}

/**
 * Fetch the given API endpoint and return the response
 * 
 * @param {string} URL - URL path for API 
 * @param {string} ENDPOINT - API endpoint to call
 * @param {string} METHOD - API endpoint method request
 * @param {string} HEADERS - API endpoint method request
 * @param {string} BODY - URL path to the article
 * @returns {null} Returns the response from API endpoint
 */
async function fetchAPI({URL, ENDPOINT ="", METHOD, HEADERS, BODY = {}} = {}) {
  
  var request = {
    method: METHOD,
    headers: HEADERS,
    body: JSON.stringify(
      BODY
    ),
  }

  if (METHOD.toUpperCase() == 'GET'){
    // GET method can not have body
    delete request.body;
  }

  if (HEADERS == undefined) {
    delete request.headers;
  }

  let response = await fetch(
    URL + ENDPOINT, 
    request,
  )
  
  console.log(request);
  console.log(response);

  if (response) {

      return response.json()
  }
  return null
}

// Retorna o valor selecionado para campos de entrada de tipo Radio
function getRadioValue(ElementName) {
  for (let i = 0; i < ElementName.length; i++) {
      if (ElementName[i].checked)
          return ElementName[i].value;
  }
}

// Retorna o próprio parâmetro caso seu valor seja maior que 1. Se não, retorna 1
function igualMaiorUm(valor) {
  if (valor < 1) {
      return 1
  }
  return valor
}

// Ordena aleatoriamente o parâmetro
const shuffle = (array) => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
};

// Retorna um número aleátorio entre o parâmetros informados
function getRandomId(min = 100, max = 999) {
  return Math.floor(Math.random() * max) + min;
}

// Valida se o argumento é numérico
function validadeNumberInputs(inputs){
  for (let index = 0; index < inputs.length; index++) {
    let input = inputs[index]
    if(typeof(input) == "string" || input == undefined || isNaN(input)){
      return false
    }
  }
  return true
}

// Mostra a notificação de dados inseridos inválidos
function showInvalidInputMessage(){
  document.getElementById("resultHeader").innerHTML = 'Informações Inválidas!'
  document.getElementById("resultHeader").style.color = 'orange'
  document.getElementById("resultText").innerHTML = "Revise os valores informados anteriormente."
}
