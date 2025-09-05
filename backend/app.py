import os
from flask import Flask, request, jsonify, g
from functools import wraps
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask_cors import CORS 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- App Initialization ---
app = Flask(__name__)
# CORS allows the React frontend (running on a different port) to communicate with this backend
CORS(app) 

# --- Firebase Initialization ---
cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Authentication Decorator ---
# This special function will protect our API routes
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Authentication Token is missing!'}), 401
        
        try:
            # Extract the token from "Bearer <token>"
            id_token = auth_header.split(' ')[1]
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(id_token)
            # Store the user's unique ID for this request
            g.user_id = decoded_token['uid']
        except Exception as e:
            return jsonify({'message': 'Invalid Authentication Token!', 'error': str(e)}), 403
            
        return f(*args, **kwargs)
    return decorated_function

# --- API Routes ---

@app.route('/tasks', methods=['GET'])
@auth_required # This route is now protected
def get_tasks():
    """Gets all tasks for the currently logged-in user."""
    user_id = g.user_id # Retrieve the user ID set by the decorator
    tasks_query = db.collection('tasks').where('userId', '==', user_id).stream()
    tasks = [doc.to_dict() for doc in tasks_query]
    return jsonify(tasks), 200

@app.route('/tasks', methods=['POST'])
@auth_required
def add_task():
    """Adds a new task for the currently logged-in user."""
    user_id = g.user_id
    data = request.json
    
    doc_ref = db.collection('tasks').document()
    
    new_task = {
        'id': doc_ref.id,
        'title': data.get('title'),
        'priority': data.get('priority', 'Medium'),
        'dueDate': data.get('dueDate', None),
        'dueTime': data.get('dueTime', None),
        'completed': False,
        'userId': user_id # Link the task to the user
    }
    doc_ref.set(new_task)
    return jsonify(new_task), 201

@app.route('/tasks/<string:task_id>', methods=['PUT'])
@auth_required
def update_task(task_id):
    """Updates a task's details (e.g., marking as complete)."""
    user_id = g.user_id
    task_ref = db.collection('tasks').document(task_id)
    
    # Security Check: Ensure the task belongs to the user trying to update it
    task_doc = task_ref.get()
    if not task_doc.exists or task_doc.to_dict().get('userId') != user_id:
        return jsonify({'message': 'Task not found or permission denied'}), 404

    data = request.json
    task_ref.update(data)
    return jsonify({'success': True}), 200

@app.route('/tasks/<string:task_id>', methods=['DELETE'])
@auth_required
def delete_task(task_id):
    """Deletes a task."""
    user_id = g.user_id
    task_ref = db.collection('tasks').document(task_id)

    # Security Check
    task_doc = task_ref.get()
    if not task_doc.exists or task_doc.to_dict().get('userId') != user_id:
        return jsonify({'message': 'Task not found or permission denied'}), 404
        
    task_ref.delete()
    return jsonify({'success': True}), 200

# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)