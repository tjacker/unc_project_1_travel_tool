$(document).foundation();

// Create a Twitter content Div where everything will go
var twitDiv = $("<div id='twitter-display'>")
twitDiv.appendTo($("#twitter-container"))

// Button click funciton
$(".button").on("click", function(e) {
  // The code directly below should empty out the Div each time Submit is clicked
  twitDiv.html(' ')
  
  // Variables for AJAX call
  var query = "%23" + $("input").val().trim()
  var limit = "&count="
  var limitNum = 6
  // Black magic that will save this api. Hardcoded into the url belowm but saved as a variable in case needed elsewhere.
  var corsAnywhere = "https://cors.now.sh/" 

  // Further AJAX settings
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://cors.now.sh/https://api.twitter.com/1.1/search/tweets.json?q=" + "%23" + query + limit + limitNum,
  "method": "GET",
  "headers": {
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7GivakZg7iGMlt70hZFQhzorUE",
    "cache-control": "no-cache",
    //"postman-token": "729f86df-93ae-901e-e6c0-2ce5be0bb3c4" // Commented out to test if needed, appears to not be.
    }
  }
  // Ajax Call
  $.ajax(settings).done(function (response) {
    console.log(response);    
    // For loop that will create the tweets according to the number of tweets returned from the API
    for (var i = 0; i < response.statuses.length; i++) {
      // Create tweet blocks dynamically. Each tweet is given an ID of "tweet-widget-i" where i is the number.
      twttr.widgets.createTweet(response.statuses[i].id_str, document.getElementById("twitter-display"), {
        cards: "hidden"
      });
      
    }
    
  });
}) 



