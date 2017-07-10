/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

// Variables to hold DOM elements
const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $map = $('#map');
const $weather = $('#weather');

// Variables to hold location data elements
const $geoLat = $('[data-geo="lat"]');
const $geoLng = $('[data-geo="lng"]');

// Call Geocomplete plugin to create autocomplete field and interactive map
$searchFld.geocomplete({
  map: $map,
  mapOptions: {
    backgroundColor: '#fdfdfa' // $white
  },
  markerOptions: {
    draggable: true
  },
  details: $locDetails,
  detailsAttribute: 'data-geo'
// Bind returned results event and call refresh data function if successful
}).bind('geocode:result', function (event) {
  refreshData();
});

// Clear button click event to remove text from search input
$clearBtn.click(function () {
  $searchFld.val('');
});

// Function to refresh location data based on new search term
let refreshData = function () {
  // Get stored latitude and longitude values
  let latitude = $geoLat.text();
  let longitude = $geoLng.text();
  // Store OpenWeatherMap API key and URLs
  let apiKeyOwm = '2a6299aeb6ba1831330eb81d8e215b1d';
  let urlWeather = 'https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/weather?';
  let urlForecast = 'https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast/daily?';
  // Set weather parameters for AJAX calls
  let weatherParam = $.param({
    lat: latitude,
    lon: longitude,
    units: 'imperial',
    APPID: apiKeyOwm
  });
  // AJAX call for location's current weather
  $.ajax({
    url: urlWeather + weatherParam,
    method: 'GET'
  }).done(function (weather) {
    weatherHtml(weather);
    console.log(weather);
  });
  // AJAX call for location's 7-day forecast
  $.ajax({
    url: urlForecast + weatherParam,
    method: 'GET'
  }).done(function (forecast) {
    console.log(forecast);
  });
};

let weatherHtml = function (data) {
  let desc = capitalize(data.weather[0].description);
  let dir = cardinalDir(data.wind.deg);
  let wind = Math.round(data.wind.speed);
  let temp = Math.round(data.main.temp);
  let html =
    `<i class="owf owf owf-${data.weather[0].id}"></i>
    <div>
      <p>${data.name}</p>
      <p>${desc}</p>
    </div>
    <div>
      <p>Wind ${dir}</p>
      <p>${wind} mph</p>
    </div>
    <p>${temp}&deg;</p>`;
  $weather.append(html);
};

// Function to capitalize first letter of a string
let capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

let cardinalDir = function (deg) {
  switch (true) {
    case (deg >= 0 && deg <= 11.25):
      return 'N';
    case (deg > 11.25 && deg <= 33.75):
      return 'NNE';
    case (deg > 33.75 && deg <= 56.25):
      return 'NE';
    case (deg > 56.25 && deg <= 78.75):
      return 'ENE';
    case (deg > 78.75 && deg <= 101.25):
      return 'E';
    case (deg > 101.25 && deg <= 123.75):
      return 'ESE';
    case (deg > 123.75 && deg <= 146.25):
      return 'SE';
    case (deg > 146.25 && deg <= 168.75):
      return 'SSE';
    case (deg > 168.75 && deg <= 191.25):
      return 'S';
    case (deg > 191.25 && deg <= 213.75):
      return 'SSW';
    case (deg > 213.75 && deg <= 236.25):
      return 'SW';
    case (deg > 236.25 && deg <= 258.75):
      return 'WSW';
    case (deg > 258.75 && deg <= 281.25):
      return 'W';
    case (deg > 281.25 && deg <= 303.75):
      return 'WNW';
    case (deg > 303.75 && deg <= 326.25):
      return 'NW';
    case (deg > 326.25 && deg <= 348.75):
      return 'NNW';
    case (deg > 348.75 && deg <= 360):
      return 'N';
    default:
      return 'E';
  }
};