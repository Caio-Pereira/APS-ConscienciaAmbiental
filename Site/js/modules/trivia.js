import { 
    fetchAPI,
    shuffle,
    getRadioValue,
    getRandomId,
} from './library.js'

import { 
    _APIGatewayURL,
    _TriviaAlternativesQuantity
} from './variables.js'

export {
    startTrivia,
    getQuestion,
    validateAnswer,
    saveTriviaResult,
}


// GLOBAL VARIABLES
var sessao = undefined
var triviaResposta = ""
var questao = ""

var TimerCountdown;
var RemainingTime;
var Timer;

var isValidatingAnswerRunning = false;


const TriviaDetails = {
    "HARD": {
        multiplicatorPoints: 5,
        quantityAlternatives: 5,
        timer: 10,
    },
    "MEDIUM": {
        multiplicatorPoints: 3,
        quantityAlternatives: 4,
        timer: 20,
    },
    "EASY": {
        multiplicatorPoints: 1,
        quantityAlternatives: 3,
        timer: 30,
    }
}


class TriviaSession {
    constructor(nickname, difficult) {
      this.nickname         = nickname;
      this.difficult        = difficult; 
      this.questions        = [];
      this.answers          = 0;
      this.points           = 0;
      this.leaderboardLimit = 5;
    }

    // Methods
    async getTriviaQuestion() {
        // Busca uma nova pergunta no servidor
        const response = await fetchAPI({
            URL: _APIGatewayURL,
            ENDPOINT: "Trivia",
            METHOD: "POST",
            BODY: {
                difficult: this.difficult,
                questoesAntigas: this.questions
            }
        })

        // Edição do estilo da barra de progresso
        document.getElementById('TriviaTimerDiv').style.display = 'block'
        document.getElementById('TriviaTimerContainer').style.display = 'flex'

        document.getElementById('TriviaProgressbarContainer').style.display = 'flex'
        document.getElementById('TriviaProgressbarDiv').style.display = 'block'
        document.getElementById('TriviaProgressbar').style.width = `${Math.ceil(response.progress)}%`;

        // Verifica se o retorno do servidor é de conclusão do jogo
        if (response.winner){
            this.formatLeaderboard("Parabéns", "green")
            clearInterval(TimerCountdown);

        }else{
            // Adiciona a questão atual na listagem de questões apresentadas
            if (!this.questions.includes(response.id.N)) {
                this.questions.push(response.id.N)
            }

            // Apresenta o texto da questão
            document.getElementById("TriviaQuestaoTitulo").innerHTML = "Questão " + this.questions.length;

            questao = response.pergunta.S
            document.getElementById("TriviaQuestaoTexto").innerHTML = questao;

            // Define a alternativa correta
            var alternativas = response.alternativas.S.split(';')
            triviaResposta   = alternativas[0] // Resposta correta sempre será a primeira na listagem (regra de "negócio")

            // Embaralha as alternativas e atualiza o texto nos botões do jogo
            alternativas = shuffle(alternativas)

            alternativas.forEach(function(el, index){
                document.getElementById(`btnTriviaAlternativa${index}Texto`).innerHTML = el;
                document.getElementById(`btnTriviaAlternativa${index}`).value = el;
                document.getElementById(`btnTriviaAlternativa${index}`).checked = false
            })

            RemainingTime = TriviaDetails[sessao.difficult]['timer']
            Timer = TriviaDetails[sessao.difficult]['timer']

            document.getElementById("AnswerModal").innerHTML = triviaResposta;

        }
    }

    async formatLeaderboard(TITLE, COLOR){
        // Busca o Top X jogadores para conforme os parâmetros informados
        const response = await fetchAPI({
            URL: _APIGatewayURL,
            ENDPOINT: "Trivia/Leaderboard/Receive",
            METHOD: "POST",
            BODY: {
                difficult: this.difficult,
                limit: this.leaderboardLimit,
            }
        })

        // Caso o retorno tenha menos registros que o limite pré estabelecido para o placar de líderes,
        // o limite será atualizado conforme a quantidade de items retornados
        var index = response.length;
        this.leaderboardLimit = index

        // Para cada item no retorno, é criado um novo registro no placar de líderes
        response.reverse().forEach(element => {
            createLeaderboardRow({
                position:  index,
                difficult: element.difficult.S,
                nickname:  element.nickname.S,
                points:    element.points.N,
            })

            index -= 1;
        });

        // Esconde a interface do trivia
        document.getElementById("TriviaContainer").style.display = 'none';
        document.getElementById('TriviaProgressbarContainer').style.display = 'none'
        document.getElementById('TriviaProgressbarDiv').style.display = 'none'
        document.getElementById('TriviaTimerDiv').style.display = 'none'
        document.getElementById('TriviaTimerContainer').style.display = 'none'


        // Mostra a interface do placa de líderes
        document.getElementById("btnStartTrivia").style.visibility = 'visible';
        $('#TriviaLeaderboard').modal('show');

        // Formata o placar de líderes
        document.getElementById("TriviaLeaderboardModal").innerHTML = TITLE;
        document.getElementById("TriviaLeaderboardModal").style.color = COLOR;
        document.getElementById("TriviaLeaderboardRowSessionDifficult").innerHTML = this.difficult;
        document.getElementById("TriviaLeaderboardRowSessionNickname").innerHTML = this.nickname;
        document.getElementById("TriviaLeaderboardRowSessionPoints").innerHTML = this.points;

    }

