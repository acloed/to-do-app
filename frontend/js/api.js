

// ============== Global Variables ==============

// const bootstrap = require("bootstrap");



const url = "https://to-do-app-ogox.onrender.com"
const taskForm = document.getElementById('taskForm');
const toDoList = document.getElementById('toDoList');
const completedList = document.getElementById('completedList');



// ============== General Functions ==============

function resetForm() {
    taskForm.reset()

}




// ============== General Event Listeners (Triggers) ==============

window.addEventListener('DOMContentLoaded', displayTasks);



const sortBtn = document.getElementById("sortSelect");

sortBtn.addEventListener("change" , displayTasks);

window.addEventListener('DOMContentLoaded', () => {
    sortBtn.value = "default";
});


// ============== Event Listeners (Triggers) for Tasks ==============

taskForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stops reloading of browser on form submission
    createNewTask(); 
});

[toDoList, completedList].forEach(list => {
    list.addEventListener('click', (event) => {

        if (event.target.classList.contains("done")) {
            const taskId = event.target.getAttribute('data-id');
            completeTask(taskId);
        }

        if (event.target.classList.contains("notDone")) {
            const taskId = event.target.getAttribute('data-id');
            taskNotCompleted(taskId);
        }

        if (event.target.classList.contains("delete")) {
            const taskId = event.target.getAttribute('data-id');
            deleteTask(taskId);
        }

        if (event.target.classList.contains("edit")) {

            // Group task data
            const task = {
                id: event.target.getAttribute("data-id"),
                title: event.target.getAttribute("data-title"),
                description: event.target.getAttribute("data-description"),
                dueDate: new Date(event.target.getAttribute("data-due-date"))
            }


            // Group modal elements
            const modal = {
                titleInput: document.getElementById('editTaskName'),
                descriptionInput: document.getElementById('editTaskDescription'),
                dueDateInput: document.getElementById('editDueDate'),
                saveButton: document.getElementById('saveEditButton')
            }

            // Check if all modal elements exist before proceeding
            if (!modal.titleInput || !modal.descriptionInput || !modal.dueDateInput || !modal.saveButton) {
                console.error('Modal elements not found in DOM');
                return;
            }

            // fill modal inputs
            modal.titleInput.value = task.title;
            modal.descriptionInput.value = task.description;
            modal.dueDateInput.value = task.dueDate.toISOString().split('T')[0];

            // Save changes
            modal.saveButton.addEventListener("click", async () =>{
                await editTask(task.id);
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            }, {once: true});
        }
    });
});



// ============== Task Functions ==============


// Retrieving tasks from backend API
async function displayTasks() {

    const sortBy = sortBtn.value; // dueDate, dateCreated, default

    let query = "";
    if(sortBy !== "default") {
        query = `?sortBy=${sortBy}`;
    }





    try {
        const response = await fetch(`${url}/api/tasks${query}`);

        if (!response.ok) {
            throw new Error("Failed to get tasks from server" + response.status);
        }

        const data = await response.json();

        function formatTask(task) {
            const li = document.createElement('li');

            li.classList.add('card', 'p-3', 'shadow-sm', 'mt-2');
            const done = task.completed ? 'opacity-50 text-decoration-line-through' : ''; // class list if task is completed or not

            li.innerHTML = `
                 <div class="d-flex justify-content-between align-items-start">
                    <h4 class="${done} col-11">${task.title}</h4>
                    <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="Close"></button>
                 </div>
                    <p class="${done}">${task.description}</p>
                    <p class="${done}"><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                    <div class="d-flex justify-content-between align-items-end">
                 <div>
                    ${
                    task.completed ? `<button data-id="${task._id}" class="btn btn-primary shadow-sm notDone" type="button">Not Done</button>`
                    :
                    `
                    <button data-bs-toggle="modal" data-bs-target="#editModal" data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" class="btn btn-primary shadow-sm edit" type="button">Edit</button>
                    <button data-id="${task._id}" class="btn btn-primary shadow-sm done" type="button">Done</button>
                `
                    }
                </div>
                    <p class="m-0 ${done}"><strong>Created on: </strong>${new Date(task.dateCreated).toLocaleDateString()}</p>
                </div>
            `;
            return li;
        }

        toDoList.innerHTML = '';
        completedList.innerHTML = '';

        data.forEach(task => {
            const formattedTask = formatTask(task);
            task.completed ? completedList.appendChild(formattedTask) : toDoList.appendChild(formattedTask);
        });

        resetForm();
        
    } catch (error) {
        console.error("Error:", error);
        
    }
}


// Create a new task
async function createNewTask() {
    

        const taskDetails = {
            title: taskForm.taskName.value.trim(),
            description: taskForm.taskDescription.value.trim(),
            dueDate: taskForm.dueDate.value,
        }

        if (!taskDetails.title || !taskDetails.description || !taskDetails.dueDate) {
            return alert("Please fill in all fields.");
        }

    try {

        const response = await fetch(`http://localhost:3000/api/tasks/todo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to create new task: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);


       displayTasks();
        
    } catch (error) {
        
    }
    

}



// Updating the tasks (complete)
async function completeTask(taskId) {
    try {

       
        const response = await fetch(`${url}/api/tasks/complete/${taskId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ completed: true }),
        });

        if (!response.ok) {
            throw new Error(`Failed to complete task: ${response.status}`);
        }

        const data = await response.json();

        console.log("Task completed:", data);


        displayTasks();
        
    } catch (error) {
        console.error("Error:", error);
        
    }
}




// Updating the tasks (Not Complete)
async function taskNotCompleted(taskId) {
    try {

       
        const response = await fetch(`${url}/api/tasks/notComplete/${taskId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ completed: false }),
        });

        if (!response.ok) {
            throw new Error(`Failed to make the task not complete: ${response.status}`);
        }

        const data = await response.json();

        console.log("Task set to 'not completed':", data);


        displayTasks();
        
    } catch (error) {
        console.error("Error:", error);
        
    }
}






// Deleting a task
async function deleteTask(taskId) {
   try {
    const response = await fetch(`${url}/api/tasks/delete/${taskId}`, {
        method: "DELETE",
        headers:  {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
    }

    const data = await response.json();
    console.log( "Task deleted successfully!", data);
    displayTasks();
   } catch (error) {
        console.error("Error:", error);
    
   }
}




// To Edit a task
async function editTask(taskId) {

    const updatedDetails = {
        title: document.getElementById('editTaskName').value.trim(),
        description: document.getElementById('editTaskDescription').value.trim(),
        dueDate: document.getElementById('editDueDate').value,
    }

    if (!updatedDetails.title || !updatedDetails.description || !updatedDetails.dueDate) {
        return alert("Please fields required.");
    }

    try {
        const response = await fetch (`${url}/api/tasks/update/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedDetails),
        });

        if (!response.ok) {
            throw new Error(`Failed to edit task: ${response.status}`);
        }

        const data = await response.json();
        console.error("Edited task: ", data);

        displayTasks();

    }catch (error) {
            console.error("Error:", error);        
        
    }

}


