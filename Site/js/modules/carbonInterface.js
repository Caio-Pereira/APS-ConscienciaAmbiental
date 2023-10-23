import { 
    fetchAPI,
    igualMaiorUm,
    validadeNumberInputs,
    showInvalidInputMessage
} from './library.js'

import { 
    _CarbonInterfaceURL,
    _CarbonInterfaceBearer,
    _APIGatewayURL
} from './variables.js'

export {
    fetchCarbonInterfaceShipping,
    fetchCarbonInterfaceFlight,
    fetchCarbonInterfaceFuelCombustion,
    fetchCarbonInterfaceVehicle,
}

// Solicita ao servidor as informações sobre os veículos disponíveis para o formulário
const _CarbonInterfaceVehicles = await fetchAPI({
    URL: _APIGatewayURL,
    ENDPOINT: "CarbonInterface/Vehicles",
    METHOD: "GET",
})


async function fetchCarbonInterface(_BODY, _DIVISOR = 1) {

    const retorno = await fetchAPI({
        URL: _CarbonInterfaceURL,
        METHOD: "POST",
        HEADERS: {
            'Authorization': _CarbonInterfaceBearer,
            'Content-Type': 'application/json'
        },
        BODY: _BODY
    })

    if (retorno.data) {
        var formatacao = formateRetorno(retorno.data.attributes, _DIVISOR)
        var co2Emitido = formatacao.co2Emitido
        var gramasCO2 = formatacao.gramasCO2

        if (gramasCO2 <= 0){
            var texto = `Estimativa de emissão de <i><strong>menos de 1 grama</strong></i> de carbono!`
        }else{
            var texto = `Estimativa de emissão de <i><strong>${co2Emitido}</strong></i> de carbono!`
        }

        document.getElementById("resultHeader").innerHTML = texto;
        document.getElementById("resultHeader").style.color = 'green'

    
        relacaoCarbonoArvore(gramasCO2)
    } else {
        document.getElementById("resultHeader").innerHTML = 'Erro na requisição!'
        document.getElementById("resultHeader").style.color = 'red'

        document.getElementById("resultText").innerHTML = retorno.message
    }
}

function fetchCarbonInterfaceShipping() {
    const inputUnidadePeso         = document.getElementById("inputUnidadePeso").value;
    var   inputQuantidadePeso      = Number(document.getElementById("inputQuantidadePeso").value.replace(",","."));
    const inputUnidadeDistancia    = document.getElementById("inputUnidadeDistancia").value;
    var   inputQuantidadeDistancia = Number(document.getElementById("inputQuantidadeDistancia").value.replace(",","."));
    const inputMeioTransporte      = document.getElementById("inputMeioTransporte").value;

    // Validação inputs
    if (validadeNumberInputs([inputQuantidadePeso, inputQuantidadeDistancia])){
        inputQuantidadePeso      = igualMaiorUm(inputQuantidadePeso)
        inputQuantidadeDistancia = igualMaiorUm(inputQuantidadeDistancia)

        fetchCarbonInterface(
            {
                'type': "shipping",
                "weight_unit": inputUnidadePeso,
                "weight_value": Number(inputQuantidadePeso),
                "distance_unit": inputUnidadeDistancia,
                "distance_value": Number(inputQuantidadeDistancia),
                "transport_method": inputMeioTransporte,
            }
        )
    } else {
        showInvalidInputMessage()
    }
}

function fetchCarbonInterfaceFlight() {
    const inputAeroportoOrigem       = document.getElementById("inputAeroportoOrigem").value;
    const inputAeroportoDestino      = document.getElementById("inputAeroportoDestino").value;
    var   inputQuantidadePassageiros = Number(document.getElementById("inputQuantidadePassageiros").value);
    var   inputTipoViagem            = Number(document.getElementById("inputTipoViagem").value);

    if (inputTipoViagem == 1) {
        var divisor = 2
    } else {
        var divisor = 1
    }

    // Validação inputs
    if (validadeNumberInputs([inputQuantidadePassageiros])){
        inputQuantidadePassageiros = igualMaiorUm(inputQuantidadePassageiros)

        fetchCarbonInterface(
            {
                'type': 'flight',
                "passengers": Number(inputQuantidadePassageiros),
                "legs": [
                    {"departure_airport": inputAeroportoOrigem, "destination_airport": inputAeroportoDestino},
                    {"departure_airport": inputAeroportoDestino, "destination_airport": inputAeroportoOrigem}
                ]
            },
            divisor
        )
    } else {
        showInvalidInputMessage()
    }
}

function fetchCarbonInterfaceVehicle() {
    const inputVehicleMaker             = document.getElementById("inputVehicleMaker").value;
    const inputVehicle                  = document.getElementById("inputVehicle").value;
    const inputVehiclesDistanceUnit     = document.getElementById("inputVehiclesDistanceUnit").value;
    var   inputVehiclesDistanceQuantity = Number(document.getElementById("inputVehiclesDistanceQuantity").value);

    // Validação inputs
    if (validadeNumberInputs([inputVehiclesDistanceQuantity])){
        inputVehiclesDistanceQuantity = igualMaiorUm(inputVehiclesDistanceQuantity)

        fetchCarbonInterface(
            {
                'type': 'vehicle',
                "distance_unit": inputVehiclesDistanceUnit,
                "distance_value": inputVehiclesDistanceQuantity,
                "vehicle_model_id": _CarbonInterfaceVehicles.items[inputVehicleMaker][inputVehicle],
            },
        )
    } else {
        showInvalidInputMessage()
    }
}

