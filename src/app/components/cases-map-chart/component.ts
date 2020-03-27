import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-map-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesMapChartComponent extends ChartBase {
    private _mapData = null;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        super(_ngZone);
    }

    public createChart(): void {
        let chart = am4core.create(this.COMPONENT_ID, am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        // Set projection
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series
        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

        // Exclude Antartica
        polygonSeries.exclude = ['AQ'];

        // Make map load polygon (like country names) data from GeoJSON
        polygonSeries.useGeodata = true;

        // Configure series
        let polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = '{name}';
        polygonTemplate.polygon.fillOpacity = 0.6;

        let mapData =[{
            "country": {
                "id": 1,
                "name": "Austria",
                "code": "AT"
            },
            "confirmed": 7196,
            "confirmedPrev": 2500,
            "deaths": 300,
            "deathsPrev": 180,
            "recovered": 400,
            "recoveredPrev": 300,
            "delta_confirmed": "2700",
            "delta_recovered": "2600"
        }, {
            "country": {
                "id": 2,
                "name": "Germany",
                "code": "DE"
            },
            "confirmed": 47278,
            "confirmedPrev": 2500,
            "deaths": 300,
            "deathsPrev": 180,
            "recovered": 400,
            "recoveredPrev": 300,
            "delta_confirmed": "2700",
            "delta_recovered": "2600"
        }, {
            "country": {
                "id": 3,
                "name": "Switzerland",
                "code": "CH"
            },
            "confirmed": 11811,
            "confirmedPrev": 2500,
            "deaths": 300,
            "deathsPrev": 180,
            "recovered": 400,
            "recoveredPrev": 300,
            "delta_confirmed": "2700",
            "delta_recovered": "2600"
        }, {
            "country": {
                "id": 4,
                "name": "Italy",
                "code": "IT"
            },
            "confirmed": 80589,
            "confirmedPrev": 2500,
            "deaths": 300,
            "deathsPrev": 180,
            "recovered": 400,
            "recoveredPrev": 300,
            "delta_confirmed": "2700",
            "delta_recovered": "2600"
        }];

        //this.restructureMapData(mapData);

        let imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = "confirmed";
        imageSeries.dummyData = "country";

        let imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true

        let circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = "color";
        circle.tooltipText = "{dummyData.name}: [bold]{value}[/]";

        imageSeries.heatRules.push({
            "target": circle,
            "property": "radius",
            "min": 3,
            "max": 20,
            "dataField": "value"
        })

        imageTemplate.adapter.add("latitude", function(latitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext['country']['code']);
            if(polygon){
                return polygon.visualLatitude;
            }
            return latitude;
        })

        imageTemplate.adapter.add("longitude", function(longitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext['country']['code']);
            if(polygon){
                return polygon.visualLongitude;
            }
            return longitude;
        })
    }
}
