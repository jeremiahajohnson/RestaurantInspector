require([
    "dojo/dom", "dojo/on", "dojo/query", "dojo/request", "dojo/keys",
    "dojo/_base/array",
    "esri/map", "esri/config", "esri/urlUtils", "esri/InfoTemplate", "esri/tasks/GeometryService", "esri/toolbars/edit", "esri/graphic","esri/tasks/query",
    "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer",
    "dojo/domReady!"
], function (
    dom, on, dojoQuery, request, keys,
    arrayUtils,
    Map, esriConfig, urlUtils, InfoTemplate, GeometryService, Edit, Graphic, Query,
    Color, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
    UniqueValueRenderer,
    ArcGISDynamicMapServiceLayer, FeatureLayer
    ) {

    //Init map
    map = new Map("mapDiv", {
        center: [-97.7534014, 30.3077609],
        zoom:12,
        basemap: "topo",
        logo: false,
        sliderStyle: 'large',
        sliderPosition: "bottom-right"
    });
    var uvrJson = {
        "type": "uniqueValue",
        "field1": "Grade",
        "defaultSymbol": {
            "color": [0, 0, 0, 64],
            "outline": {
                "color": [0, 0, 0, 255],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSNull"
            },
            "type": "esriSFS",
            "style": "esriSFSNull"
        },
        "uniqueValueInfos": [{
            "value": "A",
            "symbol": {
                "color": [0, 255, 0, 255],
                "size":8,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            }
        }, {
            "value": "B",
            "symbol": {
                "color": [0, 0, 255, 255],
                "size":8,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            }
        }, {
            "value": "C",
            "symbol": {
                "color": [255, 255, 0, 255],
                "size":8,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            }
        }, {
            "value": "D",
            "symbol": {
                "color": [255, 245, 238, 255],
                "size": 8,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            }
        }, {
            "value": "F",
            "symbol": {
                "color": [255, 0, 0, 255],
                "size": 8,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "outline": {
                    "color": [0, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            }
        }]
    }

    var inspectPoints = new FeatureLayer("http://services1.arcgis.com/1mtXwieMId59thmg/ArcGIS/rest/services/Inspection_Scores/FeatureServer/0", { outFields: ["*"] });
    map.addLayer(inspectPoints);
    on(inspectPoints, 'load', function () { inspectPoints.setRenderer(new UniqueValueRenderer(uvrJson)); });
    on(inspectPoints, 'click', function (evt) { drawinfowindow(evt,evt.graphic.attributes); });
    on(dom.byId('closeInfo'), 'click', function () { $("#infoPanel").hide(); });
    on(dojoQuery(".basemapselect"), 'click', function () { map.setBasemap(this.id); });

    function drawinfowindow(evt,attributes) {
        map.graphics.clear();
        var graphic = new Graphic(evt.graphic.geometry, new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 18, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 255]), 2), new Color([255, 255, 255, 0.25])));
        map.graphics.add(graphic);
        dom.byId('infoTitle').innerHTML = attributes.Restaurant_Name
        var table = '<table class="table table-striped table-condensed">';
        for (var attr in attributes) {
            if (attr === 'Inspection_Date') {
                var date = new Date(parseInt(attributes[attr]));
                table += '<tr><th>' + attr + '</th><td>' + date.toDateString() + '</td></tr>';
            }
            else {
                table += '<tr><th>' + attr + '</th><td>' + attributes[attr] + '</td></tr>';
            }            
        }
        table += '</table>'
        dom.byId('infoBody').innerHTML = table;
        $("#infoPanel").show();
    }
    
});