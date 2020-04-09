import { isEmpty } from 'lodash';
import { Component, NgZone, Input, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { AmchartService } from '@app/services';
import { CasesTotalModel, CountryModel } from '@app/models';
import { ChartBase } from '../chart-base';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-cases-map-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesMapChartComponent extends ChartBase implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public chartData: ChartDataModel[] = [];

    @Input()
    public customClass: string;

    private currentType = 'confirmed';
    private polygonSeries: am4maps.MapPolygonSeries;
    private buttons;
    private colorCodes = {
        confirmed: this.amchartService.config.CASES_CONFIRMED_COLOR,
        deaths: this.amchartService.config.CASES_DEATHS_COLOR,
        recovered: this.amchartService.config.CASES_RECOVERED_COLOR
    }
    private colors = {
        confirmed: am4core.color(this.colorCodes.confirmed),
        deaths: am4core.color(this.colorCodes.deaths),
        recovered: am4core.color(this.colorCodes.recovered)
    };

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService
    ) {
        super(_ngZone);
    }

    /**
     *
     */
    public createChart(): void {
        this.updateChartData();
        let chart = this.container.createChild(am4maps.MapChart);
        chart.geodata = am4geodata_worldLow;
        // Set projection
        chart.projection = new am4maps.projections.Miller();
        chart.zoomControl = new am4maps.ZoomControl();
        chart.chartContainer.wheelable = false;
        chart.seriesContainer.events.disableType('doublehit');
        chart.chartContainer.background.events.disableType('doublehit');

        // Create map polygon series
        let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.dataFields.id = 'id';
        polygonSeries.dataFields.value = 'confirmed';
        polygonSeries.interpolationDuration = 0;
        polygonSeries.nonScalingStroke = true;
        polygonSeries.strokeWidth = 0.5;
        polygonSeries.calculateVisualCenter = true;

        // Exclude Antartica
        polygonSeries.exclude = ['AQ'];

        // Make map load polygon (like country names) data from GeoJSON
        polygonSeries.useGeodata = true;
        polygonSeries.data = this.chartData;

        // Configure series
        let polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = '{name}: {confirmed}';
        polygonTemplate.fill = am4core.color(this.amchartService.config.MAP_COUNTRY_COLOR);
        polygonTemplate.fillOpacity = 0.8;
        polygonTemplate.tooltipPosition = 'fixed';
        polygonTemplate.strokeOpacity = 0.15;
        polygonTemplate.setStateOnChildren = true;

        //Set min/max fill color for each area
        polygonSeries.heatRules.push({
            property: 'fill',
            target: polygonTemplate,
            min: this.colors[this.currentType].brighten(1),
            max: this.colors[this.currentType].brighten(-0.3)
        });

        // buttons container (active/confirmed/recovered/deaths)
        let buttonsContainer = this.container.createChild(am4core.Container);
        buttonsContainer.layout = 'grid';
        buttonsContainer.width = am4core.percent(100);
        buttonsContainer.x = 0;
        buttonsContainer.contentAlign = 'right';

        this.buttons = {
            confirmed: this.createButton('confirmed', this.colorCodes.confirmed, buttonsContainer),
            deaths: this.createButton('deaths', this.colorCodes.deaths, buttonsContainer),
            recovered: this.createButton('recovered', this.colorCodes.recovered, buttonsContainer)
        };
        this.buttons[this.currentType].isActive = true;

        this.polygonSeries = polygonSeries;
        this.chart = chart;
    }

    /**
     *
     */
    private createButton(name: string, color: string, container: am4core.Container): am4core.Button {
        let button = container.createChild(am4core.Button);
        button.label.text = name;
        button.label.valign = 'middle'
        button.label.fill = am4core.color('#000000');
        button.label.fontSize = '11px';
        button.background.cornerRadius(30, 30, 30, 30);
        button.background.strokeOpacity = 0.3
        button.background.fillOpacity = 0;
        button.background.stroke = am4core.color('#000000');
        button.background.padding(2, 3, 2, 3);
        button.states.create('active');
        button.setStateOnChildren = true;
        button.dummyData = name;

        let circle = new am4core.Circle();
        circle.radius = 8;
        circle.fillOpacity = 0.3;
        circle.fill = am4core.color('#000000');
        circle.strokeOpacity = 0;
        circle.valign = 'middle';
        circle.marginRight = 5;
        button.icon = circle;

        let circleActiveState = circle.states.create('active');
        circleActiveState.properties.fill = am4core.color(color);
        circleActiveState.properties.fillOpacity = 0.5;

        let activeHoverState = button.background.states.create('hoverActive');
        activeHoverState.properties.fillOpacity = 0;

        button.events.on('hit', (event) => {
            this.handleButtonClick(event);
        });

        return button;
    }

    /**
     *
     */
    private handleButtonClick(event): void {
        this.currentType = event.target.dummyData;
        let currentType = this.currentType

        // make button active
        let activeButton = this.buttons[currentType];
        activeButton.isActive = true;

        // make other buttons inactive
        for (var key in this.buttons) {
            if (this.buttons[key] != activeButton) {
                this.buttons[key].isActive = false;
            }
        }

        this.polygonSeries.dataItems.each((dataItem) => {
            let newValue = dataItem.dataContext[currentType];
            if (!newValue) {
                newValue = null;
            }

            dataItem.setValue('value', newValue);
            dataItem.mapPolygon.defaultState.properties.fill = undefined;
        });

        this.polygonSeries.heatRules.getIndex(0).min = this.colors[currentType].brighten(1);
        this.polygonSeries.heatRules.getIndex(0).max = this.colors[currentType].brighten(-0.3);
    }

    /**
     *
     */
    public updateChartData(): void {
        if (!this.chartData || isEmpty(this.chartData)) {
            return;
        }

        for (let item of this.chartData) {
            item.id = item.country.code;
            item.title = item.country.name;
            item.confirmed = item.cases.confirmed;
            item.deaths = item.cases.deaths;
            item.recovered = item.cases.recovered || 1;
        }
    }
}

export class ChartDataModel {
    id: string;
    title: string;
    confirmed: number;
    deaths: number;
    recovered: number;
    country: CountryModel;
    cases: CasesTotalModel;
}
