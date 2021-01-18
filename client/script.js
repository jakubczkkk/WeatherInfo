function addWeather() {

  const place = document.forms['weather-form']['place'].value;
  const date = document.forms['weather-form']['date'].value;
  const temperature = document.forms['weather-form']['temperature'].value;
  const form = {
    place: place,
    date: date,
    temperature: temperature
  }

  const URL = "http://localhost:5000/weather/";

  fetch(URL, { 
    method: 'POST', 
    body: JSON.stringify(form),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      res.json().then(json => {
        const div = document.getElementById("weather-form-response");
        div.innerHTML = json.message;
      })
    });

  document.forms['weather-form']['place'].value = "";
  document.forms['weather-form']['date'].value = "";
  document.forms['weather-form']['temperature'].value = "";

}


function getWeather() {

  console.log("here");
  const URL = "http://localhost:5000/weather/";
  fetch(URL, { 
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

}
