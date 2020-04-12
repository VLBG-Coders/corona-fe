import { AfterViewInit, Input, OnDestroy, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';

export class ChartBase implements AfterViewInit, OnDestroy, OnChanges {
    public readonly SUBSCRIPTION_DELAY = 50;
    public readonly UPDATE_TIME_TO_WAIT = 150;
    public COMPONENT_ID: string;
    public container: am4core.Container;
    public chart: any;
    public chartData = [];
    public _chartData = [];
    public updateOnChangesTimer = null;

    constructor() {
        this.COMPONENT_ID = this.getComponentId();
    }

    /**
     *
     */
    ngAfterViewInit() {
        this.storeChartData();
        setTimeout(() => {
            this.createChartContainer();
            this.createChart();
        }, this.SUBSCRIPTION_DELAY);
    }

    /**
     *
     */
    ngOnChanges() {
        this.checkForChartToBeReady();
    }

    /**
     *
     */
    ngOnDestroy() {
        clearTimeout(this.updateOnChangesTimer);

        if (this.container) {
            this.container.dispose();
        }

        if (this.chart) {
            this.chart.dispose();
        }
    }

    /**
     *
     */
    public checkForChartToBeReady(): void {
        clearTimeout(this.updateOnChangesTimer);
        this.updateOnChangesTimer = setTimeout(() => {
            this.storeChartData();

            if (!this.chart || !this._chartData || !this._chartData.length) {
                this.checkForChartToBeReady();

                return;
            }

            this.updateChart();
        }, this.UPDATE_TIME_TO_WAIT);
    }

    /**
     *
     */
    public updateChart(): void {
        if (this.chart && this._chartData && this._chartData.length) {
            this.chart.dispose();
            this.chart.data = this._chartData;
            this.updateChartData()
            this.drawChart();
        }
    }

    /**
     *
     */
    public createChartContainer(): void {
        this.container = am4core.create(this.COMPONENT_ID, am4core.Container);
        this.container.width = am4core.percent(100);
        this.container.height = am4core.percent(100);
    }

    /**
     *
     */
    public createChart(): void { }

    /**
     *
     */
    public drawChart(): void { }

    /**
     *
     */
    public updateChartData(): void { }

    /**
     *
     */
    public getComponentId(): string {
        return 'Chart-Id-' + Math.random().toString(36).substring(2) + new Date().getTime();
    }

    /**
     *
     */
    public storeChartData(): void {
        if (this.chartData && this.chartData.length) {
            this._chartData = this.getChartDataCopy();

            return;
        }
    }

    /**
     *
     */
    public getChartDataCopy(): any {
        return JSON.parse(JSON.stringify(this.chartData));
    }
}
