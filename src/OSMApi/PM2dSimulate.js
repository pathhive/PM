
import Feature from 'ol/Feature.js';
import {LineString, Point, Polygon, MultiPoint} from 'ol/geom.js';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style} from 'ol/style.js';

import smooth from 'chaikin-smooth';

var _mapObj;

//animation
var _vectorContext;
var _frameState;
var _animating = false;
var _speed, _now;
var _geoMarker;
var _smoothRouteCoords;
//

var makeSmooth = function (path, numIterations) {
 numIterations = Math.min(Math.max(numIterations, 1), 10);
 while (numIterations > 0) {
   path = smooth(path);
   numIterations--;
 }
 return path;
}

var moveFeature = function(event) {
 var vectorContext = event.vectorContext;
 var frameState = event.frameState;

 var styles = {
      'route': new Style({
        stroke: new Stroke({
          width: 6, color: [237, 212, 0, 0.8]
        })
      }),
      'icon': new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'data/icon.png'
          //src: 'https://www.pathhive.com/images/drone_icon.png'
        })
      }),
      'geoMarker': new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({color: 'black'}),
          stroke: new Stroke({
            color: 'white', width: 2
          })
        })
      })
    };

 if (_animating) {
   var elapsedTime = frameState.time - _now;
   // here the trick to increase speed is to jump some indexes
   // on lineString coordinates
   var index = Math.round(_speed * elapsedTime / 1000);

   if (index >= _smoothRouteCoords.length) {
     stopAnimation(true);
     return;
   }

   var currentPoint = new Point(_smoothRouteCoords[index]);
   var feature = new Feature(currentPoint);

   vectorContext.drawFeature(feature, styles.geoMarker);  //correct sytle
 }
 // tell OpenLayers to continue the postcompose animation
 _mapObj.render();
};

var startAnimation = function(mapObj, coord) {

  _mapObj = mapObj;

  var SMOOTH_VAL = 10;
  _smoothRouteCoords = makeSmooth(coord, parseInt(SMOOTH_VAL, 10) || 5);


  _geoMarker = new Feature({
     type: 'geoMarker',
     geometry: new Point(_smoothRouteCoords[0])
   });

 if (_animating) {
   stopAnimation(false);
 } else {
   _animating = true;
   _now = new Date().getTime();
   _speed = 1000;

   // hide geoMarker
   _geoMarker.setStyle(null);

   // just in case you pan somewhere else
   //var center = [-5639523.95, -3501274.52];
   //_mapObj.getView().setCenter(center);
   _mapObj.on('postcompose', moveFeature);
   _mapObj.render();
 }
};


/**
* @param {boolean} ended end of animation.
*/
var stopAnimation = function(ended) {
 _animating = false;

 // if animation cancelled set the marker at the beginning
 var coord = ended ? _smoothRouteCoords[_smoothRouteCoords.length - 1] : _smoothRouteCoords[0];
 /** @type {module:ol/geom/Point~Point} */ (_geoMarker.getGeometry())
   .setCoordinates(coord);
 //remove listener
 _mapObj.un('postcompose', moveFeature);
};

export { makeSmooth, startAnimation };
