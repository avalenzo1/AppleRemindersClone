console.log(
  "%c\uf8ff Reminders Clone",
  "font-family: 'SF Pro Display', sans-serif; font-size: large; background-color: black; color: white; border-radius: 0.5rem; padding: 5px;"
);

/**
 * Generates a unique ID
 * 
 * @returns {string} UUID
 */
function generateUUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

var Reminders = Reminders || {};

Reminders.Reminder = class {
  constructor({ content, notes, dueDate, completed, priority } = {}) {
    this.id = generateUUID(),
    this.content = content || "";
    this.notes = notes || "";
    this.due_date = dueDate || null;
    this.completed = completed || false;
    this.priority = priority || "medium";
  }
};

Reminders.Storage = {};

/**
 * Gets all list names
 * 
 * @returns {Array} All list names
 */
Reminders.Storage.getAllListNames = () => {
  let keys = [];

  // Checks if key is a list
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);

    // Appends to keys list
    if (key.includes("list--")) {
      keys.push(key.slice(6, key.length));
    }
  }

  return keys;
};

/**
 * Checks if a list exists by name
 * 
 * @param {string} name - The name of the list
 * @returns {boolean} True if list exists, false otherwise
 */
Reminders.Storage.listExistsByName = (name) => {
  return localStorage.getItem(`list--${name}`) !== null;
};

/**
 * Gets a list by name
 * 
 * @param {string} name - The name of the list
 * @returns {Object} The list object
 * @throws {Error} If list does not exist
 */
Reminders.Storage.getList = (name) => {
  if (!Reminders.Storage.listExistsByName(name)) {
    throw new Error(`List '${name}' does not exist.`);
  }

  return JSON.parse(localStorage.getItem(`list--${name}`));
};

/**
 * Saves a list
 * 
 * @param {string} name - The name of the list
 * @param {Object} list - The list object to save
 */
Reminders.Storage.saveList = (name, list) => {
  if (Reminders.Storage.listExistsByName(name)) {
    localStorage.setItem(`list--${name}`, JSON.stringify(list));
  }

  Reminders.UserInterface.Navbar.populateLists();
};

Reminders.Storage.createReminder = (listName) => {
  const reminder = new Reminders.Reminder();
  const list = Reminders.Storage.getList(listName);
        list.tasks.push(reminder);

  Reminders.Storage.saveList(listName, list);

  Reminders.UserInterface.Navbar.populateLists();

  return reminder;
};

/**
 * Sets reminder data for a list
 * 
 * @param {string} listName - The name of the list
 * @param {string} reminderId - The ID of the reminder
 * @param {Object} newData - The new data to set
 */
Reminders.Storage.setReminder = (listName, reminderId, newData) => {
  let list = Reminders.Storage.getList(listName);

  for (let i = 0; i < list.tasks.length; i++) {
    if (list.tasks[i].id === reminderId) {
      // Update existing reminder with newData
      for (const key in newData) {
        if (key !== 'id' && list.tasks[i][key] !== undefined) {
          list.tasks[i][key] = newData[key];
        }
      }
      break; // Exit loop once reminder is updated
    }
  }

  // Save the updated list
  Reminders.Storage.saveList(listName, list);
};

/**
 * Creates a new list
 * 
 * @param {string} name - The name of the new list
 * @param {string} [color="blue"] - The color of the new list
 * 
 * @todo move later
 */
Reminders.Storage.createList = (name, color = "blue") => {
  let modifiedName = name;
  let i = 0;

  while (Reminders.Storage.listExistsByName(modifiedName)) {
    i++;
    modifiedName = `${name} ${i}`;
  }

  localStorage.setItem(
    `list--${modifiedName}`,
    JSON.stringify({
      id: generateUUID(),
      title: modifiedName,
      color: color,
      tasks: [
        new Reminders.Reminder({
          content: "Buy milk",
          dueDate: "2024-04-30T10:00:00Z",
          completed: false,
          priority: "high"
        }),
        new Reminders.Reminder({
          content: "Buy eggs",
          dueDate: null,
          completed: false,
          priority: "medium"
        })
      ]
    })
  );

  Reminders.UserInterface.Navbar.populateLists();
};

Reminders.Storage.removeList = (name) => {
  if (Reminders.Storage.listExistsByName(name))
  {
    localStorage.removeItem(`list--${name}`);

    Reminders.UserInterface.Navbar.populateLists();
  }
  else
  {
    console.warn(`List '${name}' does not exist.`);
  }
};

Reminders.UserInterface = {
  Navbar: {},
  Main: {},
  Dialog: {},
};

