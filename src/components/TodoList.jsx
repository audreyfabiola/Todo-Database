import React from 'react';
import { TodoItem } from "./TodoItem";

export function TodoList({ todos, toggleTodo, deleteTodo, editTodo }) {
  return (
    <div className="bg-white p-10 mt-5 rounded-lg shadow-xl">
      <h1 className="header">Todo List</h1>
      <ul className="list">
        {todos.length === 0 && <li>No todos</li>}
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            completed={todo.data.completed}
            title={todo.data.title}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
          />
        ))}
      </ul>
    </div>
  );
}
