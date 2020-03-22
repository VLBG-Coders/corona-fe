import { Component } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-cases-country-list',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesCountryListComponent {
    rows = [];
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
            sortable: false
        }, {
            name: 'Recovered',
            prop: 'recovered',
            sortable: false
        }
    ];
    ColumnMode = ColumnMode;

    constructor(
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) {
        this.fetchCases();
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
