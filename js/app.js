$(document).foundation();


// Button click funciton
$(".button").on("click", function(e) {
  $(".tweet-content").html('<img src="img/loading.gif" width="100px" height="100px" align="center"/>')
  
  

  var query = "%23" + $("input").val().trim()
  var limit = "&count="
  var limitNum = 6
  // Black magic that will save this api. Hardcoded into the url belowm but saved as a variable in case needed elsewhere.
  var corsAnywhere = "https://cors.now.sh/" 

  

 
  // Variables for AJAX call
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
    // Create Div that will hold all tweets. It will be within the container
    var twitDiv = $("<div id='twitter-display'>")
    twitDiv.appendTo($("#twitter-container"))

    

    // For loop that will create the tweets according to the number of tweets returned from the API
    for (var i = 0; i < response.statuses.length; i++) {
      // Create tweet blocks dynamically. Each tweet is given an ID of "tweet-widget-i" where i is the number.
      twttr.widgets.createTweet(response.statuses[i].id_str, document.getElementById("twitter-display"));
      $(".EmbeddedTweet-tweet").attr("data-cards", "hidden")

      
      // This may be used later. Just commented out for now
      /* setTimeout(function() {
        $(".tweet").html(response.statuses[i].text)  
      }, 3000) */
    }
  });
}) 



