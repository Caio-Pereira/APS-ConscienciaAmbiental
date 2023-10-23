import boto3

dynamodb = boto3.client('dynamodb', region_name='sa-east-1')

# dados da tabela
table_name    = 'CarbonInterface_Vehicles'

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
    
    # Agora, a variável 'items' contém todos os itens da tabela
    dict_return = dict()
    
    for info in items:
        
        # Para cada item no dicionário, caso exista a chave 'manufacturer' esse item será agregado no retorno da função
        if not dict_return.get(info['manufacturer']['S']):
            dict_return[ info['manufacturer']['S'] ] = {}
        
        dict_return[ info['manufacturer']['S'] ].update( {info['model']['S'] : info['model_id']['S']} )

    return {
        'items': dict_return,
        'count': len(items)
    }