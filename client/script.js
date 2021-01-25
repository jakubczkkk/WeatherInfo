const URL = "http://localhost:5000/";
let isUserLoggedIn = false;

let openRequest = indexedDB.open('weather', 1);
let db;

openRequest.onerror = function() {
  console.error("Error on connecting with IndexedDB", openRequest.error);
};

openRequest.onupgradeneeded = function() {
  db = openRequest.result;
  if (!db.objectStoreNames.contains('weather')) { 
    db.createObjectStore('weather', {keyPath: 'id', autoIncrement: true }); 
  }
};

openRequest.onsuccess = function() {
  db = openRequest.result;
}

function addWeather() {

  const place = document.forms['weather-form']['place'].value;
  const date = document.forms['weather-form']['date'].value;
  const temperature = Number.parseInt(document.forms['weather-form']['temperature'].value);
  const form = {
    place: place,
    date: date,
    temperature: temperature
  }

  if (temperature && date && place) {

    if (isUserLoggedIn) {
  
      fetch(URL + "weather/", { 
        method: 'POST', 
        body: JSON.stringify([form]),
        headers: { 'Content-Type': 'application/json', 'Authorization': localStorage.getItem("token") }
      });

    } else {

      let transaction = db.transaction('weather', 'readwrite');
      let weatherInfo = transaction.objectStore('weather');
      weatherInfo.add(form);
    
    }

    document.forms['weather-form']['place'].value = "";
    document.forms['weather-form']['date'].value = "";
    document.forms['weather-form']['temperature'].value = "";

  }

}


function getWeather() {

  if (isUserLoggedIn) {
    fetch(URL + "weather/", { 
      method: 'GET', 
      headers: { 'Authorization': localStorage.getItem("token") }
    })
      .then(res => {
        if (res.status == 200) {
          const tbody = document.getElementById("weather-tbody");
          res.json().then(json => {
            tbody.innerHTML = "";
            json.forEach(obj => 
              tbody.innerHTML += `
                <tr>
                  <td>${obj["place"]}</td>
                  <td>${obj["date"]}</td>
                  <td>${obj["temperature"]}</td>
                </tr>
              `);
            })
        }
      });
  } else {
    const tbodyindexed = document.getElementById("weather-tbody");

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
           let value = cursor.value;
           tbodyindexed.innerHTML += `
           <tr>
             <td>${value["place"]}</td>
             <td>${value["date"]}</td>
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

}


function register() {

  const username = document.forms['register-form']['username'].value;
  const password = document.forms['register-form']['password'].value;
  const confirmPassword = document.forms['register-form']['confirmPassword'].value;

  if (password != confirmPassword) {

    document.getElementById("form-response").innerHTML = "Hasła nie są takie same";
  
  } else if (password.length < 5 || password.length > 12) {

    document.getElementById("form-response").innerHTML = "Hasło powinno składać się z co najmniej 5 znaków i maksymalnie 12";

  } else {

    const form = {
      username: username,
      password: password
    }

    fetch(
      URL + "register/",
      { method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        res.json().then(json => {
          document.getElementById("form-response").innerHTML = json.message;
          if (res.status == 200) {
            document.forms['register-form']['username'].value = "";
            document.forms['register-form']['password'].value = "";
            document.forms['register-form']['confirmPassword'].value = "";
          }
        }
      )});
    
  }

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
      document.getElementById("form-response").innerHTML = json.message;
      if (res.status == 200) {
        isUserLoggedIn = true;
        localStorage.setItem('token', json.token);
        document.getElementById("user-not-logged").style.display = "none";
        document.getElementById("user-logged").style.display = "block";

        // send data from indexedDB to mongoDB Atlas
        let transaction = db.transaction(["weather"], "readwrite");
        let object_store = transaction.objectStore("weather");
        let request = object_store.openCursor();
        const weather = [];

        request.onerror = function(event) {
          console.err("error fetching data");
        };
        request.onsuccess = function(event) {
          let cursor = event.target.result;
          if (cursor) {
            weather.push({
              place: cursor.value["place"],
              date: cursor.value["date"],
              temperature: cursor.value["temperature"]
            });
            cursor.continue();
          }
          else {
            if (weather.length > 0) {
              fetch(URL + "weather/", { 
                method: 'POST', 
                body: JSON.stringify(weather),
                headers: { 'Content-Type': 'application/json' }
              });
              object_store.clear();
            }
          }
        }
        
      }
      document.forms['login-form']['username'].value = "";
      document.forms['login-form']['password'].value = "";
    })
  });

}

function logout() {
  document.getElementById("user-logged").style.display = "none";
  document.getElementById("user-not-logged").style.display = "block";
  isUserLoggedIn = false;
  localStorage.removeItem("token");
}
