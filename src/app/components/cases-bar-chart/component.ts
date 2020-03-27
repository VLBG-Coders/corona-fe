import { AfterViewInit, Component, NgZone, Input, OnChanges, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-bar-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesBarChartComponent extends ChartBase implements OnChanges {
    @Input()
    public chartData = null;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        super(_ngZone);
    }

    ngOnChanges() {
        if (this.chart) {
            this.chart.data = this.chartData;
        }
    }

    /**
     *
     */
    public createChart(): void {
        let chart = am4core.create(this.COMPONENT_ID, am4charts.XYChart);
        chart.data = this.chartData;
        chart.dateFormatter.dateFormat = "yyyy-MM";


        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "date";

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

        // Create series
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "confirmed";
        series.dataFields.categoryX = "date";
        //series.name = "Visits";
        series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
        series.columns.template.fillOpacity = .8;

        let columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;

        this.chart = chart;
    }
}