function fetchCarbonInterfaceFuelCombustion() {
    const inputTipoCombustivel       = document.getElementById("inputTipoCombustivel").value;
    var   inputQuantidadeCombustivel = Number(document.getElementById("inputQuantidadeCombustivel").value.replace(",","."));

    // Validação inputs
    if (validadeNumberInputs([inputQuantidadeCombustivel])){
        inputQuantidadeCombustivel = igualMaiorUm(inputQuantidadeCombustivel)

        fetchCarbonInterface(
            {
                'type': 'fuel_combustion',
                "fuel_source_type": inputTipoCombustivel,
                "fuel_source_unit": "btu",
                "fuel_source_value": inputQuantidadeCombustivel,
            }
        )
    } else {
        showInvalidInputMessage()
    }
}

function formateRetorno(attributes, divisor = 1) {
    var quantidade, unidade = undefined

    switch (true) {
        case (attributes.carbon_mt >= 1):
            quantidade = attributes.carbon_mt;
            unidade    = "tonelada(s)";
            break;

        case (attributes.carbon_kg >= 1):
            quantidade = attributes.carbon_kg;
            unidade    = "quilograma(s)";
            break;

        case (attributes.carbon_g >= 0):
            quantidade = attributes.carbon_g;
            unidade    = "grama(s)";
            break;

        default:
            return "menos de 1 grama"
    }

    
    quantidade = quantidade / divisor
    

    // Primeiro retorna os dados que serão apresentados ao usuário, seguido da informação de gramas de carbono emitido para futuras validações
    return {
        "co2Emitido": `${quantidade} ${unidade}`,
        "gramasCO2": attributes.carbon_g / divisor
    }
}

function relacaoCarbonoArvore(gramasCO2 = 0) {
    // De acordo com o site https://www.ibflorestas.org.br/conteudo/compensacao-de-co2, A cada 7 árvores, é possível sequestrar 1 tonelada de carbono nos seus primeiros 20 anos de idade
    // Com isso, a cada 20 anos 1 arvore sequestra 142.857,14 GRAMAS de carbono
    // Com isso, a cada 1 ano 1 arvore sequestra 7.142,85 GRAMAS de carbono
    // Com isso, a cada 1 dia 1 arvore sequestra 19,56 GRAMAS de carbono

    const arvore1DiaConsumo = 20 // Arredondado

    const quantidadeArvores = (Math.floor(gramasCO2 / arvore1DiaConsumo));

    const periodoTempo = "1 dia(s)"

    switch (true) {
        case (quantidadeArvores <= 0) : 
            var texto = `Uma árvore compensa esta quantidade de carbono emitida em menos de um dia!`
            break;

        case (quantidadeArvores < 3500):
            var texto = `Para compensar esta emissão de carbono são necessária(s) aproximadamente ${quantidadeArvores} árvores ao longo de ${periodoTempo}!`
            break;
        
        case (quantidadeArvores < 10000):
            var quociente = Math.floor(quantidadeArvores / 30)
            var resto     = quantidadeArvores % 30
            var texto = `Para compensar esta emissão de carbono são necessária(s) aproximadamente ${quociente + resto} árvores ao longo de ${quociente} meses!`
            break;

        default:
            var quociente = Math.floor(quantidadeArvores / 365)
            var resto     = quantidadeArvores % 365
            var texto = `Para compensar esta emissão de carbono são necessária(s) aproximadamente ${quociente + resto} árvores ao longo de ${quociente} anos!`
            break;
    }

    document.getElementById("resultText").innerHTML = texto
}

async function createVehiclesMakersSelect() {
    
  
    for (const [maker, vehicles] of Object.entries(_CarbonInterfaceVehicles.items)) {
        let makerVehicles = []
        for (const [car, id] of Object.entries(vehicles)) {
            let inputVehicleTemplate = document.getElementById("inputVehicleTemplate");
            let newVehicle      = inputVehicleTemplate.cloneNode(true);
    
            newVehicle.innerHTML = car; 
            newVehicle.value     = car;
    
            inputVehicleTemplate.before(newVehicle);

            makerVehicles.push(car)
        }

        let VehicleMakerTemplate = document.getElementById("inputVehicleMakerTemplate");
        let newVehicleMaker      = VehicleMakerTemplate.cloneNode(true);

        newVehicleMaker.innerHTML   = maker; 
        newVehicleMaker.value       = maker;
        newVehicleMaker.dataset.vehicles = makerVehicles.toString();

        VehicleMakerTemplate.before(newVehicleMaker);
    }
}

createVehiclesMakersSelect()