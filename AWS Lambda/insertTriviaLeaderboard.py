import json
import boto3

dynamodb = boto3.client('dynamodb', region_name='sa-east-1')

# dados da tabela
table_name = 'Trivia_Leaderboard'

def lambda_handler(event, context):
    
    body = json.loads( event.get("body", "").replace("'",'"')) 
    
    nickname  = str(body.get("nickname"))
    difficult = str(body.get("difficult"))
    answers   = str(body.get("answers"))
    points    = str(body.get("points"))
    
    try:
        # Criação do item
        # Item que você deseja inserir
        item = {
            'nickname': {'S': nickname},
            'difficult': {'S': difficult},
            'answers': {'N': answers},
            'points': {'N': points},
        }
    
        # Expressão de condição para inserção (opcional)
        condition_expression = 'attribute_not_exists(nickname) AND attribute_not_exists(difficult)'
    
        # Insira o item na tabela
        response = dynamodb.put_item(
            TableName=table_name,
            Item=item,
            ConditionExpression=condition_expression
        )
    except:
        try:
            # Alteração do Item
            # Chave primária do item que você deseja atualizar
            item_key = {
                'nickname': {'S': nickname},
                'difficult': {'S': difficult}
            }
        
            # Novos valores que você deseja definir
            update_expression = 'SET answers = :answers, points = :points'
            expression_values = {
                ':points': {'N': points},
                ':answers': {'N': answers},
            }
            
            # Expressão de condição para atualização (opcional)
            condition_expression = 'points < :points'
            
            # Atualize o item
            response = dynamodb.update_item(
                TableName=table_name,
                Key=item_key,
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ConditionExpression=condition_expression,
                ReturnValues='UPDATED_NEW'
            )
            
            print("Item atualizado com sucesso:", response)
        except:
            print("Item não alterado")
        
    return {
        'statusCode': 200,
        'body': json.dumps({
            'atualizado': True,
        })
    }