const URL = "http://localhost:5000/";
let openRequest = indexedDB.open('weather', 1);
let db;

function isUserLoggedIn() {

  return 

}

openRequest.onerror = function() {
  console.error("Error", openRequest.error);
};

openRequest.onupgradeneeded = function() {
  db = openRequest.result;
  if (!db.objectStoreNames.contains('weather')) { 
    db.createObjectStore('weather', {keyPath: 'id', autoIncrement: true }); 
  }
  console.log("onupgradeneede");
};

openRequest.onsuccess = function() {
  db = openRequest.result;
  console.log("onsuccess");
}

function addWeather() {

  const place = document.forms['weather-form']['place'].value;
  const date = document.forms['weather-form']['date'].value;
  const temperature = document.forms['weather-form']['temperature'].value;
  const form = {
    place: place,
    date: date,
    temperature: temperature
  }

  fetch(URL + "weather/", { 
    method: 'POST', 
    body: JSON.stringify(form),
    headers: { 'Content-Type': 'application/json' }
  });

  let transaction = db.transaction('weather', 'readwrite');
  let weatherInfo = transaction.objectStore('weather');
  let request = weatherInfo.add(form);

  request.onsuccess = function() { // (4)
    console.log("Book added to the store", request.result);
  };
  
  request.onerror = function() {
    console.log("Error", request.error);
  };

  document.forms['weather-form']['place'].value = "";
  document.forms['weather-form']['date'].value = "";
  document.forms['weather-form']['temperature'].value = "";

}


function getWeather() {

  fetch(URL + "weather/", { 
    method: 'GET', 
  })
    .then(res => {
      const tbody = document.getElementById("weather-tbody");
      res.json().then(json => {
        tbody.innerHTML = "";
        json.forEach(obj => 
          tbody.innerHTML += `
            <tr>
              <td>${obj["date"]}</td>
              <td>${obj["place"]}</td>
              <td>${obj["temperature"]}</td>
            </tr>
          `);
      }
    )
  });

  const tbodyindexed = document.getElementById("weather-tbody-indexed");

  let transaction = db.transaction(["weather"]);
  let object_store = transaction.objectStore("weather");
  let request = object_store.openCursor();
  
  request.onerror = function(event) {
     console.err("error fetching data");
  };
  tbodyindexed.innerHTML = "";
  request.onsuccess = function(event) {
     let cursor = event.target.result;
     if (cursor) {
         let key = cursor.primaryKey;
         let value = cursor.value;
         tbodyindexed.innerHTML += `
         <tr>
           <td>${value["date"]}</td>
           <td>${value["place"]}</td>
           <td>${value["temperature"]}</td>
         </tr>
       `;
         cursor.continue();
     }
     else {
         // no more results
     }
  };

}


function register() {

  const username = document.forms['register-form']['username'].value;
  const password = document.forms['register-form']['password'].value;
  const form = {
    username: username,
    password: password
  }

  fetch(
    URL + "register/",
    { method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' } });

}

function login() {

  const username = document.forms['login-form']['username'].value;
  const password = document.forms['login-form']['password'].value;
  const form = {
    username: username,
    password: password
  }
  fetch(
    URL + "login/",
    { method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' } })
  .then(res => {
    res.json().then(json => {
      console.log(json.token);
      localStorage.setItem('token', json.token)
    })
  });

}
