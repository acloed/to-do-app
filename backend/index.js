// --------------------------- ↓ SETTING UP DEPENDENCIES ↓ --------------------------------


require("dotenv").config(); // Enables the use of environment variables from .env file
const express = require("express"); // Enables the use of Express.js
const cors = require("cors"); // Enables CORS for frontend-backend communication
const mongoose = require("mongoose"); // Enables the use of Mongoose for MongoDB interactions


// ---------------------------- ↓ INITIAL APP CONFIGURATION ↓ -----------------------------

const port = process.env.PORT || 3000; // Uses port number on device to serve the backend
const app = express(); // Using Express.js to power our application/server


// -------------------------------- ↓ MIDDLEWARE SETUP ↓ -----------------------------------

app.use(express.json()); // uses express.js in JSON format

const corsOptions = {
  origin: "https://to-do-app-qsda.vercel.app", // Allow all origins - for development purposes
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions)); // Enables use of CORS for frontend-backend communication


// ---------------------------------- ↓ DATABASE CONNECTION + APP STARTUP ↓ ---------------------------------------

// Imidiately Invoked Function Expression (IIFE)
(async () => {
  try {
    mongoose.set("autoIndex", false);


    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database successfully!");

    await Task.syncIndexes();
    console.log(`✅ Indexes created`);

    app.listen(port, () => {
      console.log(`🔥 To Do App is running live on port ${port}`);
    }); // Server listens on port 3000
    
  } catch (err) {
    console.error("☠️ Startup Error:", err);
    process.exit(1);
    
  }
})();


// Define the task shemna (data structure)
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    completed: { type: Boolean, required: true, default: false }
});



// Define indexes for performance optimisation and sorting
taskSchema.index({ dueDate: 1 });
taskSchema.index({ dateCreated: 1 });


// Type of data structure to be use in database
const Task = mongoose.model("Task", taskSchema);



// ---------------------------------- ↓ API ROUTES ↓ ---------------------------------------

// Get all tasks
app.get("/api/tasks", async ( req, res) => {
  try {

    const { sortBy } = req.query;

    let sortOption = {}; 

    if (sortBy === "dueDate") {
        sortOption = { dueDate: 1 }; //ascending
    } else if (sortBy === "dateCreated") {
        sortOption = { dateCreated: 1 }; //ascending
    }

    const tasks = await Task.find({}).sort(sortOption);

    if (!tasks) {
        return res.status(404).json({ message: "Tasks not found!" });
    }

    res.json(tasks);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed to get tasks from server!" });
  }
});


// Create a new task and add it to hte array
app.post("/api/tasks/todo",  async (req, res) => {
  try {

    const { title, description, dueDate } = req.body;
    
    const taskData = {
        title,
        description,
        dueDate,
    };

    const createTask = new Task(taskData);
    const newTask = await createTask.save();


res.json({ message:"Task created Successfully!", task: newTask});

  } catch (error) {
    console.error("Error:", err);
    res.status(500).json({ message: "Failed creating tasks from server!" });
    
  }
});




// Complete the task
app.patch("/api/tasks/complete/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    const completeTask = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });
    if (!completeTask) {
        return res.status(404).json({ message: "Task not found!" });

    }

    res.json({ task: completeTask, message: "Task set to complete!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed updating task from server!" });
    
  }

});




// To make the task not complete
app.patch("/api/tasks/notComplete/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    const taskNotComplete = await Task.findByIdAndUpdate(taskId, { completed: completed }, { new: true });

    if (!taskNotComplete) {
        return res.status(404).json({ message: "Task not found!" });

    }

    res.json({ task: taskNotComplete, message: "Task set 'not complete!'" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error making the task not complete!" });
    
  }

});




// To delete a task
app.delete("/api/tasks/delete/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found!" });
    }

    res.json({task: deletedTask, message: "Task deleted successfully!" });

    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error deleting task!" });
  }
});





// To Edit the task and update the details
app.put("/api/tasks/update/:id", async (req, res) => {
  try {
    //unpacking the data
    const taskId =  req.params.id;
    const { title, description, dueDate } = req.body;
    
    // Interacting with the database
    const taskData = { title, description, dueDate};
    const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true });

    if (!updatedTask) {
        return res.status(404).json({ message: "Task not found!" });
    }

    res.json({ task: updatedTask, message: "Task updated successfully!" });
  
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error updating the task!"});
    
  }
});




// CRUD
// C - Create - Post
// R- Read - get
// U - Update - PUT or PATCH
// D - Delete - DELETE


