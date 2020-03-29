import { Injectable } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import { ChartConfig } from '../config';

@Injectable()
export class AmchartService {
    public config = new ChartConfig();

    public getColor(colorString: string): any {
        return am4core.color(colorString);
    }
}
