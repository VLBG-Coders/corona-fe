import { isEmpty, orderBy } from 'lodash';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { CoronaCasesApiService } from '@app/services/apis';
import { ApiCasesTotalModel } from '@app/models';

@Component({
    selector: 'app-cases-country-list-compact',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListCompactComponent implements OnInit, OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public viewCase: string = 'confirmed';

    @Input()
    public dataCases: ApiCasesTotalModel[] = [];

    @Input()
    public customClass: string;

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

    ngOnChanges() {
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
    public onNextPageClicked(): void {
        if (this.currentPageIndex >= this._dataCases.length - 1) {
            return;
        }

        this.currentPageIndex++;
        this.showLoadingAnimation();
    }

    /**
     *
     */
    public onPreviousPageClicked(): void {
        if (this.currentPageIndex === 0) {
            return;
        }

        this.currentPageIndex--;
        this.showLoadingAnimation();
    }

    /**
     *
     */
    public showLoadingAnimation() {
        this.isComponentReady = false;
        setTimeout(() => {
            this.isComponentReady = true;
        }, 50);
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
        if (!this._dataCases || isEmpty(this._dataCases)) {
            this.isComponentReady = true;

            return;
        }

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
