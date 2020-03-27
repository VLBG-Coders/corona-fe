import { AfterViewInit, Component, NgZone, Input, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-text-title',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesTextTileComponent extends ChartBase {
    public container: am4core.Container = null;

    @Input()
    public translationKey: string;

    @Input()
    public value: number;

    @Input()
    public chartData = null;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        super(_ngZone);
    }

    public createChart(): void {
        this.container = am4core.create(this.COMPONENT_ID, am4core.Container);
        this.container.layout = 'grid';
        this.container.fixedWidthGrid = false;
        this.container.width = am4core.percent(100);
        this.container.height = am4core.percent(100);
        this.createLineChart();
    }

    /**
     *
     */
    private createLineChart(): void {
        let chart = this.container.createChild(am4charts.XYChart);
        //chart.width = am4core.percent(45);
        //chart.height = 70;
        chart.padding(20, 5, 2, 5);

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.disabled = true;
        dateAxis.renderer.labels.template.disabled = true;
        dateAxis.startLocation = 0.5;
        dateAxis.endLocation = 0.7;
        dateAxis.cursorTooltipEnabled = false;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.renderer.grid.template.disabled = true;
        valueAxis.renderer.baseGrid.disabled = true;
        valueAxis.renderer.labels.template.disabled = true;
        valueAxis.cursorTooltipEnabled = false;

        let series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = 'date';
        series.dataFields.valueY = 'value';
        series.tensionX = 0.8;
        series.strokeWidth = 5;
        series.stroke = am4core.color('#eee');

        // render data points as bullets
        let bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.opacity = 0;
        bullet.circle.fill = am4core.color('#eee');
        bullet.circle.propertyFields.opacity = 'opacity';
        bullet.circle.radius = 3;

        chart.data = [{ 'date': new Date(2018, 0, 1, 8, 0, 0), 'value': 57 },
        { 'date': new Date(2018, 0, 1, 9, 0, 0), 'value': 27 },
        { 'date': new Date(2018, 0, 1, 10, 0, 0), 'value': 24 },
        { 'date': new Date(2018, 0, 1, 11, 0, 0), 'value': 59 },
        { 'date': new Date(2018, 0, 1, 12, 0, 0), 'value': 33 },
        { 'date': new Date(2018, 0, 1, 13, 0, 0), 'value': 46 },
        { 'date': new Date(2018, 0, 1, 14, 0, 0), 'value': 20 },
        { 'date': new Date(2018, 0, 1, 15, 0, 0), 'value': 42 },
        { 'date': new Date(2018, 0, 1, 16, 0, 0), 'value': 59, 'opacity': 1 }];

        this.chart = chart;
    }
}
