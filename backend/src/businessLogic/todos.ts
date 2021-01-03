import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const todosAccess = new TodosAccess()

export async function getUserTodoItems(userId: string): Promise<TodoItem[]> {
    return todosAccess.getUserTodoItems(userId)
}

export async function createTodoItem(
    request: CreateTodoRequest,
    userId: string
  ): Promise<TodoItem> {
  
    const itemId = uuid.v4()
  
    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: request.name,
        dueDate: request.dueDate,
        done: false,
    })
}

export async function deleteTodoItem(itemId: string, userId: string){
    return todosAccess.deleteTodoItem(itemId, userId)
}

export async function updateTodoItem(itemId: string, userId: string, data: UpdateTodoRequest){
    return todosAccess.updateTodoItem(itemId, userId, data)
}

export async function setAttachmentUrl(itemId: string, userId: string, attachmentUrl: string): Promise<void> {
    return todosAccess.setAttachmentUrl(itemId, userId, attachmentUrl)
}