Reminders.UserInterface.Navbar.onViewClick = (e) => {
  console.log(e.target);

  Reminders.UserInterface.Main.setView(e.target.dataset.type, e.target.value);
};

Reminders.UserInterface.Navbar.onViewKeyDown = (e) => {
  switch (e.key)
  {
    case "Backspace":
      Reminders.Storage.removeList(e.target.previousElementSibling.value);
      break;
    case "Enter":
      break;
  }
};

Reminders.UserInterface.Navbar.createViewEventListener = () => {
  const viewRadios = document.querySelectorAll("input[name='view']");

  viewRadios.forEach((viewRadio) => { 
    viewRadio.addEventListener("click", Reminders.UserInterface.Navbar.onViewClick);
    viewRadio.nextElementSibling.addEventListener("keydown", Reminders.UserInterface.Navbar.onViewKeyDown);
  });
};

Reminders.UserInterface.Navbar.clearViewEventListener = () => {
  // List of radio inputs
  const viewRadios = document.querySelectorAll("input[name='view']");

  viewRadios.forEach((viewRadio) => {
    viewRadio.removeEventListener("click", Reminders.UserInterface.Navbar.onViewClick);
  });
};

Reminders.UserInterface.Navbar.populateLists = () => {
  const ul = document.getElementById("list-options");

  ul.innerHTML = "";

  Reminders.Storage.getAllListNames().forEach((name) => {
    const list = Reminders.Storage.getList(name);

    const li = `
    <li>
      <input type="radio" id="list--${list.title}" name="view" data-type="list" value="${name}" tabindex="0" hidden>
      <label class="btn" for="list--${list.title}" tabindex="0">
        <div style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
        ">
          <object
            type="image/svg+xml"
            data="https://cdn.glitch.global/b58e06c1-3735-4bd9-8b6a-0b0c52f1797e/list.bullet.circle.fill.svg?v=1713913715875"
            class="sf-symbol"
            width="20"
            height="20"
          ></object>
          <span>${list.title}</span>
        </div>
        
        <span>${list.tasks.length}</span>
      </label>
    </li>
    `;

    ul.insertAdjacentHTML("beforeend", li);
  });
  
  Reminders.UserInterface.Navbar.clearViewEventListener();
  Reminders.UserInterface.Navbar.createViewEventListener();
};


Reminders.UserInterface.Main.TodayView = {};
Reminders.UserInterface.Main.TodayView.showTodaysReminders = () => {};

Reminders.UserInterface.Main.ScheduledView = {};
Reminders.UserInterface.Main.ScheduledView.showScheduledReminders = () => {};

Reminders.UserInterface.Main.AllView = {};
Reminders.UserInterface.Main.AllView.showAllReminders = () => {};

Reminders.UserInterface.Main.CompletedView = {};
Reminders.UserInterface.Main.CompletedView.showCompletedReminders = () => {};

Reminders.UserInterface.Main.ListView = {};

Reminders.UserInterface.Main.ListView.clearEmptyFields = (name) => {
  const list = Reminders.Storage.getList(name);

  console.log(list.tasks.length)

  for (let i = list.tasks.length - 1; i > -1; i--)
  {
    if (list.tasks[i].content === "") {
      list.tasks.splice(i, 1);

      console.log(`Clearing item at ${i}`);
    }
  }

  Reminders.Storage.saveList(name, list);

  Reminders.UserInterface.Main.ListView.populateInformation(name);
};

Reminders.UserInterface.Main.ListView.createReminder = (name) => {
  const reminder = Reminders.Storage.createReminder(name);
  const remindersList = document.getElementById("list-container");
  const listItem = `
    <li id="${reminder.id}" class="checklist-item" tabindex="0" data-new-reminder="true">
      <input class="form-check-input" type="checkbox" />
      <div class="checklist-item--container">
        <textarea class="checklist-item--input"
        autofocus
        onfocusout="Reminders.UserInterface.Main.ListView.clearEmptyFields('${name}');"
        oninput="Reminders.Storage.setReminder('${name}', '${reminder.id}', { content: this.value }); this.removeAttribute('autofocus'); this.parentElement.parentElement.removeAttribute('data-new-reminder');" rows="1"></textarea>
      </div>
    </li>
  `;

  remindersList.insertAdjacentHTML("beforeend", listItem);
};

