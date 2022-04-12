const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

//tabelas do "banco de dados" 
const usersTableDB = [];
const todosTableDB = [];



function checkExistsIdParams(request, response, next) {

  const { id } = request.params;

  const todoFound = todosTableDB.find(todo => todo.id === id);

  if (!todoFound) {
    return response.status(400).json({
      message: 'id not found'
    })

  } else if (todoFound) {

    request.bodyRequest = todoFound;

    return next()
  }

}


function checksExistsUsernameHeader(request, response, next) {

  const { username } = request.headers;
  const userFound = usersTableDB.find(user => user.username === username);

  if (!userFound) {
    return response.status(400).json({
      message: 'username not found'
    })

  } else if (userFound) {

    request.bodyRequest = userFound;

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



  usersTableDB.push(objeto);


  response.status(200).json({
    id: objeto.id,
    name: objeto.name,
    username: objeto.username,
    todos: objeto.todos
  });


});





app.get("/todos", checksExistsUsernameHeader, (request, response) => {
  const { bodyRequest } = request;

  const objeto = {
    name: bodyRequest.name,
    todos: bodyRequest.todos
  }

  response.status(200).json({
    name: objeto.name,
    todos: objeto.todos
  });

});





app.post('/todos', checksExistsUsernameHeader, (request, response) => {

  const { bodyRequest } = request;
  const { title, deadline } = request.body;
  const { username } = request.headers;

  //converter data para acrecentar o numerod e dias do deadline
  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + deadline);


  //montando o  objeto para o  push
  const objeto = {
    id: uuidv4(),
    username: username,
    title: title,
    created_at: new Date(),
    isDone: false,
    deadline: targetDate,
  }
  const deadlinePTBR = objeto.deadline.toLocaleDateString('pt-BR');


  //gravando no array do usuario do request
  bodyRequest.todos.push({
    id: objeto.id,
    username: objeto.username,
    title: objeto.title,
    created_at: objeto.created_at,
    isDone: objeto.isDone,
    deadline: objeto.deadline,
    deadlinePTBR: deadlinePTBR
  }

  );
  //gravando na "tabela" todosDB
  todosTableDB.push({
    id: objeto.id,
    username: objeto.username,
    title: objeto.title,
    created_at: objeto.created_at,
    isDone: objeto.isDone,
    deadline: objeto.deadline,
    deadlinePTBR: deadlinePTBR
  });



  return response.status(200).json({
    id: objeto.id,
    title: objeto.title,
    created_at: objeto.created_at,
    deadline: objeto.deadline,
    deadlinePTBR: deadlinePTBR,
    isDone: objeto.done
  })

});




app.put('/todos/:id', checksExistsUsernameHeader, checkExistsIdParams, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;


  const objeto = {
    id: id,
    title: title,
  }

  return response.status(200).json({
    id: objeto.id,
    title: objeto.title,
  });

})















app.patch('/todos/:id/done', checksExistsUsernameHeader, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUsernameHeader, (request, response) => {
  // Complete aqui
});

module.exports = app;