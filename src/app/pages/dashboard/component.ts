import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-pages-dashboard',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class DashboardPage implements OnInit {
    public totalCasesWorldwide: any = null;
    public totalCasesCountries = [];
    public casesByDayWorldwide = [];

    constructor(
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) { }

    ngOnInit() {
        this.fetchCasesByCountries();
        this.fetchTotalCasesWorldwide();
        this.fetchCasesByDay();
    }

    private fetchCasesByDay(): void {
        this.coronaCasesApiService.getCasesByDays().subscribe(
            response => {
                this.casesByDayWorldwide = response;
            }
        );
    }

    /**
     *
     */
    private fetchCasesByCountries(): void {
        this.coronaCasesApiService.getCasesByCountries().subscribe(
            response => {
                this.enrichApiData(response);
            }
        );
    }

    /**
     *
     */
    private enrichApiData(countries: any): void {
        for (let country of countries) {
            let name = country.country.name;
            country.country.compactName = name.toLowerCase().replace(/\s/g, '-');
        }

        this.totalCasesCountries = countries;
    }

    /**
     *
     */
    private fetchTotalCasesWorldwide(): void {
        this.coronaCasesApiService.getTotalCasesWorldwide().subscribe(
            response => {
                this.totalCasesWorldwide = response;
            }
        );
    }
}
