import { AfterViewInit, NgZone, Input, OnDestroy, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';

export class ChartBase implements AfterViewInit, OnDestroy, OnChanges {
    public readonly SUBSCRIPTION_DELAY = 50;
    public container: am4core.Container;
    public chart: any;
    public chartData = [];
    public _chartData = [];
    public COMPONENT_ID: string;

    constructor(
        public readonly _ngZone: NgZone
    ) {
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

    ngOnChanges() {
        this.storeChartData();
        if (this.chart && this._chartData && this._chartData.length) {
            this.chart.dispose();
            this.updateChartData()
            this.createChart();
        }
    }

    /**
     *
     */
    ngOnDestroy() {
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
