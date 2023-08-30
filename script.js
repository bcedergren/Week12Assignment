class Task {
  constructor(title, description) {
    this.title = title;
    this.description = description;
  }
}

class TaskService {
  static url = "http://localhost:3001/tasks";
  static taskList = $("#taskList");

  static fetchAllTasks() {
    return $.get(this.url);
  }

  static updateTask(task) {
    return $.ajax({
      url: `${this.url}/${task.id}`,
      dataType: "json",
      data: JSON.stringify(task),
      contentType: "application/json",
      type: "put",
    });
  }

  static deleteTask(id) {
    return $.ajax({
      url: `${this.url}/${id}`,
      type: "delete",
    });
  }

  static completeTask(id) {
    return $.ajax({
      url: `${this.url}/${id}`,
      method: "PATCH",
      data: JSON.stringify({ completed: true }),
      contentType: "application/json",
      error: function (xhr, textStatus, errorThrown) {
        alert("Error completing task:", errorThrown);
      },
    });
  }

  static editTask(taskId) {
    const newTitle = prompt("Enter the new task title:");
    const newDescription = prompt("Enter the new task description:");
    if (newTitle !== "") {
      return $.ajax({
        url: `${this.url}/${taskId}`,
        method: "PUT",
        data: { title: newTitle, description: newDescription },
        error: function (xhr, textStatus, errorThrown) {
          alert("Error creating task:", errorThrown);
        },
      });
    }
  }

  static createTask(title, description) {
    const taskData = {
      title,
      description,
      completed: false,
    };

    return $.post({
      url: this.url,
      contentType: "application/json",
      data: JSON.stringify(taskData),
    }).catch((error) => {
      alert("Error creating task:", error);
    });
  }
}

class DOMManager {
  static getAllTasks() {
    return TaskService.fetchAllTasks().then((tasks) => this.render(tasks));
  }

  static completeTask(id) {
    TaskService.completeTask(id)
      .then(() => {
        return TaskService.fetchAllTasks();
      })
      .then((tasks) => this.render(tasks));
  }

  static editTask(id) {
    TaskService.editTask(id)
      .then(() => {
        return TaskService.fetchAllTasks();
      })
      .then((tasks) => this.render(tasks));
  }

  static deleteTask(id) {
    TaskService.deleteTask(id)
      .then(() => {
        return TaskService.fetchAllTasks();
      })
      .then((tasks) => this.render(tasks));
  }

  static addTask(title, description) {
    TaskService.createTask(title, description)
      .then(() => {
        return TaskService.fetchAllTasks();
      })
      .then((tasks) => this.render(tasks));
  }

  static render(tasks) {
    this.tasks = tasks;
    const taskList = $("#taskList");
    taskList.empty();

    for (let task of tasks) {
      $("#taskList").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center" data-task-id="${
          task.id
        }">
          <span class="task-title">${task.completed ? "✅" : ""}${
          task.title
        }</span>
          <span>${task.description}</span>
          <div>
            <button class="btn btn-sm btn-success" ${
              task.completed ? "disabled" : ""
            }  onclick="DOMManager.completeTask(${task.id})">Complete</button>
            <button class="btn btn-sm btn-primary" ${
              task.completed ? "disabled" : ""
            } onclick="DOMManager.editTask(${task.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="DOMManager.deleteTask(${
              task.id
            })">Delete</button>
          </div>
        </li>`
      );
    }
  }
}

$(document).on("click", "#addTask", (event) => {
  event.preventDefault();

  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();

  if (title != "" && description != "") {
    DOMManager.addTask(title, description);
  }

  $("#taskTitle").val("");
  $("#taskDescription").val("");
});

DOMManager.getAllTasks();
