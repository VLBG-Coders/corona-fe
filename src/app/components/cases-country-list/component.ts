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
            prop: 'deaths',
        }, {
            name: 'Deaths',
            prop: 'deaths',
        }, {
            name: 'Recovered',
            prop: 'recovered',
        }
    ];
    ColumnMode = ColumnMode;
    SelectionType = SelectionType;

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

    private fetchCases(): void {
        this.loadingIndicator = true;

        this.coronaCasesApiService.getCasesByCountries().subscribe(
            response => {
                this.rows = response;
                this.loadingIndicator = false;
            }
        );
    }
}
