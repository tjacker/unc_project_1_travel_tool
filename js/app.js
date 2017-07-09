/*jslint esversion: 6, browser: true*/
/*global window, console, $, jQuery, alert*/

const $searchFld = $('#search-fld');
const $clearBtn = $('#clear-btn');
const $locDetails = $('#location-details');
const $map = $('#map');

$searchFld.geocomplete({
  map: $map,
  details: $locDetails,
  detailsAttribute: 'data-geo'
});

$clearBtn.click(function () {
  $searchFld.val('');
});