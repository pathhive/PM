import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import Graticule from 'ol/Graticule';

//for new path
import Feature from 'ol/Feature.js';
import {LineString, Point, Polygon, MultiPoint} from 'ol/geom.js';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style} from 'ol/style.js';
import {Vector as VectorLayer, Layer} from 'ol/layer.js';
import {OSM, Source, TileJSON, Vector as VectorSource} from 'ol/source.js';
//

//drag drop
import Draw from 'ol/interaction/Draw';
//
import Collection from 'ol/Collection';


import {defaults as defaultInteractions, Pointer as PointerInteraction, Select, Translate, Modify} from 'ol/interaction.js';

//import {Drag} from './PMDrag.js';
import Geocoder from 'ol-geocoder/dist/ol-geocoder.js';

import { createMeasureTooltip, displayPathLength } from './PMPathLength.js'

import {toLonLat} from 'ol/proj';
import {makeSmooth, startAnimation} from '../OSMApi/PM2dSimulate.js';

//SEARCH example
//https://jsfiddle.net/jonataswalker/70vsd0of/

const LINE_THICKNESS = 10;

const MODE_NONE = 0;
const MODE_START_MARKER_BEGIN = 1;
const MODE_START_MARKER_FIXED = 2;
const MODE_NEXT_MARKER_BEGIN = 3;

//Ol object
var _Obj;
var _mapObj;
var _vectorSource;
var _vectorLayer;
var _select;
var _translate;
var _lineFeature;
var _geocoder;
var _graticule;

//path drawing
var _Mode;
var _firstCenterPos;
var _startMarkerOldPos;
var _startMarker;
var _startMarkerMoved;
var _WayPoint;
var _lastMouseDownPos;
var _isShowingPopup;


//popup
var _startMarkerConfirmPopup;
var _continueConfirmPopup;
var _overlayStartMarkerPopup;
var _overlayContinuePopup;


export class PMMap {

  constructor(startMarkerConfirmPopup, continueConfirmPopup)
  {
    _startMarkerConfirmPopup = startMarkerConfirmPopup;
    _continueConfirmPopup = continueConfirmPopup;

    _lastMouseDownPos = null;
    _isShowingPopup = false;
    _Obj = this;

    this.makeMap();
  };

  instance() {
    return this.mapObj;
  }

  initVariables()
  {
    _Mode = MODE_NONE;
    _WayPoint = [];
  }

  makeMap() {
    console.log('makeMap');
    _Mode = MODE_NONE;
    _WayPoint = new Array();

    var raster = new TileLayer({
            source: new OSM()
          });

    /**
     * Create an overlay to anchor the popup to the map.
     */
    _overlayStartMarkerPopup = new Overlay({
      element: _startMarkerConfirmPopup,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    _overlayContinuePopup = new Overlay({
      element: _continueConfirmPopup,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });


    this.mapObj = new Map({

      //interactions: defaultInteractions().extend([new Drag()]),
      overlays: [_overlayStartMarkerPopup, _overlayContinuePopup],
      target: 'map-container',
      loadTilesWhileAnimating: true,
      layers: [raster],
        /*
        new TileLayer({
          source: new XYZSource({
            url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
          })
        })

      ],
        */
      view: new View({
        center: [14125902.090642434, 4506919.39992699],
        zoom: 16
      })
    });

    _mapObj = this.mapObj;



    createMeasureTooltip(_mapObj);

    // popup
    _geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Search for ...',
      limit: 5,
      debug: false,
      autoComplete: true,
      targetType: 'text-input',
      keepOpen: true
    });
    console.log("geocoder : " + _geocoder);
    _mapObj.addControl(_geocoder);


    //Listen when an address is chosen
    _geocoder.on('addresschosen', function(evt) {
      console.info(evt);
      window.setTimeout(function() {
        console.log(evt.coordinate + "," + evt.address.formatted);
      }, 3000);
    });


    _mapObj.on('pointermove', function(evt) {

        //console.log('pointermove');

        // When user was dragging map, then coordinates didn't change and there's
        // no need to continue
        if (evt.dragging) {
            return;
        }
        // You can access coordinates from evt.coordinate now
        //console.log('pointermove 2');

        //console.log('pointermove Mode : ' + _Mode);

        if(_Mode == MODE_START_MARKER_FIXED)
        {
          //line draw to mouse pos
          console.log('pointermove Mode : ' + _Mode);
          //var origin = _firstCenterPos;
          var origin = _startMarker.getGeometry().getCoordinates();
          var target = evt.coordinate;
          var coord = [origin, target];
          _lineFeature.getGeometry().setCoordinates(coord);

          displayPathLength(evt, _lineFeature);
        }
        else if(_Mode == MODE_NEXT_MARKER_BEGIN)
        {
          // add point to line
          if(_isShowingPopup == false) {
            _Obj.refreshWayLineShape(evt.coordinate);

            displayPathLength(evt, _lineFeature);
          }
        }
    });

    _mapObj.on('pointerdown', function (evt) {

      console.log('pointerdown');
      console.log(evt);

      //convert point to lon lat
      var lonlat = toLonLat(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      var lon = lonlat[0];
      var lat = lonlat[1];
      console.log(lon, lat);

      _lastMouseDownPos = evt.coordinate; //store moude down pos

      // get a feature at click position (with very small tolerance)
      _mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        // doStuff with your feature at click position
        console.log("pointerdown feature : " + feature);
        //feature.setStyle(null);
      });

      //get the closest feature
      //var closestFeature = _vectorSource.getClosestFeatureToCoordinate(evt.coordinate);
      if(_Mode == MODE_START_MARKER_FIXED || _Mode == MODE_NEXT_MARKER_BEGIN)
      {

        _Obj.showContinueConfirmPopup();

        var coordinate = evt.coordinate;
        //var hdms = toStringHDMS(toLonLat(coordinate));
        //content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
        _overlayContinuePopup.setPosition(coordinate);

        _Mode = MODE_NEXT_MARKER_BEGIN;
      }
    });

