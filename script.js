/*
  Funkcja wyświetla użytkownik wiadomość zwrotną informującą o statusie
  ostatnio wykonanej akcji.
*/
function setMessage(message) {

  document.getElementById("message").innerHTML = message;

}

/*
  Funkcja wyświetla dostępne opcje w zależności od tego czy użytkownik jest
  zalogowany.
*/
function loginCheck() {

  if (localStorage.getItem('token')) {
    isUserLoggedIn = true;
    document.getElementById("login-button").style.display = "none";
    document.getElementById("register-button").style.display = "none";
    document.getElementById("logout-button").style.display = "block";
    document.getElementById("delete-button").style.display = "block";
    setMessage(`Witaj, ${localStorage.getItem("username")}!`)
  } else {
    isUserLoggedIn = false;
    document.getElementById("login-button").style.display = "block";
    document.getElementById("register-button").style.display = "block";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("delete-button").style.display = "none";
    setMessage(`Zaloguj się, żeby połączyć się z bazą danych pogodowych!`)
  }

}

/*
  Funkcja służy do pokazania użytkowniku żądanej zawartości 
  (np. formularz do rejestracji, logowania, dodawania informacji do bazy, itd.).
*/
function get(action) {

  [...document.getElementsByClassName('content')]
  .forEach(
    div => 
    div.style.display = div.id == `${action}-content` ? "flex" : "none");

}



/*
  Zmienna służy do sprawdzenia czy użytkownik jest zalogowany.
*/
let isUserLoggedIn;

/*
  Zmienna przechowuje adres do serwera.
*/
const URL = "https://weather-info-backend.herokuapp.com/";

/*
  Otwieramy połączenie z IndexedDB
*/
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

/*
  Po załadowaniu strony sprawdzamy czy użytkownik jest zalogowany.
*/
window.onload = loginCheck;

/*
  Funkcja dodająca w zależności od tego czy użytkownik jest zalogowany,
  informacje do IndexedDB lub do MongoDB
*/
function addWeather() {

  /*
    Pobieramy informacje z formularza
  */
  const place = document.forms['weather-form']['place'].value;
  const date = document.forms['weather-form']['date'].value;
  const temperature = Number.parseInt(document.forms['weather-form']['temperature'].value);
  const form = {
    place: place,
    date: date,
    temperature: temperature
  }

  /*
    Sprawdzamy poprawność wprowadzonych danych
  */
  if (temperature && date && place) {

    if (isUserLoggedIn) {
  
      /*
        Połączenie z MongoDB
      */
      fetch(URL + "weather/", { 
        method: 'POST', 
        body: JSON.stringify([form]),
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': localStorage.getItem("token") 
        }
      })
      .then(res => res.json().then(json => setMessage(json.message)));

    } else {

      /*
        Połączenie z IndexedDB
      */
      let transaction = db.transaction('weather', 'readwrite');
      let weatherInfo = transaction.objectStore('weather');
      weatherInfo.add(form);
      setMessage('Dodano do IndexedDB!');
    
    }

    /*
      Czyszczenie wpisanych wartości z formularza.
    */
    document.forms['weather-form']['place'].value = "";
    document.forms['weather-form']['date'].value = "";
    document.forms['weather-form']['temperature'].value = "";

  }

}

/*
  Funkcja do usuwania rekordów z MongoDB.
*/
function deleteWeather() {

  /*
    Wyciągamy miejsce i datę, które identyfikują rekord.
  */
  const place = document.forms['delete-weather-form']['place'].value;
  const date = document.forms['delete-weather-form']['date'].value;

  /*
    Sprawdzamy poprawność danych.
  */
  if (date && place) {
  
    /*
      Wysyłamy żądanie o usunięcie danego rekordu
    */
    fetch(URL + `weather/${place}_${date}`, { 
      method: 'DELETE', 
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': localStorage.getItem("token") 
      }
    })
    .then(res => res.json().then(json => setMessage(json.message)));

  }

  /*
    Czyścimy wartości w formularzu.
  */
  document.forms['delete-weather-form']['place'].value = "";
  document.forms['delete-weather-form']['date'].value = "";

}

