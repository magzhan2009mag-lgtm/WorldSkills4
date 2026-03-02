const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function renderTask(task) {
  const li = document.createElement('li');

  const text = document.createElement('span');
  text.className = 'task-text';
  text.textContent = task.text;
  if (task.completed) text.classList.add('completed');

  text.addEventListener('click', async () => {
    try {
      const updated = await api(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !text.classList.contains('completed') }),
      });
      text.classList.toggle('completed', updated.completed);
    } catch (error) {
      console.error(error.message);
      alert('Не удалось обновить задачу');
    }
  });

  const removeBtn = document.createElement('button');
  removeBtn.className = 'delete-btn';
  removeBtn.textContent = 'Удалить';

  removeBtn.addEventListener('click', async () => {
    try {
      await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
      li.remove();
    } catch (error) {
      console.error(error.message);
      alert('Не удалось удалить задачу');
    }
  });

  li.append(text, removeBtn);
  list.appendChild(li);
}

async function loadTasks() {
  list.innerHTML = '';
  const tasks = await api('/api/tasks');
  tasks.forEach(renderTask);
}

async function createTask() {
  const value = input.value.trim();
  if (!value) return;

  try {
    const task = await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ text: value }),
    });
    renderTask(task);
    input.value = '';
    input.focus();
  } catch (error) {
    console.error(error.message);
    alert('Не удалось добавить задачу');
  }
}

addBtn.addEventListener('click', createTask);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    createTask();
  }
});

loadTasks().catch((error) => {
  console.error(error.message);
  alert('Не удалось загрузить список задач');
});
