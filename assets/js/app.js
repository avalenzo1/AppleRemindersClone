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
  return localStorage.getItem(`list-${name}`) !== null;
};

Reminders.Lists.get = (name) => {};

Reminders.Lists.create = (name) => {
  if (!Reminders.Lists.exists(name)) {
    localStorage.setItem(`list--${name}`, "{}");
  }
};

Reminders.Lists.remove = (name) => {};

Reminders.UserInterface = {};

Reminders.UserInterface.displayLists = () => {
  const ul = document.getElementById("list-options");
  
  Reminders.Lists.all().forEach(name => {
    const li = `
    <li>
      <input type="radio" id="filter-by-${name}" name="filter" value="${name}" hidden>
      <label class="btn" for="filter-by-${name}">${name}</label>
    </li>
    `;
    
    ul.insertAdjacentHTML('beforeend', li);
  });
};

Reminders.UserInterface.

Reminders.UserInterface.initialize = () => {
  Reminders.UserInterface.displayLists();
};

Reminders.Events = {};

Reminders.Events.initialize = () => {
  const radios = document.querySelectorAll('input[name="filter"]');
  
  for (let i = 0; i < radios.length; i++)
  {
    let radio = radios[i];
    
    radio.addEventListener("click", Reminders.UserInterface.);
  }
};

Reminders.initialize = () => {
  if (localStorage.length == 0) {
    Reminders.Lists.create("Reminders");
  }
  
  Reminders.UserInterface.initialize();
  Reminders.Events.initialize();
  
};

document.addEventListener("DOMContentLoaded", Reminders.init);
