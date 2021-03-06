import { isEmpty } from 'lodash';
import { Component, Input } from '@angular/core';
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
export class CasesMapChartComponent extends ChartBase {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public chartData: ChartDataModel[] = [];

    @Input()
    public customClass: string;

    private currentType = 'confirmed';
    private polygonSeries: am4maps.MapPolygonSeries;
    private heatLegend: am4maps.HeatLegend;
    private buttons;
    private colorCodes = {
        confirmed: this.amchartService.config.CASES_CONFIRMED_COLOR,
        deaths: this.amchartService.config.CASES_DEATHS_COLOR,
        recovered: this.amchartService.config.CASES_RECOVERED_COLOR,
        confirmedPerCapita: this.amchartService.config.CASES_CONFIRMED_PER_CAPITA_COLOR,
        deathsPerCapita: this.amchartService.config.CASES_DEATHS_PER_CAPITA_COLOR
    };
    private colors = {
        confirmed: am4core.color(this.colorCodes.confirmed),
        deaths: am4core.color(this.colorCodes.deaths),
        recovered: am4core.color(this.colorCodes.recovered),
        confirmedPerCapita: am4core.color(this.colorCodes.confirmedPerCapita),
        deathsPerCapita: am4core.color(this.colorCodes.deathsPerCapita)
    };
    private heatMapConfig = {
        min: 1.5,
        max: -0.5
    };

    constructor(
        public readonly amchartService: AmchartService
    ) {
        super();
    }

    /**
     *
     */
    public updateChart(): void {
        if (this.chart && this._chartData && this._chartData.length) {
            this.chart.data = this._chartData;
            this.updateChartData()
            this.drawChart();
        }
    }

    /**
     *
     */
    public drawChart(): void {
        this.polygonSeries.data = this._chartData;
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
        polygonSeries.data = this._chartData;

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
            min: this.colors[this.currentType].brighten(this.heatMapConfig.min),
            max: this.colors[this.currentType].brighten(this.heatMapConfig.max)
        });

        // buttons container (active/confirmed/recovered/deaths)
        let buttonsContainer = this.container.createChild(am4core.Container);
        buttonsContainer.layout = 'grid';
        buttonsContainer.width = am4core.percent(100);
        buttonsContainer.x = 0;
        buttonsContainer.contentAlign = 'right';

        if (!this.buttons) {
            this.buttons = {
                confirmed: this.createButton('confirmed', 'Confirmed', this.colorCodes.confirmed, buttonsContainer),
                deaths: this.createButton('deaths', 'Deaths', this.colorCodes.deaths, buttonsContainer),
                recovered: this.createButton('recovered', 'Recovered', this.colorCodes.recovered, buttonsContainer),
                confirmedPerCapita: this.createButton('confirmedPerCapita', 'Confirmed per capita', this.colorCodes.confirmedPerCapita, buttonsContainer),
                deathsPerCapita: this.createButton('deathsPerCapita', 'Deaths per capita', this.colorCodes.deathsPerCapita, buttonsContainer)
            };
        }

        this.buttons[this.currentType].isActive = true;

        var heatLegend = chart.chartContainer.createChild(am4maps.HeatLegend);
        heatLegend.valign = 'bottom';
        heatLegend.align = 'left';
        heatLegend.width = am4core.percent(30);
        heatLegend.series = polygonSeries;
        heatLegend.orientation = 'horizontal';
        heatLegend.padding(20, 20, 20, 20);
        heatLegend.valueAxis.renderer.labels.template.fontSize = 10;
        heatLegend.valueAxis.renderer.minGridDistance = 40;
        heatLegend.markerCount = 10;

        this.heatLegend = heatLegend;
        this.polygonSeries = polygonSeries;
        this.chart = chart;
    }

    /**
     *
     */
    private createButton(name: string, translation: string, color: string, container: am4core.Container): am4core.Button {
        let button = container.createChild(am4core.Button);
        button.label.text = translation;
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
            dataItem.mapPolygon.tooltipText = '{name}: ' + newValue;
        });

        this.polygonSeries.heatRules.getIndex(0).min = this.colors[currentType].brighten(this.heatMapConfig.min);
        this.polygonSeries.heatRules.getIndex(0).max = this.colors[currentType].brighten(this.heatMapConfig.max);
        this.heatLegend.minColor = this.colors[currentType].brighten(this.heatMapConfig.min);
        this.heatLegend.maxColor = this.colors[currentType].brighten(this.heatMapConfig.max);
    }

    /**
     *
     */
    public updateChartData(): void {
        if (!this.chartData || isEmpty(this.chartData)) {
            return;
        }

        this._chartData = this.getChartDataCopy();

        for (let item of this._chartData) {
            item.id = item.country.code;
            item.title = item.country.name;
            item.confirmed = item.cases.confirmed;
            item.deaths = item.cases.deaths;
            item.recovered = item.cases.recovered || 1;

            item.confirmedPerCapita = 0.001;
            item.deathsPerCapita = 0.001;
            if (item.country.population) {
                if (item.confirmed) {
                    item.confirmedPerCapita = (item.confirmed / item.country.population * 1000000).toFixed(2);
                }
                if (item.deaths) {
                    item.deathsPerCapita = (item.deaths / item.country.population * 1000000).toFixed(2);
                }
            }
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
    confirmedPerCapita: number;
    deathsPerCapita: number;
}
