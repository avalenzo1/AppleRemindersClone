
console.log(
  "%c\uf8ff Reminders Clone",
  "font-family: 'SF Pro Display', sans-serif; font-size: large; background-color: black; color: white; border-radius: 0.5rem; padding: 5px;"
);

function UUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
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
      keys.push(key.slice(6, key.length));
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

Reminders.Lists.create = (name, color = "blue") => {
  let modifiedName = name;
  let i = 0;

  while (Reminders.Lists.exists(modifiedName)) {
    i++;
    modifiedName = `${name} ${i}`;
  }

  localStorage.setItem(
    `list--${modifiedName}`,
    `
    {
      "UUID": "${UUID()}",
      "title": "${modifiedName}",
      "color": "${color}",
      "tasks": [
        {
          "id": "${UUID()}",
          "content": "Buy milk",
          "due_date": "2024-04-30T10:00:00Z",
          "completed": false,
          "priority": "high"
        },
        {
          "id": "${UUID()}",
          "content": "Buy eggs",
          "due_date": null,
          "completed": false,
          "priority": "medium"
        }
      ]
    }
    `
  );
  
  Reminders.UserInterface.updateListInformation();
  
  Reminders.Events.ClearCategoriesEventListener();
  Reminders.Events.CreateCategoriesEventListener();
};

Reminders.Lists.remove = (name) => {};

Reminders.UserInterface = {};

Reminders.UserInterface.updateListInformation = () => {
  const ul = document.getElementById("list-options");
  
  ul.innerHTML = "";

  Reminders.Lists.all().forEach((name) => {
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

    ul.insertAdjacentHTML("beforeend", li);
  });
};

Reminders.UserInterface.setActivePage = (name) => {
  let title = document.getElementById("category-header-title");
  let counter = document.getElementById("category-header-size");

  let ul = document.getElementById("list-container");

  try {
    let list = Reminders.Lists.get(name);

    title.innerHTML = list.title;
    counter.innerHTML = list.tasks.length;

    ul.innerHTML = "";
    
    let container = document.querySelector(".checklist-container");
    
    container.onclick = () => {
      const li = `
        <li class="checklist-item" tabindex="0" data-new-checklist="true">
          <input class="form-check-input" type="checkbox"/>
          <div class="checklist-item--container">
            <textarea style="
              background-color: transparent;
              border: none;
              color: inherit;
              overflow: auto;
              resize: none;
              outline: none;" rows="1"></textarea>
          </div>
        </li>
      `;
      
      if (document.querySelector("li[data-new-checklist='true']") == null)
      {
        ul.insertAdjacentHTML("beforeend", li);
      }
  
      
    };

    for (let i = 0; i < list.tasks.length; i++) {
      const li = `
        <li class="checklist-item" tabindex="0">
          <input class="form-check-input" type="checkbox"/>
          <div class="checklist-item--container">
            <textarea style="
              background-color: transparent;
              border: none;
              color: inherit;
              overflow: auto;
              resize: none;
              outline: none;" rows="1">${list.tasks[i].content}</textarea>
          </div>
        </li>
      `;

      ul.insertAdjacentHTML("beforeend", li);
    }
  } catch (e) {
    alert(e.message);
  }
}

Reminders.UserInterface.Initialize = () => {
  Reminders.UserInterface.updateListInformation();
};



Reminders.Events = {};

Reminders.Events.CreateDialogEventListener = () => {
  let dialog = document.getElementById("new-list-dialog");
  let showButton = document.getElementById("open-new-list-dialog");
  let closeButton = document.getElementById("close-new-list-dialog");

  let form = document.getElementById("new-list-form");

  let listNameInput = document.getElementById("new-list-name-field");
  let listColorInput;

  let listSubmitButton = document.getElementById("submit-new-list");
  
  dialog.addEventListener("close", (event) => {
    listNameInput.value = '';
    listSubmitButton.disabled = true;
  });

  closeButton.onclick = () => {
    dialog.close();
  };

  showButton.onclick = () => {
    dialog.showModal();
  };

  form.oninput = () => {
    console.log("Change detected");

    if (listNameInput.value === "") {
      listSubmitButton.disabled = true;
    } else {
      listSubmitButton.disabled = false;
    }
  };

  form.onsubmit = (e) => {
    Reminders.Lists.create(listNameInput.value);
  };
};

Reminders.Events.OnCategoryClick = (e) => {
  Reminders.UserInterface.setActivePage(e.target.value);
};

Reminders.Events.CreateCategoriesEventListener = () => {
  const radios = document.querySelectorAll("input[name='category']");

  radios.forEach((radio) => {
    console.log(radio);

    radio.addEventListener(
      "click",
      Reminders.Events.OnCategoryClick
    );
  });
};

Reminders.Events.ClearCategoriesEventListener = () => {
  const radios = document.querySelectorAll("input[name='category']");

  radios.forEach((radio) => {
    console.log(radio);

    radio.removeEventListener("click", Reminders.Events.OnCategoryClick);
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

window.resizeTo(780,670);