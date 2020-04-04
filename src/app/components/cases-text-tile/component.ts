import { isEmpty, orderBy } from 'lodash';
import { Component, NgZone, Input, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { AmchartService } from '@app/services';
import { CasesTotalModel, CasesDailyModel } from '@app/models';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-text-title',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesTextTileComponent extends ChartBase implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public translationKey: string;

    @Input()
    public viewCase: string = 'confirmed';

    @Input()
    public totalData: CasesTotalModel;

    @Input()
    public chartData: CasesDailyModel[] = [];

    @Input()
    public customClass: string;

    private readonly CHART_BASE_COLOR = '#eee';
    private series: any;
    private MAX_CHART_DAYS = 15;

    public container: am4core.Container = null;
    public casesToday: number = 0;
    public casesYesterday: number = 0;

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

    ngOnChanges() {
        if (!this.totalData || isEmpty(this.totalData)) {
            this.totalData = JSON.parse(JSON.stringify(this.totalData));
        }

        this.storeChartData();
        if (this.chart) {
            this.updateChartData();
            this.chart.invalidateRawData();
        }
    }

    /**
     *
     */
    public updateCasesVariables(): void {
        if (!this.totalData) {
            return;
        }

        this.casesToday = this.totalData[this.viewCase];
        this.casesYesterday = this.totalData['delta_' + this.viewCase];
    }

    /**
     *
     */
    public createChart(): void {
        this.container.layout = 'grid';
        this.container.fixedWidthGrid = false;
        this.createLineChart();
    }

    /**
     *
     */
    private createLineChart(): void {
        let chart = this.container.createChild(am4charts.XYChart);
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

        this.series = chart.series.push(new am4charts.LineSeries());
        this.series.dataFields.dateX = 'date';
        this.series.dataFields.valueY = 'value';
        this.series.tensionX = 0.8;
        this.series.strokeWidth = 2;
        this.series.stroke = this.amchartService.getColor(this.CHART_BASE_COLOR);
        this.series.fillOpacity = 1;
        this.series.fill = this.getGradient(this.CHART_BASE_COLOR);

        // render data points as bullets
        let bullet = this.series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.opacity = 0;
        bullet.circle.fill = this.amchartService.getColor(this.CHART_BASE_COLOR);
        bullet.circle.propertyFields.opacity = 'opacity';
        bullet.circle.radius = 3;

        this.chart = chart;
    }

    /**
     *
     */
    public updateChartData(): void {
        if (!this.chartData || isEmpty(this.chartData)) {
            return;
        }

        this.updateCasesVariables();

        let data = [];
        data = orderBy(data, ['date'], ['desc']);

        for (let item of this.chartData) {
            data.push({
                date: item.date,
                value: item[this.viewCase]
            });

            if (data.length === this.MAX_CHART_DAYS) {
                break;
            }
        }

        data = orderBy(data, ['date']);

        this.chart.data = data;
        this.series.stroke = this.colors[this.viewCase];
        this.series.fill = this.getGradient(this.colorCodes[this.viewCase]);
    }

    /**
     *
     */
    private getGradient(color: string): am4core.LinearGradient {
        let gradient = new am4core.LinearGradient();
        gradient.addColor(this.amchartService.getColor(color), 0.2);
        gradient.addColor(this.amchartService.getColor(color), 0);

        return gradient;
    }
}
