/**
 * MapsManager for Yandex Maps
 */

/**
 * YandexMapsManager namespace.
 * @constructor
 * @param {object} footprintCore
 * @param {object} settingsProvider
 */

var YandexMapsManager = function(footprintCore, settingsProvider) {
  this.footprintCore = footprintCore;
  this.settingsProvider = settingsProvider;
  this.subtree = true;
  this.update();
};

/**
 * Checks if the route is by driving.
 * @return {boolean}
 */

YandexMapsManager.prototype.isDriving = function() {
  return !!document.getElementsByClassName('route-list-view _travel-mode_auto')[0];
};

/**
 * Checks if the route is by transit.
 * @return {boolean}
 */

YandexMapsManager.prototype.isTransit = function() {
  return !!document.getElementsByClassName('route-list-view _travel-mode_masstransit')[0];
};

/**
 * Gets driving routes.
 * @return {string} routes
 */

YandexMapsManager.prototype.getAllDrivingRoutes = function() {
  var drivingRoutes = [];
  if (this.isDriving()) {
    var r = document.getElementsByClassName('route-view');
    for (var i = r.length - 1; i >= 0; i--) { // Filtering spurious routes.
      if (r[i].childNodes.length > 0) {
        drivingRoutes.push(r[i]);
      }
    }
  }
  return drivingRoutes;
};

/**
 * Gets transit routes.
 * @return {string} routes
 */

YandexMapsManager.prototype.getAllTransitRoutes = function() {
  var transitRoutes = [];
  if (this.isTransit()) {
    var r = document.getElementsByClassName('route-view');
    for (var i = r.length - 1; i >= 0; i--) { // Filtering spurious routes.
      if (r[i].childNodes.length > 0) {
        transitRoutes.push(r[i]);
      }
    }
  }
  return transitRoutes;
};

/**
 * Gets distance for a route.
 * @param {object} route
 * @return {string} distanceString
 */

YandexMapsManager.prototype.getDistanceString = function(route) {
  var distanceString = route
        .getElementsByClassName('driving-route-view__route-title-secondary')[0]
        .innerText;
  console.log('distanceString: ' + distanceString);
  return distanceString;
};

/**
 * Gets time for transit route.
 * @param {object} route
 * @return {string} timeString
 */

YandexMapsManager.prototype.getTimeString = function(route) {
  var timeString = route
        .getElementsByClassName('driving-route-view__route-title-primary')[0]
        .innerHTML;
  timeString = ' ' + timeString;
  console.log('timeString:' + timeString);
  return timeString;
};

/**
 * Converts Distance.
 * @param {string} distanceStr
 * @return {float} distanceFloat
 */

YandexMapsManager.prototype.convertDistance = function(distanceStr) {
  if (distanceStr) {
    var distanceAndUnit = distanceStr.split(/\s/);
    var distance = distanceAndUnit[0];
    var unit = distanceAndUnit[1];
    return this.footprintCore.getDistanceFromStrings(distance, unit);
  }
};

/**
 * Converts total time into hours.
 * @param {string} timeStr
 * @return {float} hrs
 */

YandexMapsManager.prototype.convertTime = function(timeStr) {
  if (timeStr) {
    var days = (/ (\w*) d/).exec(timeStr);
    var hrs = (/ (\w*) h/).exec(timeStr);
    var mins = (/ (\w*) m/).exec(timeStr);
    if (hrs) {
      hrs = parseFloat(hrs[1]);
    }
    else {
      hrs = 0;
    }
    if (mins) {
      mins = parseFloat(mins[1]);
      hrs += mins / 60;
    }
    if (days) {
      days = parseFloat(days[1]);
      hrs += days * 24;
    }
    console.log(hrs);
    return hrs;
  }
};

/**
 * Inserts element where footprints will be displayed if not present
 * @param {object} route
 * @param {element} e
 */

YandexMapsManager.prototype.insertFootprintElement = function(route, e) {
  if (route.getElementsByClassName('carbon').length === 0) {
    route.getElementsByClassName('driving-route-view')[0].appendChild(e);
  }
};

/**
 * Inserts element where travel cost will be displayed if not present
 * @param {object} route
 * @param {element} e
 */

YandexMapsManager.prototype.insertTravelCostElement = function(route, e) {
  if (route.getElementsByClassName('travelCost').length === 0) {
    route.getElementsByClassName('driving-route-view')[0].appendChild(e);
  }
};

/**
 * called by MutationObeserver to update footprints
 */

YandexMapsManager.prototype.update = function() {
  var drivingRoutes = this.getAllDrivingRoutes();
  var transitRoutes = this.getAllTransitRoutes();
  for (var i = 0; i < drivingRoutes.length; i++) {
    var distanceString = this.getDistanceString(drivingRoutes[i]);
    var distanceInKm = this.convertDistance(distanceString);
    this.insertFootprintElement(
      drivingRoutes[i],
      this.footprintCore.createFootprintElement(distanceInKm)
    );
    if (this.settingsProvider.showTravelCost()) {
      this.insertTravelCostElement(
        drivingRoutes[i],
        this.footprintCore.createTravelCostElement(distanceInKm)
      );
    }
  }
  for (i = 0; i < transitRoutes.length; i++) {
    var timeString = this.getTimeString(transitRoutes[i]);
    var timeInHrs = this.convertTime(timeString);
    this.insertFootprintElement(
      transitRoutes[i],
      this.footprintCore.createPTFootprintElement(timeInHrs)
    );
  }
};

var MapManager = YandexMapsManager;
