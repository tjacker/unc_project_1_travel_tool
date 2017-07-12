/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, moment, twttr, alert*/

// Variables to hold DOM elements
const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $map = $('#map');
const $weather = $('#weather');
const $food= $('#food');
const $twitter= $('#twitter');

// Variables to hold location data elements and value
const $geoLat = $('[data-geo="lat"]');
const $geoLng = $('[data-geo="lng"]');
const $geoLoc = $('[data-geo="locality"]');
let lat = '';
let lng = '';
let loc = '';

let searchDist = 50; // Search Distance in miles

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
  // Get stored latitude and longitude values
  lat = $geoLat.text();
  lng = $geoLng.text();
  loc = $geoLoc.text().trim();
  // Call refresh function passing latitude and longitude values
  refreshData(lat, lng);
});

// Clear button click event to remove text from search input
$clearBtn.click(function () {
  $searchFld.val('').focus();
});


// Function to refresh location data based on new search term
let refreshData = function (lat, lng) {
  // Remove all children and bound events from weather container
  $weather.children().remove();
  // Call function to run AJAX requests for weather
  weatherAjax(lat, lng);
  // Remove all children and bound events from food container
  $food.children().remove();
  // Call function to run AJAX requests for weather
  foodAjax(lat, lng);
  // Remove all children and bound events from twitter container
  $twitter.children().remove();
  // Call function to run AJAX requests for weather
  twitterAjax(loc);
};

// Function to hold weather AJAX requests
let weatherAjax = function () {
  // Variable to hold responsive accordion and tabs container
  let ul = '<ul class="accordion" data-allow-all-closed="true" data-responsive-accordion-tabs="accordion large-tabs"></ul>';
  // Append ul and create variable to hold new element
  $weather.append(ul);
  let $weatherUl = $('#weather ul');
  // Store OpenWeatherMap API key and URLs
  let apiKey = '2a6299aeb6ba1831330eb81d8e215b1d';
  let urlWeather = 'https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/weather?';
  let urlForecast = 'https://cors-anywhere.herokuapp.com/api.openweathermap.org/data/2.5/forecast/daily?';
  // Set weather parameters for AJAX calls
  let param = $.param({
    lat: lat,
    lon: lng,
    units: 'imperial',
    APPID: apiKey
  });
  // AJAX call for location's current weather
  $.ajax({
    url: urlWeather + param,
    method: 'GET'
  }).done(function (weather) {
    // Call function to populate current weather and append
    $weatherUl.append(weatherHtml(weather));
    console.log(weather);
    // Nested AJAX call for location's 7-day forecast
    $.ajax({
      url: urlForecast + param,
      method: 'GET'
    }).done(function (forecast) {
      // Call function to populate forecasted weather and append
      $weatherUl.append(forecastHtml(forecast));
      // Initialize foundation plugin on accordion
      $weatherUl.foundation();
      console.log(forecast);
    });
  });
};

// Function to hold food AJAX request
let foodAjax = function () {
  // Store Zomato API key and URLs
  let apiKey = '2a5e7c3416abfd7e68eb4e7d9cdac4b9';
  let urlLocate = 'https://developers.zomato.com/api/v2.1/locations?';
  let urlDetail = 'https://developers.zomato.com/api/v2.1/location_details?';
  // Set location parameters for AJAX call
  let locParam = $.param({
    query: loc,
    lat: lat,
    lon: lng
  });
  // AJAX call for location information
  $.ajax({
    method: 'POST',
    beforeSend: function(request) {
      request.setRequestHeader("user-key", apiKey);
    },
    url: urlLocate + locParam
  }).done(function (locate) {
    // Set Zomato location parameters for next AJAX call
    let locDetail = $.param({
      entity_id: locate.location_suggestions[0].entity_id,
      entity_type: locate.location_suggestions[0].entity_type
    });
    // Nested AJAX call for location's best rated restaurants
    $.ajax({
      method: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader("user-key", apiKey);
      },
      url: urlDetail + locDetail
    }).done(function (places) {
      console.log(places);
    });
  });
};

