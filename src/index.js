const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

//tabelas do "banco de dados" 
const usersTableDB = [];
const todosTableDB = [];



// SEÇÃO MIDDLEWARE


function VerfyIfUsernameAlreadyExixts(request, response, next) {
  const { username } = request.body;
  const userFound = usersTableDB.find(user => user.username === username);

  if (userFound) {
    return response.status(400).json({
      message: 'username already exists'
    })
  }
  request.userFound = userFound;



  next()


}


function CheckIfExistsTodoIdInParams(request, response, next) {

  const { id } = request.params;
  const todoFound = todosTableDB.find(todos => todos.id === id);

  if (!todoFound) {
    return response.status(400).json({
      message: 'id not found'
    })

  }

  request.bodyRequest = todoFound;


  return next()
}




function ChecksExistsUsernameInHeader(request, response, next) {

  const { username } = request.headers;
  const userFound = usersTableDB.find(user => user.username === username);

  if (!userFound) {
    return response.status(400).json({
      message: 'username not found'
    })

  }

  request.bodyRequest = userFound;

  return next();


}


function VerifyIfAlreadyDone(request, response, next) {

  const { id } = request.params;
  const { username } = request.headers

  const userFound = usersTableDB.find(user => user.username === username);
  const todoFound = userFound.todos.find(todo => todo.id === id);



  if (todoFound.id === true) {
    return response.status(400).json({
      message: 'task already done'

    })
  }
  request.bodyRequest = userFound;
  next()

}
// SEÇÃO MIDDLEWARE









app.post("/users", VerfyIfUsernameAlreadyExixts, (request, response) => {
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





app.get("/todos", ChecksExistsUsernameInHeader, (request, response) => {
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





app.post('/todos', ChecksExistsUsernameInHeader, (request, response) => {

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







app.put('/todos/:id', ChecksExistsUsernameInHeader, (request, response) => {


  const { id } = request.params;
  const { title, deadline } = request.body;

  //var todoFound = todosTableDB.find(todo => todo.id === id);

  var todoFound = todosTableDB.find((findResult) => {
    return findResult.id === id
  })

  var userFound = usersTableDB.find((findResult) => {
    return findResult.username === todoFound.username
  })

  userFound.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
    }
  })


  todoFound.title = title;
  todoFound.deadline = deadline;


  todoFound = {
    id: todoFound.id,
    title: todoFound.title,
    deadline: todoFound.deadline,
    created_at: todoFound.created_at,
    isDone: todoFound.isDone,
    deadlinePTBR: todoFound.deadlinePTBR

  }

  //todosTableDB.push(todoFound);


  const objeto = {
    id: todoFound.id,
    title: todoFound.title,
    deadline: todoFound.deadline,
    created_at: todoFound.created_at,
    isDone: todoFound.isDone,
    deadlinePTBR: todoFound.deadlinePTBR

  }





  return response.status(200).json({
    objeto
  });

})


app.get("/tables", (request, response) => {

  const users = { usersTableDB }
  const todos = { todosTableDB }

  const objeto = { usersTableDB, todosTableDB }


  response.status(200).json({ objeto });

})





app.get("/todos/:todoId", CheckIfExistsTodoIdInParams, (request, response) => {

  const { id } = request.params;

  const todoFound = todosTableDB.find(todo => todo.id === id);


  objeto = { todoFound }

  response.status(200).json({ todoFound })



})







app.delete('/todos/:id', ChecksExistsUsernameInHeader, CheckIfExistsTodoIdInParams, (request, response) => {

  const { bodyRequest } = request;
  const { id } = request.params;
  const { username } = request.headers;


  const userFound = usersTableDB.find(user => user.username === username);
  const todoFound = userFound.todos.find(todo => todo.id === id);
  // o "find" acima retuna um booleano?
  // se for true, ele retorna o objeto, se for false, ele retorna undefined




  if (todoFound !== undefined) {

    //removendo um elemento do array
    userFound.todos.splice(userFound.todos.indexOf(todoFound), 1);
    //removendo uo mesmo elemento da tabela
    todosTableDB.splice(todosTableDB.indexOf(todoFound), 1);


    const objeto = {
      id: todoFound.id,
      title: todoFound.title,
      deadline: todoFound.deadline,
      created_at: todoFound.created_at,
      isDone: todoFound.isDone,
      deadlinePTBR: todoFound.deadlinePTBR

    }

    return response.status(202).json({
      message: "Task removed", objeto
    })


  } else {
    return response.status(404).json({
      message: error.message
    })
  }
});









//#TODO: fazer esse endpoint
app.patch('/todos/:id/done', /* ChecksExistsUsernameInHeader */ /* VerifyIfAlreadyDone */(request, response) => {

  const { bodyRequest } = request;
  const { id } = request.params;
  const { username } = request.headers;

  const userFound = usersTableDB.find(findResult => findResult.username === username);
  const todoFound = userFound.todos.find(findResult => findResult.id === id);


  userFound.todos.forEach((todo) => {
    if (todo.id === id) {
      todo.isDone = true;

    }
  })





  const objetoTodos = {
    id: todoFound.id,
    title: todoFound.title,
    deadline: todoFound.deadline,
    created_at: todoFound.created_at,
    isDone: true,
    deadlinePTBR: todoFound.deadlinePTBR
  }

  const objetoUser = {
    id: userFound.id,
    name: userFound.name,
    username: userFound.username,
    todos: objetoTodos
  }


  usersTableDB.todos.isDone = userFound.todos.isDone = true;
  todosTableDB.isDone = todoFound.isDone = true;




  usersTableDB.todos.isDone = userFound.todos.isDone = true;
  //todosTableDB.isDone = todoFound.isDone = true;






  return response.status(200).json({
    message: "task done", objeto
  })

}


);





module.exports = app;