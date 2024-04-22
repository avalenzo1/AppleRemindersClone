console.log("%c\uf8ff Reminders Clone", "font-family: 'SF Pro Display', sans-serif; font-size: large; background-color: black; color: white; border-radius: 0.5rem; padding: 5px;");

var reminders = reminders || {};

reminders.lists = {};

/**
 * Returns all list names
*/
reminders.lists.all = () => {
  
};

reminders.lists.exists = (name) => {
  return localStorage.getItem(`list-${name}`) !== null;
};

reminders.lists.get = (name) => {
  
};

reminders.lists.create = (name) => {
  if (!reminders.lists.exists(name))
  {
    localStorage.setItem(`list-${name}`, '{}');
  }
};

reminders.lists.remove = (name) => {
  
};

reminders.init = () => {
  console.log(localStorage);
  
  if (localStorage.length == 0) {
    reminders.lists.create("Reminders");
  }
};

document.addEventListener("DOMContentLoaded", reminders.init);