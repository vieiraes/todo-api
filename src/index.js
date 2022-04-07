const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const usersDB = [];
const todosDB = [];




function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const userFind = usersDB.find(user => user.username === username);

  if (!userFind) {
    return response.status(400).json({
      message: 'user not found'
    })

  } else if (userFind) {

    request.fullRequest = userFind;

    return next();
  }


}




app.post("/users", (request, response) => {
  //const { user } = request;
  const { name, username } = request.body;

  const objeto = {
    id: uuidv4(),
    name: name,
    username: username.toLowerCase(),
    todos: []
  };

  usersDB.push(objeto);


  response.status(200).json({
    id: objeto.id,
    name: objeto.name,
    username: objeto.username,
    todos: objeto.todos
  });


});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { fullRequest } = request;

  const objeto = {
    name: fullRequest.name,
    todos: fullRequest.todos
  }

  response.status(200).json({
    name: objeto.name,
    todos: objeto.todos
  });

});







app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;