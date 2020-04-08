import { Component, NgZone, Input, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { AmchartService } from '@app/services';
import { CasesDailyModel } from '@app/models';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-line-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesLineChartComponent extends ChartBase implements OnChanges {
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
        if (!this.chartData.length) {
            return;
        }
        this.storeChartData();

        if (this.chart) {
            this.chart.data = this.chartData;

            setTimeout(() => {
                this.drawChart();
            }, 150);
        }
    }

    /**
     *
     */
    public createChart(): void {
        let chart = this.container.createChild(am4charts.XYChart);
        chart.paddingRight = 20;
        chart.data = this.chartData;

        chart.legend = new am4charts.Legend();
        chart.legend.position = 'top';
        chart.legend.scrollable = true;
        chart.legend.itemContainers.template.events.on('over', (event) => {
            this.processOver(event.target.dataItem.dataContext);
        });

        chart.legend.itemContainers.template.events.on('out', (event) => {
            this.processOut(event.target.dataItem.dataContext);
        });

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        this.chart = chart;
        this.drawChart();
    }

    private drawChart(): void {
        if (this.chart.series && this.chart.series.length) {
            this.chart.series.removeIndex(0);
            this.chart.series.removeIndex(0);
            this.chart.series.removeIndex(0);
        }

        let confirmed = this.chart.series.push(this.getSeries(
            'date',
            'confirmed',
            this.amchartService.config.CASES_CONFIRMED_COLOR
        ));
        let deaths = this.chart.series.push(this.getSeries(
            'date',
            'deaths',
            this.amchartService.config.CASES_DEATHS_COLOR
        ));
        let recovered = this.chart.series.push(this.getSeries(
            'date',
            'recovered',
            this.amchartService.config.CASES_RECOVERED_COLOR
        ));
    }

    private getSeries(valueX: string, valueY: string, color: string): am4charts.LineSeries {
        let series = new am4charts.LineSeries();
        series.dataFields.dateX = valueX;
        series.dataFields.valueY = valueY;
        series.strokeWidth = 3;
        series.minBulletDistance = 15;
        series.tooltipText = '{valueY}';
        series.stroke = am4core.color(color);
        series.name = valueY;

        this.chart.cursor = new am4charts.XYCursor();

        let segment = series.segments.template;
        segment.interactionsEnabled = true;

        let hoverState = segment.states.create('hover');
        hoverState.properties.strokeWidth = 3;

        let dimmed = segment.states.create('dimmed');
        dimmed.properties.stroke = am4core.color('#dadada');

        segment.events.on('over', (event) => {
            this.processOver(event.target.parent.parent.parent);
        });

        segment.events.on('out', (event) => {
            this.processOut(event.target.parent.parent.parent);
        });

        // Make bullets grow on hover
        let bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.circle.stroke = am4core.color(color);
        bullet.circle.strokeWidth = 2;
        bullet.circle.radius = 3;
        bullet.circle.fill = am4core.color('#fff');

        let bullethover = bullet.states.create('hover');
        bullethover.properties.scale = 1.3;

        let bulletDimmed = bullet.states.create('dimmed');
        bulletDimmed.properties.strokeWidth = 0;

        return series;
    }

    /**
     *
     */
    private processOver(hoveredSeries) {
        hoveredSeries.toFront();

        hoveredSeries.segments.each((segment) => {
            segment.setState('hover');
        })

        this.chart.series.each((series) => {
            if (series != hoveredSeries) {
                series.segments.each((segment) => {
                    segment.setState('dimmed');
                })
                series.bullets.each((bullet) => {
                    bullet.setState('dimmed');
                });
                series.bulletsContainer.setState('dimmed');
            }
        });
    }

    /**
     *
     */
    private processOut(hoveredSeries) {
        this.chart.series.each((series) => {
            series.segments.each((segment) => {
                segment.setState('default');
            });
            series.bullets.each((bullet) => {
                bullet.setState('default');
            });
            series.bulletsContainer.setState('default');
        });
    }
}
