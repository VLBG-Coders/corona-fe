import { filter, orderBy } from 'lodash';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoronaCasesApiService } from '@app/services/apis';
import { ApiCasesTotalModel } from '@app/models';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent implements OnInit, OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public dataCases: ApiCasesTotalModel[] = null;

    private _dataCases: ApiCasesTotalModel[] = [];
    public filterCountryName: string;
    public sortParameter = 'confirmed';
    public isComponentReady = false;

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

        this.isComponentReady = false;
        this._dataCases = orderBy(this.dataCases, [orderByProperty], ['desc']);
        this.isComponentReady = true;
    }
}