// Function to hold food AJAX request
let twitterAjax = function () {
  // Variables for AJAX call
  var query = `%23${cleanString(loc)}`; // %23 hashtag code. Call function to remove spaces and punctuation from locality
  var radius = `${searchDist}mi`;
  var geoCode = `&geocode=${lat},${lng},${radius}`;
  var tweets = 10;
  var count = `&count=${tweets}`;

  // Further AJAX settings
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/search/tweets.json?q=" + query + geoCode + count,
  "method": "GET",
  "headers": {
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7GivakZg7iGMlt70hZFQhzorUE",
    "cache-control": "no-cache"
    }
  };
  console.log(settings.url);
  // Ajax Call
  $.ajax(settings).done(function (response) {
    console.log(response);    
    // For loop that will create the tweets according to the number of tweets returned from the API
    for (var i = 0; i < response.statuses.length; i++) {
      // Create tweet blocks dynamically. Each tweet is given an ID of "tweet-widget-i" where i is the number.
      twttr.widgets.createTweet(response.statuses[i].id_str, document.getElementById("twitter"), {
        cards: "hidden"
      });
    }
  });
};

// Function to create and return the HTML for current weather information
let weatherHtml = function (data) {
  let id = data.id;
  let desc = capitalize(data.weather[0].description);
  let dir = cardinalDir(data.wind.deg);
  let wind = Math.round(data.wind.speed);
  let temp = Math.round(data.main.temp);
  let html =
    `<li class="accordion-item is-active" data-accordion-item>
      <a href="#" class="accordion-title">Current Weather</a>
      <div class="accordion-content" data-tab-content>
        <div class="more-info"><a  href="https://openweathermap.org/city/${id}" target="_blank">More Info</a></div>
        <div class="flex-container">
          <i class="owf owf owf-${data.weather[0].id}"></i>
          <div class="place">
            <p>${data.name}</p>
            <p>${desc}</p>
          </div>
          <div class="wind">
            <p>Wind ${dir}</p>
            <p>${wind} mph</p>
          </div>
          <div class="temp">
            <p>${temp}&deg;</p>
            <p>Hum. ${data.main.humidity}%</p>
          </div>
        </div>
      </div>
    </li>`;
  return html;
};

// Function to create and return the HTML for forecasted weather information
let forecastHtml = function (data) {
  let days = ``; // Define as an empty template literal
  let id = data.city.id;
  // Build daily forecast section
  $.each(data.list, function(i, day) {
    let date = formatDay(day.dt);
    let icon = day.weather[0].id;
    let high = Math.round(day.temp.max);
    let low = Math.round(day.temp.min);
    let show = '';
    // Classes to show forecast days 6 and 7 based on screen width
    if (i === 5) {
      show = 'show-for-medium ';
    } else if (i === 6) {
      show = 'show-for-large ';
    }
    days +=
      `<div class="${show}forecast flex-container">
        <p><strong>${date}</strong></p>
        <i class="owf owf owf-${icon}"></i>
        <p><strong>${high}&deg;</strong> ${low}&deg;</p>
      </div>`;
  });
  let html =
    `<li class="accordion-item" data-accordion-item>
      <a href="#" class="accordion-title">Daily Forecast</a>
      <div class="accordion-content" data-tab-content>
        <div class="more-info"><a  href="https://openweathermap.org/city/${id}" target="_blank">More Info</a></div>
        <div class="flex-container">
         ${days}
        </div>
      </div>
    </li>`;
  return html;
};

