const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let tasks = [];
let nextId = 1;

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const text = (req.body?.text || '').trim();

  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  const task = {
    id: nextId++,
    text,
    completed: false,
  };

  tasks.push(task);
  return res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (typeof req.body?.completed === 'boolean') {
    task.completed = req.body.completed;
  }

  return res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  return res.status(204).send();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
