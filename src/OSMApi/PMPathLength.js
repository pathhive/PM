
//MEASURE
import Overlay from 'ol/Overlay.js';
import {unByKey} from 'ol/Observable.js';
import {getArea, getLength} from 'ol/sphere.js';


/**
  * The measure tooltip element.
  * @type {Element}
  */
 var _measureTooltipElement;

 /**
  * Overlay to show the measurement.
  * @type {module:ol/Overlay}
  */
 var _measureTooltip;

 /**
  * Creates a new measure tooltip
  */
 var createMeasureTooltip = function(map) {
   if (_measureTooltipElement) {
     _measureTooltipElement.parentNode.removeChild(_measureTooltipElement);
   }
   _measureTooltipElement = document.createElement('div');
   _measureTooltipElement.className = 'tooltip tooltip-measure';

   _measureTooltip = new Overlay({
     element: _measureTooltipElement,
     offset: [0, -60],
     positioning: 'top-center'
   });

   map.addOverlay(_measureTooltip);
 };



  var displayPathLength = function(evt, lineFeature)
  {
   //measure
   var tooltipCoord = evt.coordinate;
   var output = null;

   output = formatLength(lineFeature.getGeometry());
   //output = "1,234km"
   tooltipCoord = evt.coordinate;

   _measureTooltipElement.innerHTML = output;
   _measureTooltip.setPosition(tooltipCoord);
  }

/**
  * Format length output.
  * @param {module:ol/geom/LineString~LineString} line The line.
  * @return {string} The formatted length.
  */
var formatLength = function(line) {
   var length = getLength(line);
   var output;
   if (length > 100) {
     output = (Math.round(length / 1000 * 100) / 100) +
         ' ' + 'km';
   } else {
     output = (Math.round(length * 100) / 100) +
         ' ' + 'm';
   }

   console.log("way length : " + output);

   return output;
 };



 // export //
 export { createMeasureTooltip, displayPathLength };
