import { AfterViewInit, Component, NgZone, Input, OnChanges, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-cases-line-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesLineChartComponent implements AfterViewInit, OnDestroy, OnChanges {
    public chart: am4charts.XYChart = null;

    @Input()
    public chartData = null;

    constructor(
        private _ngZone: NgZone
    ) { }

    ngAfterViewInit() {
        this._ngZone.runOutsideAngular(() => {
            this.createLineChart();
        });
    }

    ngOnDestroy() {
        this._ngZone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

    ngOnChanges() {
        if (this.chart) {
            this.chart.data = this.chartData;
        }
    }

    /**
     *
     */
    private createLineChart(): void {
        let chart = am4core.create('chartdiv', am4charts.XYChart);
        chart.paddingRight = 20;
        chart.data = [];

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        let confirmed = chart.series.push(this.getSeries(chart, 'date', 'confirmed'));
        let deaths = chart.series.push(this.getSeries(chart, 'date', 'deaths'));
        let recovered = chart.series.push(this.getSeries(chart, 'date', 'recovered'));

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(confirmed);
        scrollbarX.series.push(deaths);
        scrollbarX.series.push(recovered);
        chart.scrollbarX = scrollbarX;
        chart.scrollbarX.parent = chart.bottomAxesContainer;

        this.chart = chart;
    }

    private getSeries(chart, valueX: string, valueY: string): am4charts.LineSeries {
        let series = new am4charts.LineSeries();
        series.dataFields.dateX = valueX;
        series.dataFields.valueY = valueY;
        series.strokeWidth = 2;
        series.minBulletDistance = 15;
        series.tooltipText = '{valueY}';
        chart.cursor = new am4charts.XYCursor();

        // Make bullets grow on hover
        let bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 4;
        bullet.circle.fill = am4core.color("#fff");

        let bullethover = bullet.states.create("hover");
        bullethover.properties.scale = 1.3;

        return series;
    }
}
