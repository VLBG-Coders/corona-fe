import { find, filter } from 'lodash';
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { CoronaCasesApiService } from '@app/services/apis';
import * as geoDataFlags from 'country-json/src/country-by-flag.json';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent {
    @Input()
    public viewMode: string = 'table';

    public geoDataFlags = geoDataFlags['default'];
    private _countries = [];
    public countries = [];
    public selected = [];
    public loadingIndicator = true;
    public reorderable = true;
    public ColumnMode = ColumnMode;
    public SelectionType = SelectionType;
    public filterCountryName = null;
    public columns = [
        {
            name: 'Country',
            prop: 'country.name',
        }, {
            name: 'Confirmed',
            prop: 'confirmed',
        }, {
            name: '%',
            prop: 'confirmedPrev',
        }, {
            name: 'Deaths',
            prop: 'deaths',
        }, {
            name: '%',
            prop: 'deathsPrev',
        }, {
            name: 'Recovered',
            prop: 'recovered',
        }, {
            name: '%',
            prop: 'recoveredPrev',
        }, {
            name: 'Immunity',
            prop: 'recoveredPrev',
        }
    ];

    constructor(
        public readonly _router: Router,
        public readonly _domSanitizer: DomSanitizer,
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) {
        this.fetchCases();
    }

    public onSelectCountry(selectedElements: any): void {
        const country = selectedElements[0];
        const url = '/country/' + country.country.code;
        this._router.navigate([url]);
    }

    public onSelectCountryByCode(code: string): void {
        const url = '/country/' + code;
        this._router.navigate([url]);
    }

    public filterCountries(event: any): void {
        const countryName = this.filterCountryName.toLowerCase();

        this.countries = filter(this._countries, (item) => {
            let itemName = item.name.toLowerCase();

            return itemName.includes(countryName);
        });
    }

    private fetchCases(): void {
        this.loadingIndicator = true;

        this.coronaCasesApiService.getCasesByCountries().subscribe(
            response => {
                this.enrichApiData(response);
            }
        );
    }

    private enrichApiData(countries: any): void {
        for (let country of countries) {
            let flag = find(this.geoDataFlags, { 'country': country.country.name });
            country.country.flag = null;

            if (flag) {
                country.country.flag = this._domSanitizer.bypassSecurityTrustUrl(flag.flag_base64);
            }
        }

        this._countries = countries;
        this.countries = countries;
        this.loadingIndicator = false;
    }
}
