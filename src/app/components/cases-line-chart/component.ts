import { AfterViewInit, Component, NgZone, Input, OnChanges, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-line-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesLineChartComponent extends ChartBase implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        super(_ngZone);
    }

    /**
     *
     */
    public createChart(): void {
        let chart = am4core.create(this.COMPONENT_ID, am4charts.XYChart);
        chart.paddingRight = 20;
        chart.data = [];

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        let confirmed = chart.series.push(this.getSeries(chart, 'date', 'confirmed', '#d21a1a'));
        let deaths = chart.series.push(this.getSeries(chart, 'date', 'deaths', '#1c5fe5'));
        let recovered = chart.series.push(this.getSeries(chart, 'date', 'recovered', '#45d21a'));

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(confirmed);
        scrollbarX.series.push(deaths);
        scrollbarX.series.push(recovered);
        chart.scrollbarX = scrollbarX;
        chart.scrollbarX.parent = chart.bottomAxesContainer;

        this.chart = chart;
    }

    private getSeries(chart, valueX: string, valueY: string, color: string): am4charts.LineSeries {
        let series = new am4charts.LineSeries();
        series.dataFields.dateX = valueX;
        series.dataFields.valueY = valueY;
        series.strokeWidth = 2;
        series.minBulletDistance = 15;
        series.tooltipText = '{valueY}';
        series.stroke = am4core.color(color);
        chart.cursor = new am4charts.XYCursor();

        // Make bullets grow on hover
        let bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = am4core.color('#fff');

        let bullethover = bullet.states.create('hover');
        bullethover.properties.scale = 1.3;

        return series;
    }
}
