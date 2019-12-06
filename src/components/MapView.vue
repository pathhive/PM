<template>
  <div id="root">
    <div id="map-container" >
    </div>

    <div id="popupStartMarker" class="ol-popup">
      <a href="#" id="popupAcceptBtn">Accept</a>
      <a href="#" id="popupCancelBtn">Cancel</a>
    </div>

    <div id="popupContinue" class="ol-popup">
      <a href="#" id="popupContinueBtn">Continue</a>
      <a href="#" id="popupFinishBtn">Finish</a>
    </div>

  </div>
</template>


<script>

  import {PMMap} from '../OSMApi/PMMap.js';
  import {goToCurrentPos} from '../OSMApi/PMUtil.js';
  var pmMap;

  export default {
    created: function() {

      this.$EventBus.$on('onAddNewPath', () => {
        this.onNewPath();
      });

      this.$EventBus.$on('onTest', () => {
        this.onTest();
      });

      this.$EventBus.$on('onCurrentPos', () => {
        this.onGoToCurrentPos();
      });

      this.$EventBus.$on('onSimulate', () => {
        this.onSimulate();
      });
    },

    mounted() {


      /**
       * Elements that make up the popup.
       */
      var popupStartMarker = document.getElementById('popupStartMarker');
      var acceptBtn = document.getElementById('popupAcceptBtn');
      var cancelBtn = document.getElementById('popupCancelBtn');

      var popupContinue = document.getElementById('popupContinue');

      pmMap = new PMMap(popupStartMarker, popupContinue);  //create Map obj
      var continueBtn = document.getElementById('popupContinueBtn');
      var finishBtn = document.getElementById('popupFinishBtn');

      /**
       * Add a click handler to the popup.
       * @return {boolean} Don't follow the href.
       */

      acceptBtn.onclick = function() {
        //overlay.setPosition(undefined);
        pmMap.acceptStartMarkerConfirm();
        acceptBtn.blur();
        return false;
      };

      cancelBtn.onclick = function() {
        //overlay.setPosition(undefined);
        pmMap.cancelStartMarkerConfirm();
        cancelBtn.blur();
        return false;
      };

      continueBtn.onclick = function() {
        //overlay.setPosition(undefined);
        pmMap.continueConfirm();
        continueBtn.blur();
        return false;
      };

      finishBtn.onclick = function() {
        //overlay.setPosition(undefined);
        pmMap.finishConfirm();
        finishBtn.blur();
        return false;
      };


    },

    methods : {
      onNewPath()
      {
        pmMap.newPath();
      },

      onTest()
      {
        pmMap.onTest();
      },

      onGoToCurrentPos()  //현재위치로 이동하기
      {
        goToCurrentPos(pmMap.instance());
      },

      onSimulate()
      {
        pmMap.doSimulate();
      }
    }
  }

</script>


<style>
      .ol-popup {
        position: absolute;
        background-color: white;
        -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 130px;
        display:none;
      }
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
      .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
      }
      .ol-popup-closer:after {
        content: "✖";
      }


      .tooltip {
        position: relative;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        color: white;
        padding: 4px 8px;
        opacity: 0.7;
        white-space: nowrap;
      }
      .tooltip-measure {
        opacity: 1;
        font-weight: bold;
      }
      .tooltip-static {
        background-color: #ffcc33;
        color: black;
        border: 1px solid white;
      }
      .tooltip-measure:before,
      .tooltip-static:before {
        border-top: 6px solid rgba(0, 0, 0, 0.5);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        content: "";
        position: absolute;
        bottom: -6px;
        margin-left: -7px;
        left: 50%;
      }
      .tooltip-static:before {
        border-top-color: #ffcc33;
      }
</style>