    _mapObj.on('pointerup', function(evt) {

      console.log('pointerup');
      console.log(evt);

      //var closestFeature = _vectorSource.getClosestFeatureToCoordinate(evt.coordinate);

      _mapObj.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        // doStuff with your feature at click position
        console.log("pointerup feature : " + feature);
        //feature.setStyle(null);

        if(_Mode == MODE_START_MARKER_BEGIN)
        {
          // check same posisition
          console.log("oldPos = " + _startMarkerOldPos);
          console.log("newPos = " + _startMarker.getGeometry().getCoordinates());
          /* not working
          if(_startMarkerOldPos == _startMarker.getGeometry().getCoordinates())
          {
            alert("same position");
            return;
          }
          */

          if(_startMarkerMoved == true) //check first move
          {
            _Obj.showStartMarkerConfirmPopup();

            var coordinate = evt.coordinate;
            //var hdms = toStringHDMS(toLonLat(coordinate));
            //content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
            _overlayStartMarkerPopup.setPosition(coordinate);

            _WayPoint = []; //clear
            _WayPoint.push(coordinate); //store start pos
            console.log("stored StartMarker Point : " + _lastMouseDownPos);
          }
          _startMarkerMoved = true;

        };

        //_mapObj.removeInteraction(_select);
        //_mapObj.removeInteraction(_translate);
      });
    });

    /**
     * Add a click handler to the map to render the popup.
     */
    _mapObj.on('singleclick', function(evt) {
      console.log('singleclick');

      //  return;
    });

    /**
     * Called after map object initialized.

    _mapObj.on('postcompose', function (event) {

    });
    */
  };


  refreshWayLineShape(coordinate){

    var arrPt = new Array();

    //arrPt = _WayPoint;
    console.log("Fixed _WayPoint count : " + _WayPoint.length);

    _WayPoint.forEach(function(element){
      console.log("Fixed _WayPoint element : " + element);
      arrPt.push(element);
    });


    console.log("Fixed _WayPoint : " + _WayPoint);
    console.log("Mouse Point : " + coordinate);

    arrPt.push(coordinate);
    console.log("arr Point : " + arrPt);

    _lineFeature.getGeometry().setCoordinates(arrPt);

  }

  showStartMarkerConfirmPopup() {
    _startMarkerConfirmPopup.style.display = "block";
    _isShowingPopup = true;
  };

  hideStartMarkerConfirmPopup() {
    _startMarkerConfirmPopup.style.display = "none";
    _isShowingPopup = false;
  };

  acceptStartMarkerConfirm(){
    console.log("acceptStartMarkerConfirm");

    _Mode = MODE_START_MARKER_FIXED;

    _Obj.hideStartMarkerConfirmPopup();

    //var lineSource = new VectorSource(_lineFeature);
    _vectorSource.addFeature(_lineFeature);   //show path line
  };

  cancelStartMarkerConfirm(){
    _Obj.hideStartMarkerConfirmPopup();
  };

  showContinueConfirmPopup() {
    _continueConfirmPopup.style.display = "block";
    _isShowingPopup = true;
  };

  hideContinueConfirmPopup() {
    _continueConfirmPopup.style.display = "none";
    _isShowingPopup = false;
  };

  continueConfirm(){
    console.log("continueConfirm");

    _WayPoint.push(_lastMouseDownPos);
    console.log("stored stopMarker Point : " + _lastMouseDownPos);

    _Mode = MODE_NEXT_MARKER_BEGIN;
    _Obj.refreshWayLineShape(_lastMouseDownPos);
    _Obj.addNewMarker(_lastMouseDownPos);

    _Obj.hideContinueConfirmPopup();


  };

  finishConfirm(){
    console.log("finishConfirm");

    _WayPoint.push(_lastMouseDownPos);
    console.log("stored FinishMarker Point : " + _lastMouseDownPos);
    _Obj.addNewMarker(_lastMouseDownPos);

    _Mode = MODE_NONE;
    _Obj.hideContinueConfirmPopup();

    _Obj.initVariables();

    //disable line drag
    this.mapObj.removeInteraction(_select);
    this.mapObj.removeInteraction(_translate);

    alert('The new path has been completed.');
  };

  addNewMarker(pos)
  {
    var marker = new Feature({
        //geometry: new Point(fromLonLat([12.5, 41.9])) //rome
        geometry: new Point(pos),
        name : "marker"
      });

    marker.setStyle(new Style({
          image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
            color: '#8959A8',
            crossOrigin: 'anonymous',
            src: 'http://openlayers.org/en/latest/examples/data/dot.png'
          }))
        }));

    _vectorSource.addFeature(marker);
  };


  onTest() {
    console.log('onTest');

    // Create the graticule component
    _graticule = new Graticule({
      // the style to use for the lines, optional.
      strokeStyle: new Stroke({
        color: 'rgba(255,120,0,0.9)',
        width: 2,
        lineDash: [0.5, 4]
      }),
      showLabels: true
    });

    console.log("graticule : " + _graticule);
    _graticule.setMap(_mapObj);
  };



  doSimulate() {
    if(_lineFeature == null)
    {
      alert('Create route first!');
      return;
    }

    var routeCoords = _lineFeature.getGeometry().getCoordinates();
    var routeLength = routeCoords.length;

    console.log('routeLength : ' + routeLength);
    console.log('routeCoords : ' + routeCoords);

    /////////// start animation

    startAnimation(_mapObj, routeCoords);
    ////////////////////
  }

  newPath() {
    console.log('newPath');

    var centerPos = _mapObj.getView().getCenter();
    console.log("center : " + _mapObj.getView().getCenter().slice());

    if(_Mode == MODE_START_MARKER_BEGIN){
      alert('Already creating a new path.');
      return;
    }

    var mapZoom = _mapObj.getView().getZoom();
    if(mapZoom < 16) {
      alert('More than 16 map zoom levels are required to create a new path. current = ' + mapZoom);
      return;
    }
    _Mode = MODE_START_MARKER_BEGIN;
    _startMarkerMoved = false;

    //image sample
    //https://raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png
    //http://openlayers.org/en/latest/examples/data/dot.png

    _startMarker = new Feature({
        //geometry: new Point(fromLonLat([12.5, 41.9])) //rome
        geometry: new Point(centerPos),
        name : "startMarker"
      });
    _startMarkerOldPos = centerPos;

    _startMarker.setStyle(new Style({
          image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
            color: '#8959A8',
            crossOrigin: 'anonymous',
            src: '../../images/dot.png'
            //src: 'http://openlayers.org/en/latest/examples/data/dot.png'
          }))
        }));

    // Drag and drop feature
    var dragInteraction = new Modify({
        features: new Collection([_startMarker]),
        style: null,
        pixelTolerance: 20
    });

    // Add the event to the drag and drop feature
    dragInteraction.on('modifyend',function(){
        console.log("drag end on startMarker.");
    }, _startMarker);

    _vectorSource = new VectorSource({
        features: [_startMarker]
      });

    _vectorLayer = new VectorLayer({
        source: _vectorSource
      });

    this.mapObj.addLayer(_vectorLayer);
    //mapObj.removeLayer(vectorLayer);


    //for startmarker drag
    _select = new Select();
    _translate = new Translate({
      features : _select.getFeatures()
    });

    this.mapObj.addInteraction(_select);
    this.mapObj.addInteraction(_translate);


    _firstCenterPos = centerPos;

    _lineFeature = new Feature(
            new LineString([centerPos, centerPos]));

    //arrow image
    //https://openlayers.org/en/latest/examples/data/arrow.png

    _lineFeature.setStyle(new Style({
      stroke: new Stroke({
                    width: LINE_THICKNESS,
                    color: [0, 255, 0, 1]
                  })
    }));

    //var lineSource = new VectorSource(_lineFeature);
    //_vectorSource.addFeature(_lineFeature);
  }

};
