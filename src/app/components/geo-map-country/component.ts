import { Component, EventEmitter, NgZone, OnChanges, Input, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import * as geoData from 'country-json/src/country-by-abbreviation.json';
import { AmchartService } from '@app/services';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-geo-map-country',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class GeoMapCountryComponent extends ChartBase implements OnChanges {
    @Output()
    public onCountrySelected: EventEmitter<string> = new EventEmitter();

    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public countryCode: string;

    private _selectedCountry: any = null;
    private worldPolygonSeries;
    private countryPolygonTemplate;
    public chartData: any;

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService
    ) {
        super(_ngZone);
    }

    ngOnChanges() { }

    /**
     *
     */
    public createChart(): void {
        let chart = this.container.createChild(am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        chart.projection = new am4maps.projections.Miller();
        chart.data = [];

        // Create map polygon series
        let worldPolygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        worldPolygonSeries.useGeodata = true;
        worldPolygonSeries.fill = this.amchartService.getColor(
            this.amchartService.config.MAP_BACKGROUND_COLOR
        );

        // Exclude Antartica
        worldPolygonSeries.exclude = ['AQ'];

        // Configure countries
        let countryPolygonTemplate = worldPolygonSeries.mapPolygons.template;
        countryPolygonTemplate.applyOnClones = true;
        countryPolygonTemplate.togglable = true;
        countryPolygonTemplate.nonScalingStroke = true;
        countryPolygonTemplate.fill = this.amchartService.getColor(
            this.amchartService.config.MAP_COUNTRY_COLOR
        );
        countryPolygonTemplate.tooltipText = '{name}';

        // Create hover state and set alternative fill color
        let hoverState = countryPolygonTemplate.states.create('hover');
        hoverState.properties.fill = this.amchartService.getColor(
            this.amchartService.config.MAP_COUNTRY_COLOR_SELECTED
        );
        hoverState.properties.fillOpacity = 0.3;

        /* Create selected and hover states and set alternative fill color */
        let activeState = countryPolygonTemplate.states.create('active');
        activeState.properties.fill = this.amchartService.getColor(
            this.amchartService.config.MAP_COUNTRY_COLOR_SELECTED
        );
        activeState.properties.fillOpacity = 0.9;

        // Small map
        chart.smallMap = new am4maps.SmallMap();
        // Re-position to top right (it defaults to bottom left)
        chart.smallMap.align = 'right';
        chart.smallMap.valign = 'top';
        chart.smallMap.series.push(worldPolygonSeries);

        this.countryPolygonTemplate = countryPolygonTemplate;
        this.worldPolygonSeries = worldPolygonSeries;
        this.chart = chart;

        this.bindEvents();
    }
    /**
     *
     */
    private bindEvents(): void {
        this.chart.events.on('ready', (event) => {
            let country = this.worldPolygonSeries.getPolygonById(this.countryCode);
            this.updateSelectedCountry(country);
            this.zoomToCountry();
        });

        this.countryPolygonTemplate.events.on('hit', (event) => {
            this.updateSelectedCountry(event.target);
            this.zoomToCountry();
            this.onCountrySelected.emit(event.target.dataItem.dataContext.id)
        });
    }

    /**
     *
     */
    private zoomToCountry(): void {
        let country = this.worldPolygonSeries.getPolygonById(
            this._selectedCountry.dataItem.dataContext.id
        );
        this.chart.zoomToMapObject(country);
    }

    /**
     *
     */
    private updateSelectedCountry(mapPolygon: any): void {
        // Handle deselection.
        if (this._selectedCountry) {
            this._selectedCountry.isActive = false;
        }

        if (!this._selectedCountry) {
            this._selectedCountry = mapPolygon;
            this._selectedCountry.isActive = true;
        } else if (this._selectedCountry !== mapPolygon) {
            this._selectedCountry = mapPolygon;
        }
    }

    private emitSelectedCountry(): void {
        this.onCountrySelected.emit();
    }
}
