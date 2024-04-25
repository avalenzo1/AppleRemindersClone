// Object for handling reminders
const Reminders = {
  Lists: {
    all: () => {
      return Object.keys(localStorage)
        .filter(key => key.includes("list--"))
        .map(key => key.slice(6));
    },
    exists: (name) => {
      return !!localStorage.getItem(`list--${name}`);
    },
    get: (name) => {
      const listData = localStorage.getItem(`list--${name}`);
      if (!listData) throw new Error(`List '${name}' does not exist.`);
      return JSON.parse(listData);
    },
    save: (name, list) => {
      localStorage.setItem(`list--${name}`, JSON.stringify(list));
    },
    setReminder: (listName, reminderId, newData) => {
      const list = Reminders.Lists.get(listName);
      const reminder = list.tasks.find(task => task.id === reminderId);
      if (!reminder) throw new Error(`Reminder '${reminderId}' not found in list '${listName}'.`);
      Object.assign(reminder, newData);
      Reminders.Lists.save(listName, list);
    },
    create: (name, color = "blue") => {
      let modifiedName = name;
      let i = 0;
      while (Reminders.Lists.exists(modifiedName)) {
        i++;
        modifiedName = `${name} ${i}`;
      }
      const newList = {
        UUID: generateUUID(),
        title: modifiedName,
        color,
        tasks: [
          {
            id: generateUUID(),
            content: "Buy milk",
            due_date: "2024-04-30T10:00:00Z",
            completed: false,
            priority: "high"
          },
          {
            id: generateUUID(),
            content: "Buy eggs",
            due_date: null,
            completed: false,
            priority: "medium"
          }
        ]
      };
      Reminders.Lists.save(modifiedName, newList);
      Reminders.UserInterface.updateListInformation();
      Reminders.Events.ClearCategoriesEventListener();
      Reminders.Events.CreateCategoriesEventListener();
    }
  },
  UserInterface: {
    updateListInformation: () => {
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
    },
    setActivePage: (name) => {
      let main = document.getElementById("main");
      let title = document.getElementById("category-header-title");
      let counter = document.getElementById("category-header-size");
      let ul = document.getElementById("list-container");

      try {
        let list = Reminders.Lists.get(name);

        title.innerHTML = list.title;
        counter.innerHTML = list.tasks.length;
        main.style = `--list-accent: var(--rm-${list.color});`;

        ul.innerHTML = "";

        let openSpace = document.querySelector(".checklist-space");

        openSpace.onclick = () => {
          if (document.querySelector("li[data-new-reminder]")) return;

          const li = `
            <li id="${generateUUID()}" class="checklist-item" tabindex="0" data-new-reminder="true">
              <input class="form-check-input" type="checkbox" />
              <div class="checklist-item--container">
                <textarea style="
                  background-color: transparent;
                  border: none;
                  color: inherit;
                  overflow: auto;
                  resize: none;
                  outline: none;" autofocus oninput="this.removeAttribute('autofocus'); this.parentElement.parentElement.removeAttribute('data-new-reminder');" rows="1"></textarea>
              </div>
            </li>
          `;

          ul.insertAdjacentHTML("beforeend", li);
        };

        for (let i = 0; i < list.tasks.length; i++) {
          const li = `
            <li id="${list.tasks[i].id}" class="checklist-item" tabindex="0">
              <input class="form-check-input" type="checkbox" ${list.tasks[i].completed ? 'checked' : ''} onclick="Reminders.Lists.setReminder('${name}', this.parentElement.id, { completed: this.checked });" />
              <div class="checklist-item--container">
                <textarea style="
                  background-color: transparent;
                  border: none;
                  color: inherit;
                  overflow: auto;
                  resize: none;
                  outline: none;" rows="1" oninput="Reminders.Lists.setReminder('${name}', '${list.tasks[i].id}', { content: this.value })">${list.tasks[i].content}</textarea>
              </div>
            </li>
          `;

          ul.insertAdjacentHTML("beforeend", li);
        }
      } catch (e) {
        alert(e.message);
      }
    },
    Initialize: () => {
      Reminders.UserInterface.updateListInformation();
    }
  },
  Events: {
    CreateDialogEventListener: () => {
      let dialog = document.getElementById("new-list-dialog");
      let showButton = document.getElementById("open-new-list-dialog");
      let closeButton = document.getElementById("close-new-list-dialog");
      let form = document.getElementById("new-list-form");
      let listNameInput = document.getElementById("new-list-name-field");
      let listColorInputs = document.querySelectorAll("input[name='new_list_color']");
      let listSubmitButton = document.getElementById("submit-new-list");

      dialog.addEventListener("close", (event) => {
        listNameInput.value = '';
        listSubmitButton.disabled = true;
        listColorInputs[4].checked = true;
      });

      closeButton.onclick = () => {
        dialog.close();
      };

      showButton.onclick = () => {
        dialog.showModal();
      };

      form.oninput = () => {
        let colorChecked = [...listColorInputs].some(input => input.checked);
        listSubmitButton.disabled = (!colorChecked || listNameInput.value === "");
      };

      form.onsubmit = (e) => {
        let selectedColor = [...listColorInputs].find(input => input.checked).value;
        Reminders.Lists.create(listNameInput.value, selectedColor);
      };
    },
    OnCategoryClick: (e) => {
      Reminders.UserInterface.setActivePage(e.target.value);
    },
    CreateCategoriesEventListener: () => {
      const radios = document.querySelectorAll("input[name='category']");
      radios.forEach((radio) => {
        radio.addEventListener("click", Reminders.Events.OnCategoryClick);
      });
    },
    ClearCategoriesEventListener: () => {
      const radios = document.querySelectorAll("input[name='category']");
      radios.forEach((radio) => {
        radio.removeEventListener("click", Reminders.Events.OnCategoryClick);
      });
    },
    Initialize: () => {
      Reminders.Events.CreateDialogEventListener();
      Reminders.Events.CreateCategoriesEventListener();
    }
  },
  Initialize: () => {
    if (localStorage.length == 0) {
      Reminders.Lists.create("Reminders");
    }
    
    Reminders.UserInterface.Initialize();
    Reminders.Events.Initialize();
  }
};

document.addEventListener("DOMContentLoaded", Reminders.Initialize);
window.resizeTo(780, 670);
