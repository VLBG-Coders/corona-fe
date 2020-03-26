import { isEmpty } from 'lodash';
import { AfterViewInit, Component, NgZone, Input, OnChanges, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

@Component({
    selector: 'app-cases-timeline-map',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesTimelineMapComponent {
    @Input()
    public chartDataCountry = null;

    @Input()
    public chartDataTotal = null;

    public chart: am4charts.XYChart = null;
    public chartContainer = null;
    public mapChart = null;

    constructor(
        private _ngZone: NgZone
    ) { }

    ngAfterViewInit() {
        this._ngZone.runOutsideAngular(() => {
            this.createChartContainer();
        });
    }

    ngOnDestroy() {
        this._ngZone.runOutsideAngular(() => {
            if (this.chart) {
                this.chart.dispose();
            }
        });
    }

    ngOnChanges() {
        if (!isEmpty(this.chartDataCountry) && !isEmpty(this.chartDataTotal)) {
            this.createTimelineMap();
        }
    }

    private createChartContainer(): void {
        let container = am4core.create('timelineChart', am4core.Container);
        container.width = am4core.percent(100);
        container.height = am4core.percent(100);
        container.background.fill = am4core.color('#1e2128');
        container.background.fillOpacity = 1;

        this.chartContainer = container;
    }

    // function that returns current slide
    // if index is not set, get last slide
    private getSlideData(index?) {
        if (index == undefined) {
            index = this.chartDataCountry.length - 1;
        }

        let data = this.chartDataCountry[index];

        return data;
    }

    // ATTENTION: THIS IS DIRTY I KNOW, it is quick and dirty, will be improved tomorrow
    public createTimelineMap() {
        let backgroundColor = am4core.color('#1e2128');
        let activeColor = am4core.color('#ff8726');
        let confirmedColor = am4core.color('#d21a1a');
        let recoveredColor = am4core.color('#45d21a');
        let deathsColor = am4core.color('#1c5fe5');
        let textColor = am4core.color('#ffffff');

        // for an easier access by key
        let colors = { active: activeColor, confirmed: confirmedColor, recovered: recoveredColor, deaths: deathsColor };

        let countryColor = am4core.color('#3b3b3b');
        let countryStrokeColor = am4core.color('#000000');
        let buttonStrokeColor = am4core.color('#ffffff');
        let countryHoverColor = am4core.color('#1b1b1b');
        let activeCountryColor = am4core.color('#0f0f0f');

        let currentIndex;
        let currentCountry = 'World';

        // last date of the data
        let lastDate = new Date(this.chartDataTotal[this.chartDataTotal.length - 1].date);
        let currentDate = lastDate;

        let currentPolygon;

        let countryDataTimeout;

        let sliderAnimation;

        //////////////////////////////////////////////////////////////////////////////
        // PREPARE DATA
        //////////////////////////////////////////////////////////////////////////////

        // make a map of country indexes for later use
        let countryIndexMap = {};
        let list = this.chartDataCountry[0].list;
        for (var i = 0; i < list.length; i++) {
            let country = list[i]
            countryIndexMap[country.id] = i;
        }

        // calculated active cases in world data (active = confirmed - recovered)
        for (var i = 0; i < this.chartDataTotal.length; i++) {
            let di = this.chartDataTotal[i];
            di.active = di.confirmed - di.recovered;
        }

        // get slide data
        let slideData = this.getSlideData();

        // as we will be modifying raw data, make a copy
        let mapData = JSON.parse(JSON.stringify(slideData.list));
        let max = { confirmed: 0, recovered: 0, deaths: 0, active: null };

        // the last day will have most
        for (var i = 0; i < mapData.length; i++) {
            let di = mapData[i];
            if (di.confirmed > max.confirmed) {
                max.confirmed = di.confirmed;
            }
            if (di.recovered > max.recovered) {
                max.recovered = di.recovered;
            }
            if (di.deaths > max.deaths) {
                max.deaths = di.deaths
            }
            max.active = max.confirmed;
        }

        // END OF DATA

        //////////////////////////////////////////////////////////////////////////////
        // LAYOUT & CHARTS
        //////////////////////////////////////////////////////////////////////////////

        // MAP CHART
        // https://www.amcharts.com/docs/v4/chart-types/map/
        let mapChart = this.chartContainer.createChild(am4maps.MapChart);
        mapChart.height = am4core.percent(80);
        mapChart.zoomControl = new am4maps.ZoomControl();
        mapChart.zoomControl.align = 'right';
        mapChart.zoomControl.marginRight = 15;
        mapChart.zoomControl.valign = 'middle';

        // by default minus button zooms out by one step, but we modify the behavior so when user clicks on minus, the map would fully zoom-out and show world data
        mapChart.zoomControl.minusButton.events.on('hit', showWorld);
        // clicking on a 'sea' will also result a full zoom-out
        mapChart.seriesContainer.background.events.on('hit', showWorld);
        mapChart.seriesContainer.background.events.on('over', resetHover);
        mapChart.seriesContainer.background.fillOpacity = 0;
        mapChart.zoomEasing = am4core.ease.sinOut;

        // https://www.amcharts.com/docs/v4/chart-types/map/#Map_data
        // you can use more accurate world map or map of any other country - a wide selection of maps available at: https://github.com/amcharts/amcharts4-geodata
        mapChart.geodata = am4geodata_worldLow;

        // Set projection
        // https://www.amcharts.com/docs/v4/chart-types/map/#Setting_projection
        // instead of Miller, you can use Mercator or many other projections available: https://www.amcharts.com/demos/map-using-d3-projections/
        mapChart.projection = new am4maps.projections.Miller();
        mapChart.panBehavior = 'move';

        // Map polygon series (defines how country areas look and behave)
        let polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.dataFields.id = 'id';
        polygonSeries.exclude = ['AQ']; // Antarctica is excluded in non-globe projection
        polygonSeries.useGeodata = true;
        polygonSeries.nonScalingStroke = true;
        polygonSeries.strokeWidth = 0.5;
        // this helps to place bubbles in the visual middle of the area
        polygonSeries.calculateVisualCenter = true;

        let polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.fill = countryColor;
        polygonTemplate.fillOpacity = 1
        polygonTemplate.stroke = countryStrokeColor;
        polygonTemplate.strokeOpacity = 0.15
        polygonTemplate.setStateOnChildren = true;

        polygonTemplate.events.on('hit', handleCountryHit);
        polygonTemplate.events.on('over', handleCountryOver);
        polygonTemplate.events.on('out', handleCountryOut);

        // you can have pacific - centered map if you set this to -154.8
        mapChart.deltaLongitude = -10;

        // polygon states
        let polygonHoverState = polygonTemplate.states.create('hover');
        polygonHoverState.properties.fill = countryHoverColor;

        let polygonActiveState = polygonTemplate.states.create('active')
        polygonActiveState.properties.fill = activeCountryColor;

        // Bubble series
        let bubbleSeries = mapChart.series.push(new am4maps.MapImageSeries());
        bubbleSeries.data = mapData;
        bubbleSeries.dataFields.value = 'confirmed';
        bubbleSeries.dataFields.id = 'id';

        // adjust tooltip
        bubbleSeries.tooltip.animationDuration = 0;
        bubbleSeries.tooltip.showInViewport = false;
        bubbleSeries.tooltip.background.fillOpacity = 0.2;
        bubbleSeries.tooltip.getStrokeFromObject = true;
        bubbleSeries.tooltip.getFillFromObject = false;
        bubbleSeries.tooltip.background.fillOpacity = 0.2;
        bubbleSeries.tooltip.background.fill = am4core.color('#000000');

        let imageTemplate = bubbleSeries.mapImages.template;
        // if you want bubbles to become bigger when zoomed, set this to false
        imageTemplate.nonScaling = true;
        imageTemplate.strokeOpacity = 0;
        imageTemplate.fillOpacity = 0.5;
        imageTemplate.tooltipText = '{name}: [bold]{value}[/]';
        // this is needed for the tooltip to point to the top of the circle instead of the middle
        imageTemplate.adapter.add('tooltipY', function(tooltipY, target) {
            return -target.children.getIndex(0).radius;
        })

        imageTemplate.events.on('over', handleImageOver);
        imageTemplate.events.on('out', handleImageOut);
        imageTemplate.events.on('hit', handleImageHit);

        // When hovered, circles become non-opaque
        let imageHoverState = imageTemplate.states.create('hover');
        imageHoverState.properties.fillOpacity = 1;

        // add circle inside the image
        let circle = imageTemplate.createChild(am4core.Circle);
        // this makes the circle to pulsate a bit when showing it
        circle.hiddenState.properties.scale = 0.0001;
        circle.hiddenState.transitionDuration = 2000;
        circle.defaultState.transitionDuration = 2000;
        circle.defaultState.transitionEasing = am4core.ease.elasticOut;
        // later we set fill color on template (when changing what type of data the map should show) and all the clones get the color because of this
        circle.applyOnClones = true;

        // heat rule makes the bubbles to be of a different width. Adjust min/max for smaller/bigger radius of a bubble
        bubbleSeries.heatRules.push({
            'target': circle,
            'property': 'radius',
            'min': 3,
            'max': 30,
            'dataField': 'value'
        })

        // when data items validated, hide 0 value bubbles (because min size is set)
        bubbleSeries.events.on('dataitemsvalidated', function() {
            bubbleSeries.dataItems.each((dataItem) => {
                let mapImage = dataItem.mapImage;
                let circle = mapImage.children.getIndex(0);
                if (mapImage.dataItem.value == 0) {
                    circle.hide(0);
                }
                else if (circle.isHidden || circle.isHiding) {
                    circle.show();
                }
            })
        })

        // this places bubbles at the visual center of a country
        imageTemplate.adapter.add('latitude', function(latitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.id);
            if (polygon) {
                return polygon.visualLatitude;
            }
            return latitude;
        })

        imageTemplate.adapter.add('longitude', function(longitude, target) {
            let polygon = polygonSeries.getPolygonById(target.dataItem.id);
            if (polygon) {
                return polygon.visualLongitude;
            }
            return longitude;
        })

        // END OF MAP

        // top title
        let title = mapChart.titles.create();
        title.fontSize = '1.5em';
        title.fill = textColor;
        title.text = 'COVID-19 Spread Data';
        title.align = 'left';
        title.horizontalCenter = 'left';
        title.marginLeft = 20;
        title.paddingBottom = 10;
        title.y = 20;

        // buttons & chart container
        let buttonsAndChartContainer = this.chartContainer.createChild(am4core.Container);
        buttonsAndChartContainer.layout = 'vertical';
        buttonsAndChartContainer.height = am4core.percent(40); // make this bigger if you want more space for the chart
        buttonsAndChartContainer.width = am4core.percent(100);
        buttonsAndChartContainer.valign = 'bottom';

        // country name and buttons container
        let nameAndButtonsContainer = buttonsAndChartContainer.createChild(am4core.Container)
        nameAndButtonsContainer.width = am4core.percent(100);
        nameAndButtonsContainer.padding(0, 10, 5, 20);
        nameAndButtonsContainer.layout = 'horizontal';

        // name of a country and date label
        let countryName = nameAndButtonsContainer.createChild(am4core.Label);
        countryName.fontSize = '1.1em';
        countryName.fill = textColor;
        countryName.valign = 'middle';

        // buttons container (active/confirmed/recovered/deaths)
        let buttonsContainer = nameAndButtonsContainer.createChild(am4core.Container);
        buttonsContainer.layout = 'grid';
        buttonsContainer.width = am4core.percent(100);
        buttonsContainer.x = 10;
        buttonsContainer.contentAlign = 'right';

        // Chart & slider container
        let chartAndSliderContainer = buttonsAndChartContainer.createChild(am4core.Container);
        chartAndSliderContainer.layout = 'vertical';
        chartAndSliderContainer.height = am4core.percent(100);
        chartAndSliderContainer.width = am4core.percent(100);
        chartAndSliderContainer.background.fill = am4core.color('#000000');
        chartAndSliderContainer.background = new am4core.RoundedRectangle();
        chartAndSliderContainer.background.cornerRadius(30, 30, 0, 0)
        chartAndSliderContainer.background.fillOpacity = 0.15;
        chartAndSliderContainer.background.fill = am4core.color('#000000');
        chartAndSliderContainer.paddingTop = 10;
        chartAndSliderContainer.paddingBottom = 0;

        // Slider container
        let sliderContainer = chartAndSliderContainer.createChild(am4core.Container);
        sliderContainer.width = am4core.percent(100);
        sliderContainer.padding(0, 15, 15, 10);
        sliderContainer.layout = 'horizontal';

        let slider = sliderContainer.createChild(am4core.Slider);
        slider.width = am4core.percent(100);
        slider.valign = 'middle';
        slider.background.opacity = 0.4;
        slider.opacity = 0.7;
        slider.background.fill = am4core.color('#ffffff');
        slider.marginLeft = 20;
        slider.marginRight = 35;
        slider.height = 15;
        slider.start = 1;


        // what to do when slider is dragged
        slider.events.on('rangechanged', function(event) {
            let index = Math.round((this.chartDataCountry.length - 1) * slider.start);
            updateMapData(this.getSlideData(index).list);
            updateTotals(index, this.chartDataTotal);
        }.bind(this))
        // stop animation if dragged
        slider.startGrip.events.on('drag', () => {
            stop();
            if (sliderAnimation) {
                sliderAnimation.setProgress(slider.start);
            }
        });

        // play button
        let playButton = sliderContainer.createChild(am4core.PlayButton);
        playButton.valign = 'middle';
        // play button behavior
        playButton.events.on('toggled', function(event) {
            if (event.target.isActive) {
                play();
            } else {
                stop();
            }
        })
        // make slider grip look like play button
        slider.startGrip.background.fill = playButton.background.fill;
        slider.startGrip.background.strokeOpacity = 0;
        slider.startGrip.icon.stroke = am4core.color('#ffffff');
        slider.startGrip.background.states.copyFrom(playButton.background.states)

        // play behavior
        function play() {
            if (!sliderAnimation) {
                sliderAnimation = slider.animate({ property: 'start', to: 1, from: 0 }, 50000, am4core.ease.linear).pause();
                sliderAnimation.events.on('animationended', () => {
                    playButton.isActive = false;
                })
            }

            if (slider.start >= 1) {
                slider.start = 0;
                sliderAnimation.start();
            }
            sliderAnimation.resume();
            playButton.isActive = true;
        }

        // stop behavior
        function stop() {
            if (sliderAnimation) {
                sliderAnimation.pause();
            }
            playButton.isActive = false;
        }

        // BOTTOM CHART
        // https://www.amcharts.com/docs/v4/chart-types/xy-chart/
        let lineChart = chartAndSliderContainer.createChild(am4charts.XYChart);
        lineChart.fontSize = '0.8em';
        lineChart.paddingRight = 30;
        lineChart.paddingLeft = 30;
        lineChart.maskBullets = false;
        lineChart.zoomOutButton.disabled = true;
        lineChart.paddingBottom = 3;
        lineChart.paddingTop = 0;

        // make a copy of data as we will be modifying it
        lineChart.data = JSON.parse(JSON.stringify(this.chartDataTotal));

        // date axis
        // https://www.amcharts.com/docs/v4/concepts/axes/date-axis/
        let dateAxis = lineChart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.renderer.grid.template.stroke = am4core.color('#000000');
        dateAxis.max = lastDate.getTime() + am4core.time.getDuration('day', 3);
        dateAxis.tooltip.label.fontSize = '0.8em';
        dateAxis.renderer.labels.template.fill = textColor;
        dateAxis.tooltip.background.fill = am4core.color('#ff8726')
        dateAxis.tooltip.background.stroke = am4core.color('#ff8726')
        dateAxis.tooltip.label.fill = am4core.color('#000000')

        // value axis
        // https://www.amcharts.com/docs/v4/concepts/axes/value-axis/
        let valueAxis = lineChart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.interpolationDuration = 3000;
        valueAxis.renderer.grid.template.stroke = am4core.color('#000000');
        valueAxis.renderer.baseGrid.disabled = true;
        valueAxis.tooltip.disabled = true;
        valueAxis.extraMax = 0.05;
        valueAxis.renderer.inside = true;
        valueAxis.renderer.labels.template.verticalCenter = 'bottom';
        valueAxis.renderer.labels.template.padding(2, 2, 2, 2);
        valueAxis.renderer.labels.template.fill = textColor;

        // cursor
        // https://www.amcharts.com/docs/v4/concepts/chart-cursor/
        lineChart.cursor = new am4charts.XYCursor();
        lineChart.cursor.behavior = 'none'; // set zoomX for a zooming possibility
        lineChart.cursor.lineY.disabled = true;
        lineChart.cursor.xAxis = dateAxis;
        lineChart.cursor.lineX.stroke = am4core.color('#ff8726');
        // this prevents cursor to move to the clicked location while map is dragged
        am4core.getInteraction().body.events.off('down', lineChart.cursor.handleCursorDown, lineChart.cursor)
        am4core.getInteraction().body.events.off('up', lineChart.cursor.handleCursorUp, lineChart.cursor)

        // legend
        // https://www.amcharts.com/docs/v4/concepts/legend/
        lineChart.legend = new am4charts.Legend();
        lineChart.legend.parent = lineChart.plotContainer;
        lineChart.legend.labels.template.fill = textColor;

        // create series
        let activeSeries = addSeries('active', activeColor);
        // active series is visible initially
        activeSeries.tooltip.disabled = true;
        activeSeries.hidden = false;

        let confirmedSeries = addSeries('confirmed', confirmedColor);
        let recoveredSeries = addSeries('recovered', recoveredColor);
        let deathsSeries = addSeries('deaths', deathsColor);

        let series = { active: activeSeries, confirmed: confirmedSeries, recovered: recoveredSeries, deaths: deathsSeries };
        // add series
        function addSeries(name, color) {
            let series = lineChart.series.push(new am4charts.LineSeries())
            series.dataFields.valueY = name;
            series.dataFields.dateX = 'date';
            series.name = capitalizeFirstLetter(name);
            series.strokeOpacity = 0.6;
            series.stroke = color;
            series.maskBullets = false;
            series.hidden = true;
            series.minBulletDistance = 10;
            series.hideTooltipWhileZooming = true;
            // series bullet
            let bullet = series.bullets.push(new am4charts.CircleBullet());

            // only needed to pass it to circle
            let bulletHoverState = bullet.states.create('hover');
            bullet.setStateOnChildren = true;

            bullet.circle.fillOpacity = 1;
            bullet.circle.fill = backgroundColor;
            bullet.circle.radius = 2;

            let circleHoverState = bullet.circle.states.create('hover');
            circleHoverState.properties.fillOpacity = 1;
            circleHoverState.properties.fill = color;
            circleHoverState.properties.scale = 1.4;

            // tooltip setup
            series.tooltip.pointerOrientation = 'down';
            series.tooltip.getStrokeFromObject = true;
            series.tooltip.getFillFromObject = false;
            series.tooltip.background.fillOpacity = 0.2;
            series.tooltip.background.fill = am4core.color('#000000');
            series.tooltip.dy = -4;
            series.tooltip.fontSize = '0.8em';
            series.tooltipText = '{valueY}';

            return series;
        }

        // BUTTONS
        // create buttons
        let activeButton = addButton('active', activeColor);
        let confirmedButton = addButton('confirmed', confirmedColor);
        let recoveredButton = addButton('recovered', recoveredColor);
        let deathsButton = addButton('deaths', deathsColor);

        let buttons = { active: activeButton, confirmed: confirmedButton, recovered: recoveredButton, deaths: deathsButton };

        // add button
        function addButton(name, color) {
            let button = buttonsContainer.createChild(am4core.Button)
            button.label.valign = 'middle'
            button.fontSize = '1em';
            button.background.cornerRadius(30, 30, 30, 30);
            button.background.strokeOpacity = 0.3
            button.background.fillOpacity = 0;
            button.background.stroke = buttonStrokeColor;
            button.background.padding(2, 3, 2, 3);
            button.states.create('active');
            button.setStateOnChildren = true;
            button.label.fill = textColor;

            let activeHoverState = button.background.states.create('hoverActive');
            activeHoverState.properties.fillOpacity = 0;

            let circle = new am4core.Circle();
            circle.radius = 8;
            circle.fillOpacity = 0.3;
            circle.fill = buttonStrokeColor;
            circle.strokeOpacity = 0;
            circle.valign = 'middle';
            circle.marginRight = 5;
            button.icon = circle;

            // save name to dummy data for later use
            button.dummyData = name;

            let circleActiveState = circle.states.create('active');
            circleActiveState.properties.fill = color;
            circleActiveState.properties.fillOpacity = 0.5;

            button.events.on('hit', handleButtonClick);

            return button;
        }

        // handle button clikc
        function handleButtonClick(event) {
            // we saved name to dummy data
            changeDataType(event.target.dummyData);
        }

        // change data type (active/confirmed/recovered/deaths)
        function changeDataType(name) {
            // make button active
            let activeButton = buttons[name];
            activeButton.isActive = true;
            // make other buttons inactive
            for (var key in buttons) {
                if (buttons[key] != activeButton) {
                    buttons[key].isActive = false;
                }
            }
            // tell series new field name
            bubbleSeries.dataFields.value = name;
            bubbleSeries.invalidateData();
            // change color of bubbles
            // setting colors on mapImage for tooltip colors
            bubbleSeries.mapImages.template.fill = colors[name];
            bubbleSeries.mapImages.template.stroke = colors[name];
            // first child is circle
            bubbleSeries.mapImages.template.children.getIndex(0).fill = colors[name];

            // show series
            let activeSeries = series[name];
            activeSeries.show();
            // hide other series
            for (var key in series) {
                if (series[key] != activeSeries) {
                    series[key].hide();
                }
            }
            // update heat rule's maxValue
            bubbleSeries.heatRules.getIndex(0).maxValue = max[name];
        }

        // select a country
        function selectCountry(mapPolygon) {
            resetHover();
            polygonSeries.hideTooltip();

            // if the same country is clicked show world
            if (currentPolygon == mapPolygon) {
                currentPolygon.isActive = false;
                currentPolygon = undefined;
                showWorld();
                return;
            }
            // save current polygon
            currentPolygon = mapPolygon;
            let countryIndex = countryIndexMap[mapPolygon.dataItem.id];
            currentCountry = mapPolygon.dataItem.dataContext.name;

            // make others inactive
            polygonSeries.mapPolygons.each(function(polygon) {
                polygon.isActive = false;
            })

            // clear timeout if there is one
            if (countryDataTimeout) {
                clearTimeout(countryDataTimeout);
            }
            // we delay change of data for better performance (so that data is not changed whil zooming)
            countryDataTimeout = setTimeout(function() {
                setCountryData(countryIndex);
            }, 1000); // you can adjust number, 1000 is one second

            updateTotals(currentIndex, this.chartDataTotal);
            updateCountryName();

            mapPolygon.isActive = true;
            mapChart.zoomToMapObject(mapPolygon, getZoomLevel(mapPolygon));
        }

        // change line chart data to the selected countries
        function setCountryData(countryIndex) {
            // instead of setting whole data array, we modify current raw data so that a nice animation would happen
            for (var i = 0; i < lineChart.data.length; i++) {
                let di = this.chartDataCountry[i].list;

                let countryData = di[countryIndex];
                let dataContext = lineChart.data[i];
                if (countryData) {
                    dataContext.recovered = countryData.recovered;
                    dataContext.confirmed = countryData.confirmed;
                    dataContext.deaths = countryData.deaths;
                    dataContext.active = countryData.confirmed - countryData.recovered;
                    valueAxis.min = undefined;
                    valueAxis.max = undefined;
                }
                else {
                    dataContext.recovered = 0;
                    dataContext.confirmed = 0;
                    dataContext.deaths = 0;
                    dataContext.active = 0;
                    valueAxis.min = 0;
                    valueAxis.max = 10;
                }
            }

            lineChart.invalidateRawData();
            updateTotals(currentIndex, this.chartDataTotal);
            setTimeout(updateSeriesTooltip, 2000);
        }

        function updateSeriesTooltip() {
            lineChart.cursor.triggerMove(lineChart.cursor.point, 'soft', true);
            lineChart.series.each(function(series) {
                if (!series.isHidden) {
                    series.tooltip.disabled = false;
                    series.showTooltipAtDataItem(series.tooltipDataItem);
                }
            })
        }

        // what happens when a country is rolled-over
        function rollOverCountry(mapPolygon) {

            resetHover();
            if (mapPolygon) {
                mapPolygon.isHover = true;

                // make bubble hovered too
                let image = bubbleSeries.getImageById(mapPolygon.dataItem.id);
                if (image) {
                    image.dataItem.dataContext.name = mapPolygon.dataItem.dataContext.name;
                    image.isHover = true;
                }
            }
        }
        // what happens when a country is rolled-out
        function rollOutCountry(mapPolygon) {
            let image = bubbleSeries.getImageById(mapPolygon.dataItem.id)
            resetHover();
            if (image) {
                image.isHover = false;
            }
        }

        // rotate and zoom
        function rotateAndZoom(mapPolygon) {
            polygonSeries.hideTooltip();
            let animation = mapChart.animate([{ property: 'deltaLongitude', to: -mapPolygon.visualLongitude }, { property: 'deltaLatitude', to: -mapPolygon.visualLatitude }], 1000)
            animation.events.on('animationended', function() {
                mapChart.zoomToMapObject(mapPolygon, getZoomLevel(mapPolygon));
            })
        }

        // calculate zoom level (default is too close)
        function getZoomLevel(mapPolygon) {
            let w = mapPolygon.polygon.bbox.width;
            let h = mapPolygon.polygon.bbox.width;
            // change 2 to smaller walue for a more close zoom
            return Math.min(mapChart.seriesWidth / (w * 2), mapChart.seriesHeight / (h * 2))
        }

        // show world data
        function showWorld() {
            currentCountry = 'World';
            currentPolygon = undefined;
            resetHover();

            if (countryDataTimeout) {
                clearTimeout(countryDataTimeout);
            }

            // make all inactive
            polygonSeries.mapPolygons.each(function(polygon) {
                polygon.isActive = false;
            })

            updateCountryName();

            // update line chart data (again, modifying instead of setting new data for a nice animation)
            for (var i = 0; i < lineChart.data.length; i++) {
                let di = this.chartDataTotal[i];
                let dataContext = lineChart.data[i];

                dataContext.recovered = di.recovered;
                dataContext.confirmed = di.confirmed;
                dataContext.deaths = di.deaths;
                dataContext.active = di.confirmed - di.recovered;
                valueAxis.min = undefined;
                valueAxis.max = undefined;
            }

            lineChart.invalidateRawData();

            updateTotals(currentIndex, this.chartDataTotal);
            mapChart.goHome();
        }

        // updates country name and date
        function updateCountryName() {
            countryName.text = currentCountry + ', ' + mapChart.dateFormatter.format(currentDate, 'MMM dd, yyyy');
        }

        // update total values in buttons
        function updateTotals(index, chartDataTotal) {
            if (!isNaN(index)) {
                let di = chartDataTotal[index];
                let date = new Date(di.date);
                currentDate = date;

                updateCountryName();

                let position = dateAxis.dateToPosition(date);
                position = dateAxis.toGlobalPosition(position);
                let x = dateAxis.positionToCoordinate(position);

                if (lineChart.cursor) {
                    lineChart.cursor.triggerMove({ x: x, y: 0 }, 'soft', true);
                }
                for (var key in buttons) {
                    buttons[key].label.text = capitalizeFirstLetter(key) + ': ' + lineChart.data[index][key];
                }
                currentIndex = index;
            }
        }

        // update map data
        function updateMapData(data) {
            //modifying instead of setting new data for a nice animation
            bubbleSeries.dataItems.each(function(dataItem) {
                dataItem.dataContext.confirmed = 0;
                dataItem.dataContext.deaths = 0;
                dataItem.dataContext.recovered = 0;
                dataItem.dataContext.active = 0;
            })

            for (var i = 0; i < data.length; i++) {
                let di = data[i];
                let image = bubbleSeries.getImageById(di.id);
                if (image) {
                    image.dataItem.dataContext.confirmed = di.confirmed;
                    image.dataItem.dataContext.deaths = di.deaths;
                    image.dataItem.dataContext.recovered = di.recovered;
                    image.dataItem.dataContext.active = di.confirmed - di.recovered;
                }
            }
            bubbleSeries.invalidateRawData();
        }

        // capitalize first letter
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function handleImageOver(event) {
            rollOverCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
        }

        function handleImageOut(event) {
            rollOutCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
        }

        function handleImageHit(event) {
            selectCountry(polygonSeries.getPolygonById(event.target.dataItem.id));
        }

        function handleCountryHit(event) {
            selectCountry(event.target);
        }

        function handleCountryOver(event) {
            rollOverCountry(event.target);
        }

        function handleCountryOut(event) {
            rollOutCountry(event.target);
        }

        function resetHover() {
            polygonSeries.mapPolygons.each(function(polygon) {
                polygon.isHover = false;
            })

            bubbleSeries.mapImages.each(function(image) {
                image.isHover = false;
            })
        }

        this.chartContainer.events.on('layoutvalidated', function() {
            dateAxis.tooltip.hide();
            lineChart.cursor.hide();
            updateTotals(currentIndex, this.chartDataTotal);
        }.bind(this));

        updateCountryName();
        changeDataType('active');

        setTimeout(updateSeriesTooltip, 3000);
    }
}
