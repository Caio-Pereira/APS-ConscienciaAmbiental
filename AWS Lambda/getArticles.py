import boto3

dynamodb = boto3.client('dynamodb', region_name='sa-east-1')

# dados da tabela
table_name    = 'Articles'

def lambda_handler(event, context):
    # Use o método scan para buscar todos os itens
    response = dynamodb.scan(TableName=table_name)
    
    # A resposta contém os itens na chave 'Items'
    items = response['Items']
    
    # Se a resposta não contiver todos os itens de uma vez (caso haja paginação), você pode usar o 'LastEvaluatedKey'
    # para iterar pelas páginas seguintes até que todos os itens sejam recuperados.
    while 'LastEvaluatedKey' in response:
        last_key = response['LastEvaluatedKey']
        response = dynamodb.scan(TableName=table_name, ExclusiveStartKey=last_key)
        items.extend(response['Items'])
    
    return {
        'items': items,
        'count': len(items)
    }