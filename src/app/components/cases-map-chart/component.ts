import { AfterViewInit, Component, NgZone, Input, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import { AmchartService } from '@app/services';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-map-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesMapChartComponent extends ChartBase {
    @Input()
    public isComponentLoading: boolean = false;

    private BUBBLE_COLOR = '#9A653A';
    private _mapData = null;

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService
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
        polygonTemplate.polygon.fill = this.amchartService.getColor(this.amchartService.config.MAP_COUNTRY_COLOR);

        let mapData = this.chartData;

        let imageSeries = chart.series.push(new am4maps.MapImageSeries());
        imageSeries.data = mapData;
        imageSeries.dataFields.value = 'confirmed';
        imageSeries.dummyData = 'country';

        let imageTemplate = imageSeries.mapImages.template;
        imageTemplate.nonScaling = true

        let circle = imageTemplate.createChild(am4core.Circle);
        circle.fillOpacity = 0.7;
        circle.propertyFields.fill = this.amchartService.getColor(this.BUBBLE_COLOR);
        circle.tooltipText = '{country.name}: [bold]{value}[/]';

        imageSeries.heatRules.push({
            'target': circle,
            'property': 'radius',
            'min': 3,
            'max': 20,
            'dataField': 'value'
        })

        imageTemplate.adapter.add('latitude', function(latitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext['country']['code']);
            if(polygon){
                return polygon.visualLatitude;
            }

            return latitude;
        })

        imageTemplate.adapter.add('longitude', function(longitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.dataContext['country']['code']);
            if(polygon){
                return polygon.visualLongitude;
            }

            return longitude;
        })

        this.chart = chart;
    }
}
