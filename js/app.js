/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, moment, twttr, firebase, alert*/

// Variables to hold DOM elements
const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $wordCloud = $('#word-cloud');
const $map = $('#map');
const $weather = $('#weather');
const $food= $('#food');
const $event= $('#event');
const $twitter= $('#twitter');

// Variable to hold responsive accordion and tabs container
const ul = '<ul class="accordion" data-allow-all-closed="true" data-responsive-accordion-tabs="accordion large-tabs"></ul>';

// Variables to hold location data elements and value
const $geoLat = $('[data-geo="lat"]');
const $geoLng = $('[data-geo="lng"]');
const $geoLoc = $('[data-geo="locality"]');
const $geoSubLoc = $('[data-geo="sublocality"]');
let lat = '';
let lng = '';
let loc = '';

// More info icon location
const imgInfo = 'img/info.svg';

let searchDist = 50; // Search Distance in miles

// Track event categories returned by AJAX and store event HTML
let categoryCount = 0;
let NumCategories = 4;
// Define as an empty template literals. Defined as var to work with the window object
var concerts = ``;
var theater = ``;
var outdoors = ``;
var sports = ``;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBi2lJmlRe28qRD5BixY5rJgKdunSOKz44",
  authDomain: "coding-bootcamp-project-15d09.firebaseapp.com",
  databaseURL: "https://coding-bootcamp-project-15d09.firebaseio.com",
  projectId: "coding-bootcamp-project-15d09",
  storageBucket: "coding-bootcamp-project-15d09.appspot.com",
  messagingSenderId: "174217526226"
};
firebase.initializeApp(config);

// Database variable
const database = firebase.database();

database.ref().on("value", function(snapshot) {
  var searchTerm = snapshot.val();
});

var word_list = [];

// Pull data from Firebase
$.ajax({url: "https://coding-bootcamp-project-15d09.firebaseio.com/.json", method: "get"
  }).done(function(response) {
    var objRef = Object.keys(response);
    var counters = response;
    var newRef = objRef.map( key => Object.assign({key}, counters[key]) ).sort((a, b) => b.counter - a.counter );
    newRef.every( (counter, limit) => {
      var word = {};
      word.text = counter.location;
      word.weight = counter.counter;
      word_list.push(word);
      return limit < newRef.length;
    });
    // Displays the word cloud by calling this method on the word list array
    $wordCloud.jQCloud(word_list, {
      autoResize: true,
      delay: 10
    });
  });

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

  
  // Removes WordCloud
  $wordCloud.empty().hide();

  // If locality returns empty, use sub locality
  if ($geoLoc.text()) {
    loc = $geoLoc.text().trim(); 
  } else {
    loc = $geoSubLoc.text().trim();
  }
  // This zone pushes information to firebase
  /*---------------------------------------*/
  // Setting data in firebase
  
  var locCounter = 1;
  
  // Addition put into object
  var searchObj = {};
  searchObj.location = loc;
  searchObj.counter = locCounter;

  // Push additions to the database array
  // database.ref().push(searchObj)

  var locationRef = database.ref();
  locationRef.once("value", function(snapshot) {
    var dbObj = snapshot.val();
    if (snapshot.hasChild(loc)) {
      var currentLoc = dbObj[loc];
      searchObj.counter = currentLoc.counter + 1;
    }

   database.ref().child(loc).set(searchObj);

  });

  /*---------------------------------------*/
  
  
  // Call refresh function passing latitude and longitude values
  refreshData(lat, lng);
});

// Clear button click event to remove text from search input
$clearBtn.click(function () {
  $searchFld.val('').focus();
});

// Function to refresh location data based on new search term
let refreshData = function (lat, lng) {
  // Remove all children and bound events from containers
  $weather.children().remove();
  $food.children().remove();
  $event.children().remove();
  $twitter.children().remove();
  // Call functions to run AJAX requests
  weatherAjax();
  foodAjax();
  eventAjax();
  twitterAjax();
};

// Function to hold weather AJAX requests
let weatherAjax = function () {
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
    // Nested AJAX call for location's 7-day forecast
    $.ajax({
      url: urlForecast + param,
      method: 'GET'
    }).done(function (forecast) {
      // Call function to populate forecasted weather and append
      $weatherUl.append(forecastHtml(forecast));
      // Initialize foundation plugin on accordion
      $weatherUl.foundation();
    });
  });
};

// Function to hold food AJAX request
let foodAjax = function () {
  // Append ul and create variable to hold new element
  $food.append(ul);
  let $foodUl = $('#food ul');
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
      // Call function to populate best restaurants and append
      $foodUl.append(foodHtml(places));
      $foodUl.foundation();
    });
  });
};