Reminders.UserInterface.Main.ListView.populateInformation = (name) =>
{
  const list = Reminders.Storage.getList(name);

  // Header Information
  const title = document.getElementById("reminder-title");
  const counter = document.getElementById("reminder-size");
  
  // 
  const remindersList = document.getElementById("list-container");

  title.innerHTML = list.title;
  counter.innerHTML = list.tasks.length;
  main.style = `--list-accent: var(--rm-${list.color});`;
  remindersList.innerHTML = "";
  
  

  for (let i = 0; i < list.tasks.length; i++) {
    const listItem = `
      <li id="${list.tasks[i].id}" class="checklist-item" tabindex="0">
        <input class="form-check-input" type="checkbox" ${list.tasks[i].completed ? 'checked' : ''} onclick="Reminders.Storage.setReminder('${name}', this.parentElement.id, { completed: this.checked });" />
        <div class="checklist-item--container">
          <textarea class="checklist-item--input" rows="1" onfocusout="Reminders.UserInterface.Main.ListView.clearEmptyFields('${name}');" oninput="Reminders.Storage.setReminder('${name}', '${list.tasks[i].id}', { content: this.value })">${list.tasks[i].content}</textarea>
        </div>
      </li>
    `;
  
    remindersList.insertAdjacentHTML("beforeend", listItem);
  }
};


Reminders.UserInterface.Main.ListView.showRemindersForList = (name) => {
  const main = document.getElementById("main");

  // Template information
  const template = document.getElementById("checklist-template");
  const clone = template.content.cloneNode(true);

  main.appendChild(clone);

  const openSpace = document.querySelector(".checklist-space");
  const addBtn = document.getElementById("add-reminder-btn");

  try {
    Reminders.UserInterface.Main.ListView.populateInformation(name);

    openSpace.onclick = addBtn.onclick = () => {
      if (document.querySelector("li[data-new-reminder]")) return;

      Reminders.UserInterface.Main.ListView.createReminder(name);
    };

    
  } catch (e) {
    alert(e.message);
    throw e;
  }
};

Reminders.UserInterface.Main.setView = (type, name) => {
  const main = document.getElementById("main");
  main.innerHTML = "";

  if (type === "category") {
    console.log(type)

    switch (type) {
      case "Today":
        Reminders.UserInterface.Main.TodayView.showTodaysReminders();
        break;
      case "Scheduled":
        Reminders.UserInterface.Main.ScheduledView.showScheduledReminders();
        break;
      case "All":
        Reminders.UserInterface.Main.AllView.showAllReminders();
        break;
      case "Completed":
        Reminders.UserInterface.Main.CompletedView.showCompletedReminders();
        break;
    }
  }
  else if (type === "list") {
    Reminders.UserInterface.Main.ListView.showRemindersForList(name);
  }
};

Reminders.UserInterface.initialize = () => {
  Reminders.UserInterface.Navbar.populateLists();
  Reminders.UserInterface.Navbar.createViewEventListener();
  Reminders.UserInterface.Dialog.createNewListDialog();
};

Reminders.UserInterface.Dialog.createNewListDialog = () => {
  // Dialog Elements
  const dialog = document.getElementById("new-list-dialog");
  const showButton = document.getElementById("open-new-list-dialog");
  const closeButton = document.getElementById("close-new-list-dialog");

  // Form Elements
  const form = document.getElementById("new-list-form");
  const listNameInput = document.getElementById("new-list-name-field");
  const listColorInputs = document.querySelectorAll("input[name='new_list_color']");
  const listSubmitButton = document.getElementById("submit-new-list");

  // Close event listener for dialog
  dialog.addEventListener("close", (event) => {
    listNameInput.value = '';
    listColorInputs.forEach(input => input.checked = false);
    listColorInputs[4].checked = true;
    listSubmitButton.disabled = true;
  });

  // Click event listener for close button
  closeButton.onclick = () => {
    dialog.close();
  };

  // Click event listener for show button
  showButton.onclick = () => {
    dialog.showModal();
  };

  // Input event listener for form
  form.oninput = () => {
    console.log("Change detected");

    // Check if any listColorInput is checked
    const colorChecked = Array.from(listColorInputs).some(input => input.checked);

    // Enable submit button only if a color is checked and list name is not empty
    listSubmitButton.disabled = !colorChecked || listNameInput.value === "";
  };

  // Submit event listener for form
  form.onsubmit = (e) => {
    // Get the value of the checked input for listColorInput
    const selectedColor = Array.from(listColorInputs).find(input => input.checked)?.value;

    Reminders.Storage.createList(listNameInput.value, selectedColor);
  };
};

Reminders.initialize = () => {
  if (localStorage.length == 0) {
    Reminders.Storage.createList("Reminders");
  }

  Reminders.UserInterface.initialize();
};

document.addEventListener("DOMContentLoaded", Reminders.initialize);

window.resizeTo(780, 670);
