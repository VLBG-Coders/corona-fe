import { filter, orderBy, sumBy } from 'lodash';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoronaCasesApiService } from '@app/services/apis';
import { ApiCasesTotalModel, CasesTotalModel } from '@app/models';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent implements OnInit, OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public dataCases: ApiCasesTotalModel[] = [];

    @Input()
    public customClass: string;

    @Input()
    public tableName: string = 'Global Data Table';

    @Input()
    public showTotalBar: boolean = true;

    public totalCases: CasesTotalModel = new CasesTotalModel;
    public filterCountryName: string;
    public sortParameter = 'confirmed';
    public isComponentReady = false;
    public _dataCases: ApiCasesTotalModel[] = [];

    constructor(
        public readonly _router: Router
    ) { }

    ngOnInit() {
        this.enrichApiData();
    }

    ngOnChanges() {
        this.enrichApiData();
    }

    /**
     *
     */
    public onSelectCountry(selectedElements: any): void {
        const item = selectedElements[0];
        const url = '/country/' + item.country.code;
        this._router.navigate([url]);
    }

    /**
     *
     */
    public onSelectCountryByCode(countryCode: string): void {
        const url = '/country/' + countryCode;
        this._router.navigate([url]);
    }

    /**
     *
     */
    public filterCountries(event: any): void {
        const countryName = this.filterCountryName.toLowerCase();
        console.log(this.dataCases[0]);

        this._dataCases = filter(this.dataCases, (item) => {
            let itemName = item.country.name.toLowerCase();

            return itemName.includes(countryName);
        });
    }

    /**
     *
     */
    private enrichApiData(): void {
        const orderByProperty = 'cases.' + this.sortParameter;

        if (!this.dataCases) {
            return;
        }

        for (let prop in this.totalCases) {
            this.totalCases[prop] = sumBy(this.dataCases, (item) => {
                return item.cases[prop];
            });
        }

        this.isComponentReady = false;
        this._dataCases = orderBy(this.dataCases, [orderByProperty], ['desc']);
        this.isComponentReady = true;
    }
}