// Function to hold event AJAX requests
let eventAjax = function () {
  // Append ul and create variable to hold new element
  $event.append(ul);
  let $eventUl = $('#event ul');
  // Store Evenful API key and URLs
  let searchTerm = '';
  let apiKey = 'sG6J5BXGggtDB32n';
  let url = 'https://api.eventful.com/json/events/search?';
  // Set location and search parameters for AJAX call
  let param = $.param({
    where: `${lat},${lng}`,
    within: searchDist,
    date: 'Future',
    app_key: apiKey
  });
  
  // Function to call AJAX request with search parameter and category
  let request = function (search, catgory, icon) {
    searchTerm = `&keywords=${search}&`;
    $.ajax({
      url: url + searchTerm + param,
      method: "GET",
      dataType: "jsonp",
      crossDomain: true,
      headers: {
      "Access-Control-Allow-Origin": "*"
      }
    }).done(function (data) {
      if(!data.events) {
        // Handle empty response
        categoryCount++;
        console.log(catgory, ": No events");
      } else if(data.error) {
        // Handle error
        console.log(catgory, ": Error");
      } else {
        // Track the number of eventful objects returned
        categoryCount++;
        // Call function to populate event variables
        eventHtml(data.events, catgory, icon);
      }
      // If category count equals total number of categories, append data
      if (categoryCount === NumCategories) {
        $eventUl.append(concerts, theater, outdoors, sports);
        // Assign is active class to first event section before binding foundation events
        $eventUl.children().first().addClass('is-active');
        $eventUl.foundation();
        // Reset category counter and variables
        categoryCount = 0;
        concerts = ``;
        theater = ``;
        outdoors = ``;
        sports = ``;
      }
    });
  };

  request('concerts', 'concerts', 'music');
  request('theatrical+performance', 'theater', 'ticket');
  request('outdoors', 'outdoors', 'social-forrst');
  request('sports', 'sports', 'social-dribbble');
};

// Function to hold Twitter AJAX request
let twitterAjax = function () {
  // Append ul and create variable to hold new element
  $twitter.append(ul);
  let $twitterUl = $('#twitter ul');
  // Variables for AJAX call
  var query = `%23${cleanString(loc)}`; // %23 hashtag code. Call function to remove spaces and punctuation from locality
  var radius = `${searchDist}mi`;
//  var geoCode = `&geocode=${lat},${lng},${radius}`;
  var tweets = 10;
  var count = `&count=${tweets}`;
  var resultType = `&result_type=mixed`;

  // Further AJAX settings
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://cors-anywhere.herokuapp.com/https://api.twitter.com/1.1/search/tweets.json?q=" + query + count + resultType,
  "method": "GET",
  "headers": {
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7GivakZg7iGMlt70hZFQhzorUE",
    "cache-control": "no-cache"
    }
  };
  
  $twitterUl.append(
    `<li class="accordion-item is-active" data-accordion-item>
      <a href="#" class="accordion-title">Recent Tweets</a>
      <div class="accordion-content" data-tab-content>
        <div id="tweets" class="flex-container">
        </div>
      </div>
    </li>`
  );

  // Ajax Call
  $.ajax(settings).done(function (response) {
    // For loop that will create the tweets according to the number of tweets returned from the API
    for (var i = 0; i < response.statuses.length; i++) {
      // Create tweet blocks dynamically. Each tweet is given an ID of "tweet-widget-i" where i is the number.
      twttr.widgets.createTweet(response.statuses[i].id_str, document.getElementById("tweets"), {
        cards: "hidden",
        linkColor: "#fb7064",
        conversation: "none"
      });
    }
    $twitterUl.foundation();
  });
};

