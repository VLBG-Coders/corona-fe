import { AfterViewInit, Component, NgZone, Input, OnChanges, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { AmchartService } from '@app/services';
import { ChartBase } from '../chart-base';

@Component({
    selector: 'app-cases-line-chart',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesLineChartComponent extends ChartBase implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    constructor(
        public readonly _ngZone: NgZone,
        public readonly amchartService: AmchartService,
    ) {
        super(_ngZone);
    }

    /**
     *
     */
    public createChart(): void {
        let chart = am4core.create(this.COMPONENT_ID, am4charts.XYChart);
        chart.paddingRight = 20;
        chart.data = [];

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled = true;
        valueAxis.renderer.minWidth = 35;

        let confirmed = chart.series.push(this.getSeries(
            chart,
            'date',
            'confirmed',
            this.amchartService.config.CASES_CONFIRMED_COLOR
        ));
        let deaths = chart.series.push(this.getSeries(
            chart,
            'date',
            'deaths',
            this.amchartService.config.CASES_DEATHS_COLOR
        ));
        let recovered = chart.series.push(this.getSeries(
            chart,
            'date',
            'recovered',
            this.amchartService.config.CASES_RECOVERED_COLOR
        ));

        let scrollbarX = new am4charts.XYChartScrollbar();
        scrollbarX.series.push(confirmed);
        scrollbarX.series.push(deaths);
        scrollbarX.series.push(recovered);
        chart.scrollbarX = scrollbarX;
        chart.scrollbarX.parent = chart.bottomAxesContainer;



        chart.legend = new am4charts.Legend();
        chart.legend.position = 'right';
        chart.legend.scrollable = true;
        chart.legend.itemContainers.template.events.on('over', function(event) {
            this.processOver(event.target.dataItem.dataContext);
        }.bind(this));

        chart.legend.itemContainers.template.events.on('out', function(event) {
            this.processOut(event.target.dataItem.dataContext);
        }.bind(this));

        this.chart = chart;
    }

    private getSeries(chart, valueX: string, valueY: string, color: string): am4charts.LineSeries {
        let series = new am4charts.LineSeries();
        series.dataFields.dateX = valueX;
        series.dataFields.valueY = valueY;
        series.strokeWidth = 3;
        series.minBulletDistance = 15;
        series.tooltipText = '{valueY}';
        series.stroke = am4core.color(color);
        series.name = valueY;
        chart.cursor = new am4charts.XYCursor();

        let segment = series.segments.template;
        segment.interactionsEnabled = true;

        let hoverState = segment.states.create('hover');
        hoverState.properties.strokeWidth = 3;

        let dimmed = segment.states.create('dimmed');
        dimmed.properties.stroke = am4core.color('#dadada');

        segment.events.on('over', function(event) {
            this.processOver(event.target.parent.parent.parent);
        }.bind(this));

        segment.events.on('out', function(event) {
            this.processOut(event.target.parent.parent.parent);
        }.bind(this));

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

        hoveredSeries.segments.each(function(segment) {
            segment.setState('hover');
        })

        this.chart.series.each(function(series) {
            if (series != hoveredSeries) {
                series.segments.each(function(segment) {
                    segment.setState('dimmed');
                })
                series.bullets.each(function(bullet) {
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
        this.chart.series.each(function(series) {
            series.segments.each(function(segment) {
                segment.setState('default');
            });
            series.bullets.each(function(bullet) {
                bullet.setState('default');
            });
            series.bulletsContainer.setState('default');
        });
    }
}
