import { AfterViewInit, Component, NgZone, OnDestroy, Input } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as geoData from 'country-json/src/country-by-abbreviation.json';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-geo-map-country',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class GeoMapCountryComponent implements AfterViewInit, OnDestroy {
    @Input()
    public countryName: string;

    public chart = null;
    private readonly COUNTRY_COLOR = '#fff';
    private readonly COUNTRY_COLOR_SELECTED = '#eee';
    private readonly COUNTRY_COLOR_HOVERED = '#e3e3e3';
    private worldPolygonSeries = null;
    private countryPolygonTemplate = null;
    private worldData: any = geoData;

    constructor(
        private _ngZone: NgZone
    ) { }

    ngAfterViewInit() {
        this._ngZone.runOutsideAngular(() => {
            this.createMapChart();
        });
    }

    ngOnDestroy() {
        this._ngZone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

    private createMapChart(): void {
        console.log('WOW:', this.worldData.default);
        let chart = am4core.create('mapChart', am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series
        this.worldPolygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        this.worldPolygonSeries.useGeodata = true;

        // Exclude Antartica
        this.worldPolygonSeries.exclude = ['AQ'];

        // Configure countries
        this.countryPolygonTemplate = this.worldPolygonSeries.mapPolygons.template;
        this.countryPolygonTemplate.tooltipText = '{name}';
        this.countryPolygonTemplate.polygon.fillOpacity = 0.6;

        // Create hover state and set alternative fill color
        let hoverState = this.countryPolygonTemplate.states.create('hover');
        hoverState.properties.fill = this.getColor(this.COUNTRY_COLOR_HOVERED);

        this.chart = chart;

        this.addMapEvents();
    }

    private addMapEvents(): void {
        this.chart.events.on('ready', function(event) {
            this.zoomToCountry('AT');
        }.bind(this));

        this.countryPolygonTemplate.events.on('hit', function(event) {
            console.log(event.target.dataItem.dataContext);
            this.zoomToCountry(event.target.dataItem.dataContext.id);
        }.bind(this));
    }

    private zoomToCountry(countryId: string): void {
        //this.countryPolygonTemplate.polygon.fill = this.chart.colors.getIndex(3);
        console.log('----->', this.worldPolygonSeries);
        let country = this.worldPolygonSeries.getPolygonById(countryId);
        country.fill = this.getColor(this.COUNTRY_COLOR_SELECTED);

        this.chart.zoomToMapObject(country);
    }

    private getColor(colorString: string): any {
        return am4core.color(colorString);
    }
}
