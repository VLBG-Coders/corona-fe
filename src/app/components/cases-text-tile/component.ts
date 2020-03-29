import moment from 'moment';
import { AfterViewInit, Component, NgZone, Input, OnDestroy, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { AmchartService } from '@app/services';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-text-title',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesTextTileComponent extends ChartBase implements OnChanges {
    private readonly CHART_COLOR_RISING = '#D12F30';
    private readonly CHART_COLOR_SINKING = '#539E5D';
    private readonly CHART_COLOR_STAGNANT = '#0000FF';
    private readonly CHART_BASE_COLOR = '#eee';
    private series: any;

    public container: am4core.Container = null;

    public casesToday: number = 0;
    public casesYesterday: number = 0;

    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public translationKey: string;

    @Input()
    public viewCase: string = 'confirmed';

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService
    ) {
        super(_ngZone);
    }

    ngOnChanges() {
        if (this.chart) {
            this.updateChartData();
        }
    }

    /**
     *
     */
    public updateCasesVariables(): void {
        this.casesToday = this.chartData[this.viewCase];
        this.casesYesterday = this.chartData[this.viewCase + 'Prev'];
    }

    /**
     *
     */
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
    private updateChartData(): void {
        this.updateCasesVariables();

        let today = moment();
        let data = [
            {
                date: today.format('YYYY-MM-DD'),
                value: this.chartData[this.viewCase]
            }, {
                date: today.subtract(1, 'day').format('YYYY-MM-DD'),
                value: this.chartData[this.viewCase + 'Prev']
            }
        ];

        this.chart.data = data;

        this.series.stroke = this.amchartService.getColor(this.CHART_COLOR_RISING);
        this.series.fill = this.getGradient(this.CHART_COLOR_RISING);
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