// Function to create and return the HTML for current weather information
let weatherHtml = function (data) {
  let desc = capitalize(data.weather[0].description);
  let dir = cardinalDir(data.wind.deg);
  let wind = Math.round(data.wind.speed);
  let temp = Math.round(data.main.temp);
  let html =
    `<li class="accordion-item is-active" data-accordion-item>
      <a href="#" class="accordion-title">Current Weather</a>
      <div class="accordion-content" data-tab-content>
        <div class="more-info"><a  href="https://openweathermap.org/city/${data.id}" target="_blank"><img src="${imgInfo}" alt=""></a></div>
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
          <div class="humid show-for-large">
            <p>Humidity</p>
            <p>${data.main.humidity}%</p>
          </div>
          <div class="temp">
            <p>${temp}&deg;</p>
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
      show = 'show-for-medium';
    } else if (i === 6) {
      show = 'show-for-large';
    }
    days +=
      `<div class="${show} forecast flex-container">
        <p><strong>${date}</strong></p>
        <i class="owf owf owf-${icon}"></i>
        <p><strong>${high}&deg;</strong> ${low}&deg;</p>
      </div>`;
  });
  let html =
    `<li class="accordion-item" data-accordion-item>
      <a href="#" class="accordion-title">Daily Forecast</a>
      <div class="accordion-content" data-tab-content>
        <div class="more-info"><a  href="https://openweathermap.org/city/${id}" target="_blank"><img src="${imgInfo}" alt=""></a></div>
        <div class="flex-container">
         ${days}
        </div>
      </div>
    </li>`;
  return html;
};

// Function to create and return the HTML for best rated restaurants
let foodHtml = function (data) {
  let places = ``; // Define as an empty template literal
  let img = '';
  // Build restaurant detail section
  $.each(data.best_rated_restaurant, function(i, place) {
    // If image field is blank than select random stock image
    if (place.restaurant.featured_image) {
      img = place.restaurant.featured_image;
    } else {
      let randomImg = randomNumber(50);
      img = `img/stock/${randomImg}-rest.jpg`;
    }
    let name = place.restaurant.name;
    let loc = place.restaurant.location.locality;
    let type = place.restaurant.cuisines;
    let url = place.restaurant.url;
    let rating = place.restaurant.user_rating.aggregate_rating;
    let ratingColor = place.restaurant.user_rating.rating_color;
    let votes = place.restaurant.user_rating.votes;
    places +=
      `<div class="food-container">
        <div class="flex-container">
          <div class="img-container">
            <img src="${img}" alt="">
            <p class="rest-type">${type}</p>
          </div>
          <div class="rating-container flex-container">
            <p class="rest-rating" style="background-color: #${ratingColor}"><strong>${rating} <span>&frasl; 5</span></strong></p>
            <p class="rest-votes">${votes} votes</p>
          </div>
        </div>
        <div class="name-container flex-container">
          <div>
            <p class="rest-name"><strong>${name}</strong></p>
            <p class="rest-location">${loc}</p>
          </div>
          <div>
            <p class="more-info"><a href="${url}" target="_blank"><img src="${imgInfo}" alt=""></a></p>
          </div>
        </div>
      </div>`;
  });
  let html =
    `<li class="accordion-item is-active" data-accordion-item>
      <a href="#" class="accordion-title">Best Restaurants</a>
      <div class="accordion-content" data-tab-content>
        <div class="flex-container">
         ${places}
        </div>
      </div>
    </li>`;
  return html;
};

// Function to create and return the HTML for local events
let eventHtml = function (data, category, icon) {
  let events = ``; // Define as an empty template literal
  let capCategory;
  let shortTitle;
  let len = 65; // Maximum length of string
  let dateTime;
  // Build event detail sections
  $.each(data.event, function(i, e) {
    // Call function to capitalize category for section title
    capCategory = capitalize(category);
    // If title is too long, call function to truncate it
    if (e.title.length > len) {
      shortTitle = truncate(e.title, len) + '...';
    } else {
      shortTitle = e.title;
    }
    // Convert date and time using moment JS. Ignore time of midnight if present (all-day event)
    if (e.start_time.search('00:00:00') !== -1) {
      dateTime = moment(e.start_time).format('MMMM Do');
    } else {
      dateTime = moment(e.start_time).format('MMMM Do [at] h:mm a');
    }
    
    events +=
      `<div class="event-container flex-container">
        <p class="event-title"><i class="fi-${icon}"></i><strong>${shortTitle}</strong></p>
        <p class="event-place">${e.city_name}, <span>${e.region_abbr}</span></p>
        <p>${e.venue_name}</p>
        <div class="date-container flex-container"
          <p>${dateTime}</p>
          <p class="more-info"><a href="${e.url}" target="_blank"><img src="img/info.svg" alt=""></a></p>
        </div>
      </div>`;
  });
  
  window[category] =
    `<li class="accordion-item" data-accordion-item>
      <a href="#" class="accordion-title">${capCategory}</a>
      <div class="accordion-content" data-tab-content>
        <div class="flex-container">
         ${events}
        </div>
      </div>
    </li>`;
  return window[category];
};

// Function to convert wind direction from degrees to cardinal direction
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

// Function to convert date to 3 character day
let formatDay = function (time) {
  return moment.unix(time).format('ddd');
};

// Function to capitalize first letter of a string
let capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Function to remove punctuation and space from a string
let cleanString = function (string) {
  return string.replace(/[^A-Za-z0-9_]/g,"");
};

// Function to truncate long strings
let truncate = function (string, chars) {
  return string.slice(0, (chars - 1));
};

// Function to return a random number
let randomNumber = function (number) {
  return Math.floor(Math.random() * number) + 1;
};

