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

function checkExistsTODO(request, response, next) {
  const userExists = response.locals.user;

  const TODO = userExists.todos.find(todo => todo.id === request.params.id);

  if (TODO) {
    response.locals.todo = TODO;
    next();
  } else {
    response.status(404).json({error: "TODO doesn't exist!"});
  }
}

app.post('/users', (request, response) => {
  const userExists = users.find(user => request.body.username === user.username);

  if(userExists) {
    response.status(400).json({error: 'User already exists!'})
  };

  const newUser = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const userTODO = response.locals.user.todos;

  response.send(userTODO);
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

  response.status(201).json(newTODO);

});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTODO, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;
  const updateTODO = response.locals.todo;


  updateTODO.title = request.body.title;
  updateTODO.deadline = request.body.deadline;

  users[userIndex].todos = userExists.todos.map(todo => {
    if(todo.id === request.params.id){
      return updateTODO
    }
    return todo
  })
  
  response.status(200).json({
    title: updateTODO.title,
    deadline: updateTODO.deadline,
    done: updateTODO.done
  });

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTODO, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;
  const updateTODO = response.locals.todo;

  updateTODO.done = true;

  users[userIndex].todos = userExists.todos.map(todo => {
    if(todo.id === request.params.id) {
      return updateTODO
    }
    return todo
  });

  response.status(200).json(updateTODO);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTODO, (request, response) => {
  const userExists = response.locals.user;
  const userIndex = response.locals.userIndex;
  
  users[userIndex].todos = userExists.todos.filter(todo => todo.id != request.params.id);

  response.sendStatus(204);
});

module.exports = app;