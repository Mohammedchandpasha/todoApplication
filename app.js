const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API1
//get all rows whose status is TO DO

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  if (status != "" && priority === "") {
    const getStatusQuery = `
    SELECT * FROM todo
    WHERE status='${status}';`;
    const todoStatus = await db.all(getStatusQuery);
    response.send(todoStatus);
  }
  if (status === "" && priority != "") {
    const getStatusQuery = `
    SELECT * FROM todo
    WHERE priority='${priority}';`;
    const todoPriority = await db.all(getStatusQuery);
    response.send(todoPriority);
  }
  if (status != "" && priority != "") {
    const getStatusQuery = `
    SELECT * FROM todo
    WHERE priority='${priority}' AND status='${status}' ;`;
    const todoPriority = await db.all(getStatusQuery);
    response.send(todoPriority);
  }
  if (search_q != "") {
    const getStatusQuery = `
    SELECT * FROM todo
    WHERE todo like '%${search_q}%';`;
    const todoPriority = await db.all(getStatusQuery);
    response.send(todoPriority);
  }
});
//API2
//GET all todo based on todoId
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodosBasedOnTodoId = `
    SELECT * FROM todo
    WHERE id=${todoId};
    `;
  const todoItem = await db.get(getTodosBasedOnTodoId);
  response.send(todoItem);
});
// Post API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(request.body);
  const postQuery = `INSERT INTO
    todo(id,todo,priority,status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
        );`;

  await db.run(postQuery);
  response.send("Todo Successfully Added");
});
//update todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", priority = "", status = "" } = request.body;
  if (status != "") {
    const updateStatusQuery = `
        UPDATE todo 
        SET 
        status='${status}'

        WHERE id=${todoId};'`;
    await db.run(updateStatusQuery);
    response.send("Status Updated");
  }
  if (priority != "") {
    const updatePriorityQuery = `UPDATE todo 
        SET 
        priority='${priority}'
        WHERE id=${todoId};`;
    await db.run(updatePriorityQuery);
    response.send("Priority Updated");
  }
  if (todo != "") {
    const updateTodoQuery = `
        UPDATE todo 
        SET 
        todo='${todo}'
        WHERE 
          id=${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
});

//Delete Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM todo 
  WHERE id=${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
