console.log(
  "%c\uf8ff Reminders Clone",
  "font-family: 'SF Pro Display', sans-serif; font-size: large; background-color: black; color: white; border-radius: 0.5rem; padding: 5px;"
);

var reminders = reminders || {};

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

reminders.lists = {};

/**
 * Returns all list names
 */
reminders.lists.all = () => {
  for (let i = 0; i < localStorage.length; i++) {
    console.log(localStorage.key(i));
  }
};

reminders.lists.exists = (name) => {
  return localStorage.getItem(`list-${name}`) !== null;
};

reminders.lists.get = (name) => {};

reminders.lists.create = (name) => {
  if (!reminders.lists.exists(name)) {
    localStorage.setItem(`list-${name}`, "{}");
  }
};

reminders.lists.remove = (name) => {};

reminders.init = () => {
  if (localStorage.length == 0) {
    reminders.lists.create("Reminders");
  }
  
  reminders.lists.all();
};

document.addEventListener("DOMContentLoaded", reminders.init);