/*
  Funkcja służąca do pobrania wszystkich rekordów z bazy danych
*/
function getWeather() {

  if (isUserLoggedIn) {
    
    /*
      Jeśli użytkownik jest zalogowany to pobieramy z MongoDB
    */
    fetch(URL + "weather/", { 
      method: 'GET', 
      headers: { 'Authorization': localStorage.getItem("token") }
    })
    .then(res => res.json().then(json => {

      setMessage('Pobrano informacje z MongoDB!');

      /*
        Jeśli nam się udało to generujemy tabelę z otrzymanymi rekordami.
      */
      if (res.status == 200) {
        const tbody = document.getElementById("weather-tbody");
        tbody.innerHTML = "";
        json.forEach(obj => 
        tbody.innerHTML += `
          <tr>
            <td>${obj["place"]}</td>
            <td>${obj["date"]}</td>
            <td>${obj["temperature"]}</td>
          </tr>
        `);
      }
    }));

  } else {

    /*
      Jeśli użytkownik nie jest zalogowany to informacje bierzemy
      z IndexedDB.
    */

   const tbodyindexed = document.getElementById("weather-tbody");
   tbodyindexed.innerHTML = "";

    let transaction = db.transaction(["weather"]);
    let object_store = transaction.objectStore("weather");
    let request = object_store.openCursor();
    request.onerror = function(event) {
       console.err("error fetching data");
    };

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
        setMessage('Pobrano informacje z IndexedDB!');
      }
    };

  }

}

/*
  Funkcja służyt do zarejestrowania nowego użytkownika
*/
function register() {

  /*
    Pobieramy informacje z formularza.
  */
  const username = document.forms['register-form']['username'].value;
  const password = document.forms['register-form']['password'].value;
  const confirmPassword = document.forms['register-form']['confirmPassword'].value;

  /*
    Sprawdzamy czy podano dwa razy takie samo hasło.
  */
  if (password != confirmPassword) {
    setMessage("Hasła nie są takie same");
  
  /*
    Sprawdzamy czy hasło ma odpowiednią długość
  */
  } else if (password.length < 5 || password.length > 12) {
    setMessage("Hasło powinno składać się z co najmniej 5 znaków i maksymalnie 12");

  } else {

    const form = {
      username: username,
      password: password
    }

    /*
      Jeśli podano poprawne dane, to wysyłamy POSTA do serwera.
    */
    fetch(URL + "register/", { 
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 
        'Content-Type': 'application/json' 
      } 
    })
    .then(res => { 
      res.json().then(json => {
        setMessage(json.message);
        if (res.status == 200) {
          /*
            Jeśli poprawnie zarejestrowano użytkownika, to czyścimy
            formularz rejestraci i przekierowywujemy użytkownika
            do logowania.
          */
          document.forms['register-form']['username'].value = "";
          document.forms['register-form']['password'].value = "";
          document.forms['register-form']['confirmPassword'].value = "";
          get('login');
        }
      })
    });
    
  }

}

/*
  Funkcja do logowania użytkownika (przejście w tryb online).
  Po poprawnym zalogowaniu przesyłamy zawartość IndexedDB do MongoDB
  i czyścimy IndexedDB.
*/
function login() {

  /*
    Pobiearmy informacje z formularza logowania.
  */
  const username = document.forms['login-form']['username'].value;
  const password = document.forms['login-form']['password'].value;
  const form = {
    username: username,
    password: password
  };

  fetch(URL + "login/", { 
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Content-Type': 'application/json' 
    } 
  })
  .then(res => {
    res.json().then(json => {
      setMessage(json.message);
      if (res.status == 200) {

        /*
          Zapisujemy otrzymany token i nazwę użytkownika w localStorage.
        */
        localStorage.setItem('token', json.token);
        localStorage.setItem('username', username);
        loginCheck();
        get('add');

        /*
          Jeśli poprawnie zalogowano użytkownika to przechodzimy
          do transferu danych IndexedDB -> MongoDB.
        */

       const weather = [];

        let transaction = db.transaction(["weather"], "readwrite");
        let object_store = transaction.objectStore("weather");
        let request = object_store.openCursor();

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
            /*
              W tym miejscu wszystkie rekordy z IndexedDB są już
              w tabeli weather.
            */
            if (weather.length > 0) {

              /*
                Wysyłamy żądanie z dodaniem tabeli weather do MongoDB
              */
              fetch(URL + "weather/", { 
                method: 'POST', 
                body: JSON.stringify(weather),
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': localStorage.getItem("token") 
                }
              });

              /*
                Czyścimy IndexedDB.
              */
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

/*
  Funkcja wylogowywująca użytkownika.
*/
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  loginCheck();
  get('login');
}
