import json
import boto3
import random

dynamodb_client = boto3.client('dynamodb')

_TABLE_NAME = "Trivia"
_HashKey = "difficult"
_SortKey = "id"

def lambda_handler(event, context):
    body = json.loads( event.get("body", "").replace("'",'"')) 
  
    difficult = body.get("difficult")
    toExclude = body.get("questoesAntigas")
    
    # Consulta a quantidade de itens na tabela
    params = {
        'TableName': _TABLE_NAME,
        'KeyConditionExpression': f'{_HashKey} = :pkValue',
        'ExpressionAttributeValues': {
            ':pkValue': {'S': difficult}
        },
        'Select': 'COUNT'
    }
    response = dynamodb_client.query(**params)

    qntdItems = response.get("Count")
    
    allQuestions = set([str(x) for x in range(0,qntdItems)])
    questions = list(allQuestions - set(toExclude))
    
    progress = ((len(toExclude)/qntdItems) * 100)
    
    if not questions:
        return {
            'statusCode': 200,
            'body': json.dumps({
                'winner': True,
                'progress': progress,
            })
        }
    
    idEscolhido = random.choice(questions)
    
    # Consulta o item sorteado na tabela
    response = dynamodb_client.get_item(
        Key={
            _HashKey: {
                'S': str(difficult),
            },
            _SortKey: {
                'N': idEscolhido,
            },
        },
        TableName=_TABLE_NAME,
    )
    
    conteudo = response.get('Item')
    conteudo['progress'] = progress
    
    return {
        'statusCode': 200,
        'body': json.dumps(conteudo)
    }
        