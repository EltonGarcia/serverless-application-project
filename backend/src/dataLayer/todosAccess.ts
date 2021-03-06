import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.TODOS_INDEX) {
    }

    async getUserTodoItems(userId: string): Promise<TodoItem[]> {
        console.log('Getting all todo items')
    
        const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.indexName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
              ':userId': userId
          }
        }).promise()
    
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
          TableName: this.todosTable,
          Item: item
        }).promise()
    
        return item
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId,
            }
        }).promise()
    }

    async updateTodoItem(todoId: string, userId: string, item: UpdateTodoRequest): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name = :name, done = :done, dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':name': item.name,
                ':done': item.done,
                ':dueDate': item.dueDate
            },
            ExpressionAttributeNames: {
                '#name': 'name', // 'name' conflicts with reserved words: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
            }
        }).promise()
    }

    public async setAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId,
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl,
            }
        })
        .promise();
    }
}

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
}
