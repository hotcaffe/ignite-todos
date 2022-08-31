const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const user = users.find(user => request.headers.username === user.username);

  if(user){
    response.locals.user = user;
    next();
  } else {
    response.sendStatus(404);
  }

}

app.post('/users', (request, response) => {
  users.push({
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  });

  response.sendStatus(201);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // console.log(request.header.username)
  response.sendStatus(200)
  // const user = users.find(user = user === request.header.user)
  // Complete aqui
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user

  const newTODO = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date()
  };
  
  const user = {
    ...userExists,
    todos: [...userExists.todos, newTODO]
  };
  const userIndex = users.findIndex(user => user.username === response.locals.user.username);
  users[userIndex] = user;

  console.log(newTODO.id)

  console.log(JSON.stringify(users))

  response.sendStatus(201);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user

  const userIndex = users.findIndex(user => user.username === userExists.username)

  const updatedTODO = userExists.todos.map(todo => {
    if(todo.id === request.params.id){
      return {
        ...todo,
        title: request.body.title,
        deadline: new Date(request.body.deadline)
      }
    }
    return todo
  })

  users[userIndex].todos = updatedTODO

  console.log(JSON.stringify(users))

  response.sendStatus(200)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;