import { AfterViewInit, Component, EventEmitter, NgZone, OnDestroy, Input, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import * as geoData from 'country-json/src/country-by-abbreviation.json';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-geo-map-country',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class GeoMapCountryComponent extends ChartBase {
    @Output()
    public selectedCountry: EventEmitter<string> = new EventEmitter();

    @Input()
    public countryCode: string;

    @Input()
    public chartData: any;

    private readonly COUNTRY_COLOR = '#eee';
    private readonly COUNTRY_COLOR_SELECTED = '#fff';
    private readonly COUNTRY_COLOR_HOVERED = '#e3e3e3';

    private worldPolygonSeries = null;
    private countryPolygonTemplate = null;
    private worldData: any = geoData;
    private _selectedCountryCode: string = null;
    private _selectedCountry: any = null;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        super(_ngZone);
    }

    public createChart(): void {
        let chart = am4core.create(this.COMPONENT_ID, am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller();

        // Create map polygon series
        this.worldPolygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        this.worldPolygonSeries.useGeodata = true;

        // Exclude Antartica
        this.worldPolygonSeries.exclude = ['AQ'];

        // Configure countries
        this.countryPolygonTemplate = this.worldPolygonSeries.mapPolygons.template;
        this.countryPolygonTemplate.applyOnClones = true;
        this.countryPolygonTemplate.togglable = true;
        this.countryPolygonTemplate.nonScalingStroke = true;
        this.countryPolygonTemplate.fill = chart.colors.getIndex(0);

        this.countryPolygonTemplate.tooltipText = '{name}';
        this.countryPolygonTemplate.polygon.fillOpacity = 0.6;

        // Create hover state and set alternative fill color
        let hoverState = this.countryPolygonTemplate.states.create('hover');
        hoverState.properties.fill = this.getColor(this.COUNTRY_COLOR_HOVERED);

        /* Create selected and hover states and set alternative fill color */
        let activeState = this.countryPolygonTemplate.states.create('active');
        activeState.properties.fill = this.getColor(this.COUNTRY_COLOR_SELECTED);

        // Small map
        chart.smallMap = new am4maps.SmallMap();
        // Re-position to top right (it defaults to bottom left)
        chart.smallMap.align = "right";
        chart.smallMap.valign = "top";
        chart.smallMap.series.push(this.worldPolygonSeries);

        this.chart = chart;

        this.addMapEvents();
    }

    private addMapEvents(): void {
        this.chart.events.on('ready', function(event) {
            let country = this.worldPolygonSeries.getPolygonById(this.countryCode);
            this.updateSelectedCountry(country);
            this.zoomToCountry(this.countryCode);
        }.bind(this));

        this.countryPolygonTemplate.events.on('hit', function(event) {
            this.updateSelectedCountry(event.target);
            this.zoomToCountry();
            this.selectedCountry.emit(this._selectedCountry.dataItem.dataContext.id);
        }.bind(this));
    }

    private zoomToCountry(): void {
        let country = this.worldPolygonSeries.getPolygonById(
            this._selectedCountry.dataItem.dataContext.id
        );
        this.chart.zoomToMapObject(country);
    }

    private updateSelectedCountry(MapPolygon: any): void {
        if (this._selectedCountry) {
            // This line serves multiple purposes:
            // 1. Clicking a country twice actually de-activates, the line below
            //    de-activates it in advance, so the toggle then re-activates, making it
            //    appear as if it was never de-activated to begin with.
            // 2. Previously activated countries should be de-activated.
            this._selectedCountry.isActive = false;
        }

        if (!this._selectedCountry) {
            this._selectedCountry = MapPolygon;
            this._selectedCountry.isActive = true;
        } else if (this._selectedCountry !== MapPolygon) {
            this._selectedCountry = MapPolygon;
        }
    }

    private getColor(colorString: string): any {
        return am4core.color(colorString);
    }
}
