import json
import boto3
import random

dynamodb_client = boto3.client('dynamodb')

_TABLE_NAME = "Curiosidades"
_HashKey = "id"

def lambda_handler(event, context):
    # Considera os argumentos da requisição
    body = json.loads( event.get("body", "").replace("'",'"')) 
  
    toExclude = body.get("curiosidadesAntigas")
    
    # Consulta os registros da tabela, e considera os items que não foram enviados ao usuário
    response = dynamodb_client.scan(TableName=_TABLE_NAME)
    
    qntdItems = response.get("Count") - 1 # O id começa em zero
    
    allCuriosities = set([str(x) for x in range(0,qntdItems)])
    curiosities = list(allCuriosities - set(toExclude))
    
    if not curiosities:
        return {
            'statusCode': 200,
            'body': json.dumps({
                'end': True
            })
        }
    
    # Sorteia um dos items
    idEscolhido = random.choice(curiosities)

    # Consulta o item sorteado na tabela
    response = dynamodb_client.get_item(
        Key={
            _HashKey: {
                'N': str(idEscolhido),
            },
        },
        TableName=_TABLE_NAME,
    )

    conteudo = response.get('Item')

    return {
        'statusCode': 200,
        'body': json.dumps(conteudo)
    }
        