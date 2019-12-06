import {fromLonLat} from 'ol/proj';

var goToCurrentPos = function(mapObj) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);

    mapObj.getView().animate({center: coords, zoom: 16});
  });
};

export { goToCurrentPos };
