import { isEmpty, orderBy } from 'lodash';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoronaCasesApiService } from '@app/services/apis';
import { ApiCasesTotalModel } from '@app/models';

@Component({
    selector: 'app-cases-country-list-compact',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListCompactComponent implements OnInit {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public viewCase: string = 'confirmed';

    @Input()
    public dataCases: ApiCasesTotalModel[] = [];

    public _dataCases: ApiCasesTotalModel[] = [];
    public isComponentReady = false;
    public currentPageIndex = 0;
    private MAX_ITEMS_PER_PAGE = 22;

    constructor(
        public readonly _router: Router
    ) { }

    ngOnInit() {
        this.enrichApiData();
        this.buildPagination();
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
    private enrichApiData(): void {
        if (!this.dataCases) {
            return;
        }

        this.isComponentReady = false;

        let cases = [];
        for (let item of this.dataCases) {
            let name = item.country.name;
            item.country.compactName = name.toLowerCase().replace(/\s/g, '-');

            if (!item.cases[this.viewCase]) {
                item.cases[this.viewCase] = 0;
            }

            cases.push(item);
        }

        const orderByProperty = 'cases.' + this.viewCase;
        this._dataCases = orderBy(cases, [orderByProperty], ['desc']);
    }

    /**
     *
     */
    private buildPagination(): void {
        let data = [];
        let page = [];
        for (let item of this._dataCases) {
            page.push(item);

            if (page.length === this.MAX_ITEMS_PER_PAGE) {
                data.push(page);
                page = [];
            }
        }

        this._dataCases = data;
        this.isComponentReady = true;
    }
}
