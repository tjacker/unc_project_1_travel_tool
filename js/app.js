/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $map = $('#map');

const $geoLat = $('[data-geo="lat"]');
const $geoLng = $('[data-geo="lng"]');

$searchFld.geocomplete({
  map: $map,
  details: $locDetails,
  detailsAttribute: 'data-geo'
}).bind('geocode:result', function (event) {
  refreshData();
});

$clearBtn.click(function () {
  $searchFld.val('');
});

let refreshData = function () {
  let apiKey = '2a6299aeb6ba1831330eb81d8e215b1d';
  let latitude = $geoLat.text();
  console.log(latitude);
  let longitude = $geoLng.text();
  let url = 'https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/weather?';
  url += $.param({
    lat: latitude,
    lon: longitude,
    units: 'imperial',
    APPID: apiKey
  });
  console.log(url);
  $.ajax({
    url: url,
    method: 'GET'
  }).done(function (weather) {
    console.log(weather);
  });
};
