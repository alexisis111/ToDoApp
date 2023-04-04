import React, {useState, useEffect, useRef} from 'react';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [timeValue, setTimeValue] = useState('');
    const audioRef = useRef(new Audio('/notify.mp3'));



    useEffect(() => {
        fetch('http://localhost:4000')
            .then(response => response.json())
            .then(data => setTodos(data));
    }, []);

    useEffect(() => {
        fetch( 'http://localhost:4000/todos', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todos)
        });
    }, [todos]);

    useEffect(() => {
        Notification.requestPermission();
        const timerId = setInterval(() => {
            const now = new Date();
            todos.forEach(todo => {
                if (todo.time && !todo.complete) {
                    const [hours, minutes] = todo.time.split(':');
                    const todoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
                    if (now >= todoTime) {
                        toast.success(todo.task, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 5000,
                            hideProgressBar: true,
                            onClose: () => window.focus(),
                            pauseOnHover: true,
                            draggable: true,
                        });
                        audioRef.current.play();
                    }
                }
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [todos]);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const handleTimeChange = (event) => {
        setTimeValue(event.target.value);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if (!inputValue) return;
        const newTodo = {
            task: inputValue,
            complete: false,
            time: timeValue
        };
        fetch('http://localhost:4000/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTodo)
        })
            .then(response => response.json())
            .then(data => {
                setTodos([...todos, data]);
                setInputValue('');
                setTimeValue('');
            });
    };

    const handleToggleComplete = (id) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? {...todo, complete: !todo.complete} : todo
        );
        setTodos(updatedTodos);

        fetch(`http://localhost:4000/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({complete: !todos.find(todo => todo.id === id).complete})
        });
    };

    const handleRemoveTodo = (id) => {
        fetch(`http://localhost:4000/todos/${id}`, {
            method: 'DELETE'
        })
            .then(() => {
                const updatedTodos = todos.filter(todo => todo.id !== id);
                setTodos(updatedTodos);
            });
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <form className="w-full max-w-sm mt-4" onSubmit={handleFormSubmit}>
                <div className="flex items-center border-b border-b-2 border-teal-500 py-2">
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        type="text"
                        placeholder="Add a task..."
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        type="time"
                        value={timeValue}
                        onChange={handleTimeChange}
                    />
                    <button
                        className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                        type="submit"
                    >
                        Add
                    </button>
                </div>
            </form>
            <ToastContainer/>
            <div className="w-full max-w-sm mt-4">
                {todos.map(todo => (
                    <div
                        key={todo.id}
                        className={`flex items-center justify-between py-2 ${todo.complete ? 'line-through text-gray-400' : 'text-gray-700'}`}
                    >
                        <div className="flex items-center">
                            <input
                                className="mr-2
"
                                type="checkbox"
                                checked={todo.complete}
                                onChange={() => handleToggleComplete(todo.id)}
                            />
                            <span>{todo.task}</span>
                        </div>
                        <div className="text-gray-500 text-sm">{todo.time}</div>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
                            onClick={() => handleRemoveTodo(todo.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;