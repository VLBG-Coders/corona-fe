import { orderBy } from 'lodash';
import { Component, NgZone, Input, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { AmchartService } from '@app/services';
import { CasesDailyModel } from '@app/models';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-bar-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesBarChartComponent extends ChartBase implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public chartData: CasesDailyModel[] = [];

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService,
    ) {
        super(_ngZone);
    }

    ngOnChanges() {
        if (this.chart) {
            this.updateChartData();
            this.chart.data = this.chartData;
            this.drawChart();
        }
    }

    /**
     *
     */
    public createChart(): void {
        this.updateChartData();
        let chart = this.container.createChild(am4charts.XYChart);
        chart.data = this.chartData;

        chart.legend = new am4charts.Legend()
        chart.legend.position = 'top'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95

        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = 'date';

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

        this.chart = chart;
        this.drawChart();
    }

    /**
     *
     */
    public updateChartData(): void {
        this.chartData = orderBy(this.chartData, ['date'], ['asc']);
    }

    /**
     *
     */
    private drawChart(): void {
        if (this.chart.series.length) {
            this.chart.series.removeIndex(0);
            this.chart.series.removeIndex(0);
        }
        // Create series
        let seriesConfirmed = this.chart.series.push(new am4charts.ColumnSeries());
        seriesConfirmed.clustered = false;
        seriesConfirmed.name = 'confirmed';
        seriesConfirmed.dataFields.valueY = 'confirmed';
        seriesConfirmed.dataFields.categoryX = 'date';
        seriesConfirmed.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]';
        seriesConfirmed.columns.template.fillOpacity = .8;
        seriesConfirmed.columns.template.fill = this.amchartService.getColor(
            this.amchartService.config.CASES_CONFIRMED_COLOR
        );
        seriesConfirmed.columns.template.stroke = this.amchartService.getColor(
            this.amchartService.config.CASES_CONFIRMED_COLOR
        );

        // Create series
        let seriesDeaths = this.chart.series.push(new am4charts.ColumnSeries());
        seriesDeaths.clustered = false;
        seriesDeaths.name = 'deaths';
        seriesDeaths.dataFields.valueY = 'deaths';
        seriesDeaths.dataFields.categoryX = 'date';
        seriesDeaths.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]';
        seriesDeaths.columns.template.fillOpacity = .8;
        seriesDeaths.columns.template.width = am4core.percent(50);
        seriesDeaths.columns.template.fill = this.amchartService.getColor(
            this.amchartService.config.CASES_DEATHS_COLOR
        );
        seriesDeaths.columns.template.stroke = this.amchartService.getColor(
            this.amchartService.config.CASES_DEATHS_COLOR
        );
    }
}
