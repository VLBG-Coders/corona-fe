import { find, filter } from 'lodash';
import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent implements OnChanges {
    @Input()
    public isComponentLoading: boolean = false;

    @Input()
    public viewMode: string = 'table';

    @Input()
    public viewCase: string = 'confirmed';

    @Input()
    public dataCases = [];

    private _countries = [];
    public countries = [];
    public filterCountryName: string;

    constructor(
        public readonly _router: Router,
        public readonly _domSanitizer: DomSanitizer,
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) { }

    ngOnChanges() {
        this._countries = this.dataCases;
        this.countries = this.dataCases;
    }

    /**
     *
     */
    public onSelectCountry(selectedElements: any): void {
        const country = selectedElements[0];
        const url = '/country/' + country.country.code;
        this._router.navigate([url]);
    }

    /**
     *
     */
    public onSelectCountryByCode(code: string): void {
        const url = '/country/' + code;
        this._router.navigate([url]);
    }

    /**
     *
     */
    public filterCountries(event: any): void {
        const countryName = this.filterCountryName.toLowerCase();

        this.countries = filter(this._countries, (item) => {
            let itemName = item.country.name.toLowerCase();

            return itemName.includes(countryName);
        });
    }
}
