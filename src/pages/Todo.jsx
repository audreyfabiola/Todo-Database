import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { db, auth } from "../firebase"; 
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("All");
  const [username, setUsername] = useState("");
  const [profilePictureURL, setProfilePictureURL] = useState('');

  useEffect(() => {
    const user = auth.currentUser; 
    if (!user) return; 

    // Fetch the user's display name and profile picture from Firestore
    const fetchUserData = async () => {
      try {
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUsername(doc.data().username);
          setProfilePictureURL(doc.data().profilePicture || '');
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, data: doc.data() });
      });
      setTodos(tasksData);
    });

    return () => unsubscribe();
  }, []);

  function addTodo(title) {
    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), title, completed: false },
    ]);
  }

  function toggleTodo(id, completed) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed } : todo
      )
    );
  }

  function deleteTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id)
    );
  }

  function editTodo(id, newTitle) {
    const editedTodo = todos.map((todo) =>
      id === todo.id ? { ...todo, title: newTitle } : todo
    );
    setTodos(editedTodo);
  }

  function filterTodo() {
    switch (filter) {
      case "Active":
        return todos.filter((todo) => !todo.data.completed);
      case "Completed":
        return todos.filter((todo) => todo.data.completed);
      default:
        return todos;
    }
  }

  return (
    <>
    <div className="absolute top-0 left-0 mt-4 ml-4 flex items-center">
      <Link to="/homepage">
        <button className="w-8 h-8 flex items-center justify-center bg-pink-500 hover:bg-pink-700 text-white font-bold rounded-full">
          <svg className="w-4 h-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
          </svg>
        </button>
      </Link>
    </div>
    <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center">
    <h2 className="text-2xl font-semibold text-pink-300 mr-2">{username || "User"}</h2>
        {profilePictureURL ? (
            <img
                src={profilePictureURL}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
            />
        ) : (
            <svg className="w-10 h-10 text-gray-400 bg-gray-200 rounded-full" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
        )}
    </div>
      <TodoForm addTodo={addTodo} filterTodo={filterTodo} setFilter={setFilter} />
      <TodoList
        todos={filterTodo()}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        editTodo={editTodo}
      />
    </>
  );
}

export default Todo;
