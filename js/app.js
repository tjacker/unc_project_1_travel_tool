$(document).foundation();



$(".button").on("click", function(e) {
  $(".tweet-content").html('<img src="img/loading.gif" width="100px" height="100px" align="center"/>')
  
  
  // Twitter Bearer Token = "Bearer  
  //AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7G// ivakZg7iGMlt70hZFQhzorUE"
  var query = "%23" + $("input").val().trim()
  var limit = "&count=6"
  // Black magic that will save this api
  var corsAnywhere = "https://cors.now.sh/" 

  

 
  // Variables for AJAX call
  var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://cors.now.sh/https://api.twitter.com/1.1/search/tweets.json?q=" + "%23" + query + limit,
  "method": "GET",
  "headers": {
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7GivakZg7iGMlt70hZFQhzorUE",
    "cache-control": "no-cache",
    //"postman-token": "729f86df-93ae-901e-e6c0-2ce5be0bb3c4"
    }
  }
  // Ajax Call
  $.ajax(settings).done(function (response) {
    console.log(response);
    setTimeout(function() {
      $(".tweet-content").html(response.statuses[0].text)  
    }, 3000)
    
    
    
    

  });
}) 
 // Below here find old garbage that did not work but I don't want to delete yet ///////////////////////////////////////////////////

 /* // Ajax call
  $.ajax({
    url: queryURL,
    method: "GET",
    xhrFields: {
      withCredentials: true
    },
    json: true,
    dataType: "jsonp",
    crossDomain: true,
    headers: {
      "Host": "api.twitter.com",
      "consumer_key": "o1ZMYWBCZW2KAMcZwMxNMdIlN",
      "consumer_secret": "P4Djio9KSlk49TBk40xKkzYJSfSbI8yPutkoah0a5xe6BtYY7B",
      Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANm41QAAAAAAymaZJR9slBVrP0CVnuDkNU1O2Wo%3D3mjc2Z1ym6zMyCWTY7uDiDIn7GivakZg7iGMlt70hZFQhzorUE",
      //"Access-Control-Allow-Origin": "*",
    }
    
  })
  .done(function(response) {
    console.log(response)
  }) */

////////////////////////////////////////////////////    
