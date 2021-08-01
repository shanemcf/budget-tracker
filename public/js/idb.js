let db;
const request = indexedDB.open("budget_tracker", 1);


request.onupgradeneeded = function(event) {
  // saves to database
  const db = event.target.result;
  db.createObjectStore('new_budget', { autoIncrement: true });
};

//running success
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log("Error: " + event.target.errorCode);
};

// saves on offline
function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");
 
  const store = transaction.objectStore("new_budget");

  store.add(record);
}

function uploadBudget() {

  const transaction = db.transaction(["new_budget"], "readwrite");

 
  const store = transaction.objectStore("new_budget");

 
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
         
          const transaction = db.transaction(["new_budget"], "readwrite");
          const store = transaction.objectStore("new_budget");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(["new_budget"], "readwrite");
  const store = transaction.objectStore("new_budget");
  store.clear();
}

// check to see if back online
window.addEventListener("online", uploadBudget);