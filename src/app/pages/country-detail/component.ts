import { last } from 'lodash';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CountryModel, DailyCasesModel } from '@app/models';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-pages-country-detail',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CountryDetailPage implements OnInit {
    private readonly SUBSCRIPTION_DELAY = 50;
    private paramSubscriber = null;

    public countryCode = null;
    public selectedCountry: CountryModel = new CountryModel;
    public casesByDay: DailyCasesModel[] = [];
    public latestData: DailyCasesModel = new DailyCasesModel;

    constructor(
        public readonly _activatedRoute: ActivatedRoute,
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) { }

    ngOnInit() {
        // Timeout is needed to wait for the init event.
        setTimeout(() => {
            this.getRouteParameters();
        }, this.SUBSCRIPTION_DELAY);
    }

    public onCountrySelected(countryCode: string): void {
        this.changeSelectedCountry(countryCode);
    }

    private getRouteParameters(): void {
        const countryCode = this._activatedRoute.snapshot.paramMap.get('countryCode');

        if (!countryCode) {
            console.log('nothing found');

            return;
        }

        this.changeSelectedCountry(countryCode);
    }

    private fetchCasesByDay(): void {
        this.coronaCasesApiService.getCasesByCountryId(this.countryCode).subscribe(
            response => {
                this.selectedCountry = response.country;
                this.casesByDay = response.data;
                this.latestData = last(response.data);
                console.log('fetched')
            }
        );
    }

    private changeSelectedCountry(countryCode): void {
        this.countryCode = countryCode;
        this.fetchCasesByDay();
    }
}