    async saveTriviaResult() {
        // Solicita a gravação da pontuação atual para o servidor
        const response = await fetchAPI({
            URL: _APIGatewayURL,
            ENDPOINT: "/Trivia/Leaderboard/Insert",
            METHOD: "POST",
            BODY: {
                nickname: this.nickname,
                difficult: this.difficult,
                answers: this.answers,
                points: this.points,
            }
        })

        // De acordo com o retorno, formata a notificação
        if (response){
            document.getElementById("liveToastTitle").innerHTML = "Sucesso!";
            document.getElementById("liveToastTitle").style.color = "green";
            document.getElementById("liveToastText").innerHTML = "Pontuação armazenada no placar de líderes.";
        } else {
            document.getElementById("liveToastTitle").innerHTML = "Falha!";
            document.getElementById("liveToastTitle").style.color = "red";

            document.getElementById("liveToastText").innerHTML = "Pontuação não armazenada no placar de líderes.";
        }

        // Mostra a notificação
        const toastLiveExample = document.getElementById('liveToast')
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastBootstrap.show()
    }
}


function startTrivia(nickname, difficult) {
    // Verifica se há uma sessão de jogo ativa. Se sim, limpa o placar de lideres
    if (typeof sessao != "undefined") {

        for (let index = 0; index < sessao.leaderboardLimit+1; index++) {
            if(index != 0){
                try {
                    const element = document.getElementById("TriviaLeaderboardRowTemplate");
                    element.remove();  
                } catch (error) {
                    
                }
            }
        }
    }
    
    // Instância uma sessão de jogo
    sessao = new TriviaSession(nickname, difficult);
    console.log(sessao);

    RemainingTime = TriviaDetails[sessao.difficult]['timer']
    Timer = TriviaDetails[sessao.difficult]['timer']


    // Solicita uma pergunta inicial
    sessao.getTriviaQuestion();

    // Mostra as alternativas
    showAlternatives();


    TimerCountdown = setInterval(updateTimer, 1000);
}


function saveTriviaResult() {
    // Caso exista uma sessão de jogo ativa, solicita a gravação da pontuação atual
    if (typeof sessao == "undefined") {
        console.log("Não há uma sessão de jogo em execução");
    } else {
        console.log("Finalizando sessão do trivia");
        sessao.saveTriviaResult()
    }
}


function getQuestion() {
    // Solicita uma nova pergunta
    sessao.getTriviaQuestion()
}


function createLeaderboardRow({position="", difficult="", nickname="", points=""} = {}) {
    // Baseado nos parâmetros, cria um novo registro no placa de líderes
    let TriviaLeaderboardRowTemplate = document.getElementById("TriviaLeaderboardRowTemplate");
    let newRow                       = TriviaLeaderboardRowTemplate.cloneNode(true);

    newRow.querySelector("#TriviaLeaderboardRowTemplatePosition").innerHTML  = position;
    newRow.querySelector("#TriviaLeaderboardRowTemplateDifficult").innerHTML = difficult; 
    newRow.querySelector("#TriviaLeaderboardRowTemplateNickname").innerHTML  = nickname;
    newRow.querySelector("#TriviaLeaderboardRowTemplatePoints").innerHTML    = points;

    TriviaLeaderboardRowTemplate.before(newRow);
}


function checkAnswer() {
    // Considera a alternativa escolhida pelo jogador
    const triviaAnswer = getRadioValue(document.getElementsByName("inputTriviaAlternativa"))
    
    if (triviaAnswer === triviaResposta) {
        // Caso a alternativa esteja correta, incrementa a pontuação e solicita uma nova pergunta
        sessao.answers += 1
        sessao.points  += TriviaDetails[sessao.difficult]['multiplicatorPoints']

        getQuestion()

    }else{
        // Caso a alternativa esteja errada, encerra-se a partida
        document.getElementById('TriviaTimerDiv').style.display = 'none'


        clearInterval(TimerCountdown);

        sessao.formatLeaderboard("Que pena...", "red")

    }
}

// Válida se há uma validação de alternativa em execução
function validateAnswer() {
  if (isValidatingAnswerRunning) {
    // Caso exista uma validação em execução, retorna uma Promise
    return new Promise(resolve => {
      // Quando a validação prévia finalizar a execução, realiza o Resolver
      const checkCompletion = () => {
        if (!isValidatingAnswerRunning) {
          resolve();
        } else {
          setTimeout(checkCompletion, 10);
        }
      };
      checkCompletion();
    });
  }

  // Modifica o status de execução para true
  isValidatingAnswerRunning = true;

  return new Promise(resolve => {
    setTimeout(() => {
      checkAnswer()
      isValidatingAnswerRunning = false;
      resolve();
    }, 1000);
  });
}


function showAlternatives() {
    // Define a quantidade de alternativas a serem apresentadas baseada na dificuldade escolhida e as configurações do jogo
    let alternatives = TriviaDetails[sessao.difficult].quantityAlternatives

    // Valida quais alternativas serão apresentadas baseada na difiuldade da sessão
    for (let index = 0; index < _TriviaAlternativesQuantity; index++) {
        if (index < alternatives) {
            document.getElementById(`btnTriviaAlternativa${index}Container`).style.display = 'block';
        }else{
            document.getElementById(`btnTriviaAlternativa${index}Container`).style.display = 'none';
        }
    }
}




// TIMER
function updateTimer() {
    let percentage = (RemainingTime / Timer) * 100
    
    document.getElementById('TriviaTimer').style.width = `${percentage}%`;

    if (percentage > 50 && percentage <= 100){
        document.getElementById('TriviaTimer').style.backgroundColor = "green";
    }

    if (percentage > 20 && percentage <= 50){
        document.getElementById('TriviaTimer').style.backgroundColor = "orange";
    }

    if (percentage <= 20){
        document.getElementById('TriviaTimer').style.backgroundColor = "red";
    }


    if (RemainingTime <= 0) {
        clearInterval(TimerCountdown);
        sessao.formatLeaderboard("Tempo encerrado..", "red")
    }
    RemainingTime--;
}