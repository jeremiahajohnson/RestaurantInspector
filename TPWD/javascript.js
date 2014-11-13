require([
    "dojo/dom", "dojo/on", "dojo/query", "dojo/request", "dojo/keys",
    "dojo/_base/array",
    "esri/map", "esri/config", "esri/urlUtils", "esri/InfoTemplate", "esri/tasks/GeometryService", "esri/toolbars/edit", "esri/graphic",
    "esri/tasks/query", "esri/tasks/QueryTask",
    "esri/Color", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/FeatureLayer", "esri/layers/GraphicsLayer",
    "dojo/domReady!"
], function (
    dom, on, dojoQuery, request, keys,
    arrayUtils,
    Map, esriConfig, urlUtils, InfoTemplate, GeometryService, Edit, Graphic,
    Query, QueryTask,
    Color, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
    UniqueValueRenderer,
    ArcGISDynamicMapServiceLayer, FeatureLayer, GraphicsLayer
    ) {

    var service = "http://services1.arcgis.com/1mtXwieMId59thmg/ArcGIS/rest/services/Inspection_Scores/FeatureServer/0";

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
                "color": [254, 108, 0, 255],
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

    var selectionLayer = new GraphicsLayer();
    map.addLayer(selectionLayer);
    var inspectPoints = new FeatureLayer(service, { outFields: ["*"] });
    map.addLayer(inspectPoints);
    on(inspectPoints, 'load', function () { inspectPoints.setRenderer(new UniqueValueRenderer(uvrJson)); makeTable();});
    on(inspectPoints, 'click', function (evt) { drawinfowindow(evt,evt.graphic.attributes); });
    on(dom.byId('closeInfo'), 'click', function () { $("#infoPanel").hide(); });
    on(dojoQuery(".basemapselect"), 'click', function () { map.setBasemap(this.id); });
    on(dojoQuery(".query"), 'click', function () { queryFeatures(this.id); });
    on(dom.byId('showTable'), 'click', function () { $("#attrTable").modal(); });
    on(dom.byId('showQueryTable'), 'click', function () { $("#selectTable").modal(); });
    on(dom.byId('showLegend'), 'click', function () { $("#legend").modal(); });

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
    
    function makeTable() {
        var queryTask = new QueryTask(service);
        var query = new Query();
        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = ["Restaurant_Name","Address","Grade","Score","Inspection_Date"];

        queryTask.execute(query, function (data) { writetable(data, 'attrBody', false); });

    }

    function queryFeatures(id) {
        var queryTask = new QueryTask(service);
        var query = new Query();
        query.where = "Grade='" + id + "'";
        query.returnGeometry = true;
        query.outFields = ["Restaurant_Name", "Address", "Grade", "Score", "Inspection_Date"];

        queryTask.execute(query, function (data) { writetable(data, 'selectBody', true) });
    }

    function writetable(data, domID, geo) {
        var html = '<table class="table table-condensed table-responsive"><tr>'
        for (var field in data.fields) {
            html += "<th>" + data.fields[field].alias + "</th>"
        }
        html += "</tr>"
        for (var attr in data.features) {
            if (data.features[attr].attributes.Grade === "A") {
                html += '<tr class="success">';
            }
            if (data.features[attr].attributes.Grade === "B") {
                html += '<tr class="info">';
            }
            if (data.features[attr].attributes.Grade === "C") {
                html += '<tr class="warning">';
            }
            if (data.features[attr].attributes.Grade === "D") {
                html += '<tr class="active">';
            }
            if (data.features[attr].attributes.Grade === "F") {
                html += '<tr class="danger">';
            }
            html += "<td>" + data.features[attr].attributes.Restaurant_Name + "</td><td>" + data.features[attr].attributes.Address + "</td><td>" + data.features[attr].attributes.Grade + "</td><td>" + data.features[attr].attributes.Score + "</td><td>" + new Date(parseInt(data.features[attr].attributes.Inspection_Date)).toDateString(); + "</td></tr>";
        }
        if (geo) {
            selectionLayer.clear();
            for (var i in data.features) {
                var geo = data.features[i].geometry;
                var graphic = new Graphic(geo, new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 18, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 255, 0.25])));
                selectionLayer.add(graphic);
            }
        }
        dom.byId(domID).innerHTML = html + "</table>";
    }

});