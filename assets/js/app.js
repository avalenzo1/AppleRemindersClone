console.log(
  "%c\uf8ff Reminders Clone",
  "font-family: 'SF Pro Display', sans-serif; font-size: large; background-color: black; color: white; border-radius: 0.5rem; padding: 5px;"
);

function UUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

var Reminders = Reminders || {};

Reminders.Lists = {};

/**
 * Returns all list names
 */
Reminders.Lists.all = () => {
  let keys = [];
  
  // Checks if key is a list
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    
    // Appends to keys list
    if (key.includes("list--")) {
      keys.push(key.slice(6,key.length));
    }
  }
  
  return keys;
};

Reminders.Lists.exists = (name) => {
  return localStorage.getItem(`list--${name}`) !== null;
};

Reminders.Lists.get = (name) => {
  if (!Reminders.Lists.exists(name)) {
    throw new Error(`List '${name}' does not exist.`);
  }
  
  return JSON.parse(localStorage.getItem(`list--${name}`));
};

Reminders.Lists.create = (name) => {
  if (!Reminders.Lists.exists(name)) {
    localStorage.setItem(`list--${name}`, `
    {
      "UUID": "${UUID()}",
      "title": "${name}",
      "tasks": [
        {
          "id": 101,
          "content": "Buy milk",
          "due_date": "2024-04-30T10:00:00Z",
          "completed": false,
          "priority": "high"
        },
        {
          "id": 102,
          "content": "Buy eggs",
          "due_date": null,
          "completed": false,
          "priority": "medium"
        }
      ]
    }
    `);
  }
};

Reminders.Lists.remove = (name) => {};

Reminders.UserInterface = {};

Reminders.UserInterface.updateListInformation = () => {
  const ul = document.getElementById("list-options");
  
  Reminders.Lists.all().forEach(name => {
    const list = Reminders.Lists.get(name);
    
    const li = `
    <li>
      <input type="radio" id="category--${list.title}" name="category" value="${name}" hidden>
      <label class="btn" for="category--${list.title}">
        <div style="
    display: flex;
    align-items: center;
    gap: 0.5rem;
">
          <object
            type="image/svg+xml"
            data="https://cdn.glitch.global/b58e06c1-3735-4bd9-8b6a-0b0c52f1797e/list.bullet.circle.fill.svg?v=1713913715875"
            class="sf-symbol"
          ></object>
          <span>${list.title}</span>
        </div>
        
        <span>${list.tasks.length}</span>
      </label>
    </li>
    `;
    
    ul.insertAdjacentHTML('beforeend', li);
  });
};

Reminders.UserInterface.Initialize = () => {
  Reminders.UserInterface.updateListInformation();
};

Reminders.Events = {};

Reminders.Events.CreateDialogEventListener = () => {
  let dialog = document.getElementById("new-list-dialog");
  
  let showButton = document.getElementById("open-new-list-dialog");
  let closeButton = document.getElementById("close-new-list-dialog");
  
  closeButton.onclick = () => {
    dialog.close();
  };
  
  showButton.onclick = () => {
    dialog.showModal();
  };
};

Reminders.Events.CreateCategoryEventListener = (e) => {
  let span = document.getElementById("category-header-title");
  
  try {
    let list = Reminders.Lists.get(e.target.value);
    
    span.innerHTML = e.target.value;
  }
  catch (e)
  {
    alert(e.message);
  }
};

Reminders.Events.CreateCategoriesEventListener = () => {
  const radios = document.querySelectorAll("input[name='category']");
  
  radios.forEach(radio => {
    console.log(radio);
    
    radio.addEventListener("click", Reminders.Events.CreateCategoryEventListener);
  });
};

Reminders.Events.Initialize = () => {
  Reminders.Events.CreateDialogEventListener();
  Reminders.Events.CreateCategoriesEventListener();
};

Reminders.Initialize = () => {
  if (localStorage.length == 0) {
    Reminders.Lists.create("Reminders");
  }
  
  Reminders.UserInterface.Initialize();
  Reminders.Events.Initialize();
  
};

document.addEventListener("DOMContentLoaded", Reminders.Initialize);