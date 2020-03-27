import { AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';

export class ChartBase implements AfterViewInit, OnDestroy {
    public readonly SUBSCRIPTION_DELAY = 10;
    public container = null;
    public chart = null;
    public COMPONENT_ID: string;

    constructor(
        public readonly _ngZone: NgZone
    ) {
        this.COMPONENT_ID = this.getComponentId();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this._ngZone.runOutsideAngular(() => {
                this.createChart();
            });
        }, this.SUBSCRIPTION_DELAY);
    }

    ngOnDestroy() {
        this._ngZone.runOutsideAngular(() => {
            if (this.container) {
                this.container.dispose();
            }

            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

    public createChart(): void {}

    public getComponentId(): string {
        return 'Chart-Id-' + Math.random().toString(36).substring(2) + new Date().getTime();
    }
}