// Function to create and return the HTML for best rated restaurants
let restaurantsHtml = function (data) {
  let places = ``; // Define as an empty template literal
  // Build restaurant detail section
  $.each(places.best_rated_restaurant, function(i, place) {
    let img = place.restaurant.featured_image;
    let name = place.restaurant.name;
    let loc = place.restaurant.location.locality;
    let type = place.restaurant.cuisines;
    let rating = place.restaurant.user_rating.aggregate_rating;
    let votes = place.restaurant.user_rating.votes;
    
    
  });
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

let formatDay = function (time) {
  return moment.unix(time).format('ddd');
};


// Begin API call for Eventful to list events in local area


// function that runs ajax call for event database
function concert_events() {

  var queryURL = "http://api.eventful.com/json/events/search?...&keywords=" + "concert" + "&where=" + loc + "," + lng + "&within=" + searchDist + "&date=Future&app_key=sG6J5BXGggtDB32n";
  
  $.ajax({
    url: queryURL,
    method: "GET",
    dataType: "jsonp",
    crossDomain: true,
    headers: {
    "Access-Control-Allow-Origin": "*"
   }
  }).done(function(response) {
    console.log(response);

    // call only shows top ten events returned for each category
    for(var i = 0; i < 10; i++) {

    // constructing HTML containing event information
    var concertName = $("<ul>").text(response.events.event[i].title);
    var concertURL = $("<a>").attr("href", response.events.event[i].url).append(concertName);

     $("#events-concert").append(concertURL);

  }
  });
}

function theater_events() {

  var queryURL = "http://api.eventful.com/json/events/search?...&keywords=" + "theatrical+performance" + "&location=" + "San+Diego" + "&date=Future&app_key=sG6J5BXGggtDB32n";
  console.log(queryURL);
  $.ajax({
    url: queryURL,
    method: "GET",
    dataType: "jsonp",
    crossDomain: true,
    headers: {
    "Access-Control-Allow-Origin": "*"
   }
  }).done(function(response) {
    console.log(response);

    // call only shows top ten events returned for each category
    for(var i = 0; i < 10; i++) {

    // constructing HTML containing event information
    var eventName = $("<ul>").text(response.events.event[i].title);
    var eventURL = $("<a>").attr("href", response.events.event[i].url).append(eventName);

     $("#events-theater").append(eventURL);

  }
  });
}

function outdoor_events() {

  var queryURL = "http://api.eventful.com/json/events/search?...&keywords=" + "outdoors" + "&location=" + "San+Diego" + "&date=Future&app_key=sG6J5BXGggtDB32n";
  $.ajax({
    url: queryURL,
    method: "GET",
    dataType: "jsonp",
    crossDomain: true,
    headers: {
    "Access-Control-Allow-Origin": "*"
   }
  }).done(function(response) {
    console.log(response);

    // call only shows top ten events returned for each category
    for(var i = 0; i < 10; i++) {

    // constructing HTML containing event information
    var eventName = $("<ul>").text(response.events.event[i].title);
    var eventURL = $("<a>").attr("href", response.events.event[i].url).append(eventName);

     $("#events-outdoors").append(eventURL);

  }
  });
}

function show_events() {

  var queryURL = "http://api.eventful.com/json/events/search?...&keywords=" + "sports" + "&location=" + "San+Diego" + "&date=Future&app_key=sG6J5BXGggtDB32n";
  $.ajax({
    url: queryURL,
    method: "GET",
    dataType: "jsonp",
    crossDomain: true,
    headers: {
    "Access-Control-Allow-Origin": "*"
   }
  }).done(function(response) {
    console.log(response);

    // call only shows top ten events returned for each category
    for(var i = 0; i < 10; i++) {

    // constructing HTML containing event information
    var eventName = $("<ul>").text(response.events.event[i].title);
    var eventURL = $("<a>").attr("href", response.events.event[i].url).append(eventName);

     $("#events-sports").append(eventURL);

  }
  });
}

concert_events();
theater_events();
outdoor_events();
show_events();

let cleanString = function (string) {
  return string.replace(/[^A-Za-z0-9_]/g,"");
};


