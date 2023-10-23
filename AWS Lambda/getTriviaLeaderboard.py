import json
import boto3

dynamodb_client = boto3.client('dynamodb',  region_name='sa-east-1')

_TABLE_NAME = "Trivia_Leaderboard"
_INDEX_NAME = 'difficult-points-index'

_HashKey = 'difficult'

def lambda_handler(event, context):
    
    body = json.loads( event.get("body", "").replace("'",'"')) 
    
    difficult = str(body.get("difficult"))
    limit     = int(body.get("limit", 5))
    
    response = dynamodb_client.query(
        ExpressionAttributeValues={
            ':v1': {
                'S': difficult,
            },
        },
        KeyConditionExpression=f'{_HashKey} = :v1',
        TableName=_TABLE_NAME,
        IndexName=_INDEX_NAME,
        ScanIndexForward = False, 
        Limit = limit
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['Items'])
    }