/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

// Variables to hold DOM elements
const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $map = $('#map');

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
