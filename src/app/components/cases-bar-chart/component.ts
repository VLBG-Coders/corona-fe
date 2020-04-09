import { isEmpty, orderBy } from 'lodash';
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

    @Input()
    public customClass: string;

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService,
    ) {
        super(_ngZone);
    }

    ngOnChanges() {
        this.storeChartData();
        if (this.chart && this._chartData && this._chartData.length) {
            this.chart.data = this._chartData;
            const MAGIC_TIMEOUT = 150;
            setTimeout(() => {
                this.updateChartData();
                this.drawChart();
            }, MAGIC_TIMEOUT);
        }
    }

    /**
     *
     */
    public createChart(): void {
        this.updateChartData();

        let chart = this.container.createChild(am4charts.XYChart);
        chart.data = [];

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
    private drawChart(): void {
        if (this.chart.series.length) {
            this.chart.series.removeIndex(0);
            this.chart.series.removeIndex(0);
        }
        this.chart.data = this._chartData;

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

    /**
     *
     */
    public updateChartData(): void {
        this._chartData = orderBy(this._chartData, ['date'], ['asc']);
    }
}
