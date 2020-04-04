import { Component, OnInit } from '@angular/core';
import { ApiCasesTotalModel, CasesDailyModel } from '@app/models';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-pages-dashboard',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class DashboardPage implements OnInit {
    public totalCasesCountries: ApiCasesTotalModel[] = [];
    public totalCasesWorldwide: ApiCasesTotalModel = null;
    public dailyCasesWorldwide: CasesDailyModel[] = [];
    public totalCasesCountriesLoading: boolean = false;
    public totalCasesWorldwideLoading: boolean = false;
    public dailyCasesWorldwideLoading: boolean = false;

    constructor(
        public readonly coronaCasesApiService: CoronaCasesApiService,
    ) { }

    ngOnInit() {
        this.fetchDailyCasesWorldwide();
        this.fetchTotalCasesWorldwide();
        this.fetchTotalCasesByCountries();
    }

    /**
     *
     */
    private fetchDailyCasesWorldwide(): void {
        this.dailyCasesWorldwideLoading = true;
        this.coronaCasesApiService.getDailyCases().subscribe(
            (data: CasesDailyModel[]) => {
                this.dailyCasesWorldwide = data;
                this.dailyCasesWorldwideLoading = false;
            }
        );
    }

    /**
     *
     */
    private fetchTotalCasesWorldwide(): void {
        this.totalCasesWorldwideLoading = true;
        this.coronaCasesApiService.getTotalCasesWorldwide().subscribe(
            (data: ApiCasesTotalModel) => {
                this.totalCasesWorldwide = data;
                this.totalCasesWorldwideLoading = false;
            }
        );
    }

    /**
     *
     */
    private fetchTotalCasesByCountries(): void {
        this.totalCasesCountriesLoading = true;
        this.coronaCasesApiService.getTotalCases().subscribe(
            (data: ApiCasesTotalModel[]) => {
                this.totalCasesCountries = data;
                this.totalCasesCountriesLoading = false;
            }
        );
    }
}
