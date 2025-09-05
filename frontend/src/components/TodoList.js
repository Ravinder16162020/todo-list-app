import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

// The backend API is running on port 5000
const API_URL = 'http://localhost:5000';

function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const user = auth.currentUser;

    // A reusable function to get the user's auth token
    const getAuthHeaders = async () => {
        const token = await user.getIdToken();
        return { headers: { 'Authorization': `Bearer ${token}` } };
    };

    // Fetch tasks when the component loads
    useEffect(() => {
        const fetchTasks = async () => {
            if (user) {
                const config = await getAuthHeaders();
                try {
                    const response = await axios.get(`${API_URL}/tasks`, config);
                    setTasks(response.data);
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            }
        };
        fetchTasks();
    }, [user]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        const newTask = { title, priority, dueDate, dueTime };
        const config = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/tasks`, newTask, config);
        setTasks([...tasks, response.data]);
        setTitle('');
        setDueDate('');
        setDueTime('');
        setPriority('Medium');
    };

    const handleDeleteTask = async (id) => {
        const config = await getAuthHeaders();
        await axios.delete(`${API_URL}/tasks/${id}`, config);
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleToggleComplete = async (task) => {
        const updatedTask = { ...task, completed: !task.completed };
        const config = await getAuthHeaders();
        await axios.put(`${API_URL}/tasks/${task.id}`, { completed: updatedTask.completed }, config);
        setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
    };
    
    return (
        <div className="todo-container">
            <div className="header">
              <h1>My Tasks</h1>
              <button onClick={() => auth.signOut()} className="logout-btn">Logout</button>
            </div>
            
            <form onSubmit={handleAddTask} className="task-form">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a new task..." required />
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                <button type="submit">Add Task</button>
            </form>

            <div className="task-list">
                <h2>Pending</h2>
                {tasks.filter(task => !task.completed).map(task => (
                    <div key={task.id} className={`task-item priority-${task.priority.toLowerCase()}`}>
                        <input type="checkbox" checked={!!task.completed} onChange={() => handleToggleComplete(task)} />
                        <div className="task-details">
                            <span>{task.title}</span>
                            <small>
                              Due: {task.dueDate || 'No date'}
                              {task.dueTime ? ` ${task.dueTime}` : ''}
                            </small>
                        </div>
                        <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">🗑️</button>
                    </div>
                ))}

                <h2>Completed</h2>
                {tasks.filter(t => t.completed).map(task => (
                    <div key={task.id} className={`task-item completed`}>
                        <input type="checkbox" checked={!!task.completed} onChange={() => handleToggleComplete(task)} />
                        <div className="task-details">
                            <span>{task.title}</span>
                            <small>
                              Due: {task.dueDate || 'No date'}
                              {task.dueTime ? ` ${task.dueTime}` : ''}
                            </small>
                        </div>
                        <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TodoList;