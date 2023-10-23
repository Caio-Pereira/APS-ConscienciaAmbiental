import { 
    fetchAPI 
} from './library.js'

import { 
    _APIGatewayURL 
} from './variables.js'

export {
    getCuriosity
}

var _CountCuriosidades = 1

var _Curiosidades = []
var endCuriosity = false

/**
 * Get a random curiosity by fetching AWS API Gateway and showing the response
 * 
 */
async function getCuriosity() {
    if(!endCuriosity){
        // Solicita uma curiosidade ao servidor
        var curiosities = await fetchAPI({
            URL: _APIGatewayURL,
            ENDPOINT: "Curiosidades",
            METHOD: "POST",
            BODY: {
                curiosidadesAntigas: _Curiosidades
            }
        })

        if (curiosities.end){
            endCuriosity = true
        }else{
    
            _Curiosidades.push( curiosities.id.N )
    
            // Formata a interface e mostra a curiosidade retornada
            let curiosityTemplate = document.getElementById("curiosityTemplate");
            let newCuriosity      = curiosityTemplate.cloneNode(true);

            newCuriosity.querySelector("#curiosityTemplateButtonText").innerHTML = "Curiosidade " + _CountCuriosidades;

            newCuriosity.querySelector("#curiosityTemplateButtonText").setAttribute("data-bs-target", '#curiosity'+_CountCuriosidades);
            newCuriosity.querySelector("#curiosityTemplateButtonText").setAttribute("aria-controls", 'curiosity'+_CountCuriosidades);

            newCuriosity.querySelector("#templateCollapse").setAttribute('id','curiosity'+_CountCuriosidades);

            newCuriosity.querySelector("#curiosityTemplateText").innerHTML = curiosities.conteudo.S;

            curiosityTemplate.after(newCuriosity);

            _CountCuriosidades += 1
        }
    
    }else{
        document.getElementById("liveToastTitle").innerHTML = "Atenção!";
        document.getElementById("liveToastTitle").style.color = "Orange";

        document.getElementById("liveToastText").innerHTML = "Você já buscou por todas as nossas curiosidades.";

        // Mostra a notificação
        const toastLiveExample = document.getElementById('liveToast')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
    }
 
    

}
