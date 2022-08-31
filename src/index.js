const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userExists = users.find(user => request.headers.username === user.username);
  const userIndex = users.findIndex(user => user.username === userExists.username);

  if(userExists){
    response.locals.user = userExists;
    response.locals.userIndex = userIndex;
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
  const userTODO = response.locals.user.todos;

  response.json(userTODO);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;

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
  users[userIndex] = user;

  response.sendStatus(201);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;

  users[userIndex].todos = userExists.todos.map(todo => {
    if(todo.id === request.params.id){
      return {
        ...todo,
        title: request.body.title,
        deadline: new Date(request.body.deadline)
      }
    }
    return todo
  })

  response.sendStatus(200);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;

  users[userIndex].todos = userExists.todos.map(todo => {
    if(todo.id === request.params.id) {
      return {
        ...todo,
        done: true
      }
    }
    return todo
  });

  response.sendStatus(200);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;
  
  users[userIndex].todos = userExists.todos.filter(todo => todo.id != request.params.id);

  response.sendStatus(204);
});

module.exports = app;