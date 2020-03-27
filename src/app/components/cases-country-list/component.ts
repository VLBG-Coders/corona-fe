import { filter } from 'lodash';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent {
    _rows = [];
    rows = [];
    selected = [];
    loadingIndicator = true;
    reorderable = true;
    columns = [
        {
            name: 'Country',
            prop: 'name',
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
    ColumnMode = ColumnMode;
    SelectionType = SelectionType;
    filterCountryName = null;

    constructor(
        public readonly _router: Router,
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) {
        this.fetchCases();
    }

    public onSelectCountry(selectedElements: any): void {
        const country = selectedElements[0];
        this._router.navigate(['/country/1']);
    }

    public filterCountries(event: any): void {
        const countryName = this.filterCountryName.toLowerCase();

        this.rows = filter(this._rows, (item) => {
            let itemName = item.name.toLowerCase();

            return itemName.includes(countryName);
        });
    }

    private fetchCases(): void {
        this.loadingIndicator = true;

        this.coronaCasesApiService.getCasesByCountries().subscribe(
            response => {
                this._rows = response;
                this.rows = response;
                this.loadingIndicator = false;
            }
        );
    }
}
