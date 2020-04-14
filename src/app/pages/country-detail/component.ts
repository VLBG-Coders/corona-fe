import { find, isEmpty } from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCasesTotalModel, CasesDailyModel, CasesTotalModel } from '@app/models';
import { CoronaCasesApiService, CountriesApiService } from '@app/services/apis';
import { GeoMapComponent } from '@app/components';

@Component({
    selector: 'app-pages-country-detail',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CountryDetailPage implements OnInit {
    @ViewChild(GeoMapComponent, { static: false })
    private worldChart: GeoMapComponent;

    private readonly PARAM_DELAY = 50;
    private paramSubscriber = null;
    private countries = [];

    public countryCode: string = null;
    public countryName: string = null;
    public selectedCountry;
    public isNoCountrySelected = false;

    public casesByDay: CasesDailyModel[] = [];
    public totalCases: CasesTotalModel = new CasesTotalModel;
    public totalCasesLoading: boolean = false;
    public casesByDayLoading: boolean = false;
    public isPageLoading: boolean = false;
    public notEnoughDataError: boolean = false;

    constructor(
        public readonly _router: Router,
        public readonly _activatedRoute: ActivatedRoute,
        public readonly coronaCasesApiService: CoronaCasesApiService,
        public readonly countriesApiService: CountriesApiService
    ) { }

    ngOnInit() {
        this.isPageLoading = true;
        setTimeout(() => {
            this.setRouteParameters();
            this.fetchCountries();
            this.bindMapCountrySelect();
        }, this.PARAM_DELAY);
    }

    /**
     *
     */
    public onCountrySelected(countryCode: string): void {
        const url = '/country/' + countryCode;
        this._router.navigate([url]);
        this.countryCode = countryCode;
        this.changeSelectedCountry();
    }

    /**
     *
     */
    private setRouteParameters(): void {
        const countryCode = this._activatedRoute.snapshot.paramMap.get('countryCode');

        if (!countryCode) {
            this.countryCode = null;
            this.isPageLoading = false;

            return;
        }

        this.countryCode = countryCode;
    }

    /**
     *
     */
    private bindMapCountrySelect(): void {
        const BINDING_DELAY = 100;
        setTimeout(() => {
            this.worldChart.onCountrySelected.subscribe(
                countryCode => {
                    this.onCountrySelected(countryCode);
                }
            );
        }, BINDING_DELAY);
    }

    /**
     *
     */
    private changeSelectedCountry(): void {
        this.isPageLoading = true;
        let country = find(this.countries, { 'code': this.countryCode });

        if (!country) {
            this.isPageLoading = false;
            this.isNoCountrySelected = true;

            return;
        }

        this.countryName = country.name;
        this.fetchCountryDetails();
        this.fetchDailyCasesByCountry();
        this.fetchTotalCasesByCountry();
    }

    /**
     *
     */
    private fetchCountries(): void {
        this.countriesApiService.getCountries().subscribe(
            data => {
                this.countries = data;
                this.changeSelectedCountry();
                this.isPageLoading = false;
            }
        );
    }

    /**
     *
     */
    private fetchCountryDetails(): void {
        this.countriesApiService.getCountries(this.countryCode).subscribe(
            data => {
                this.selectedCountry = data;
            }
        );
    }

    /**
     *
     */
    private fetchDailyCasesByCountry(): void {
        this.casesByDayLoading = true;
        this.coronaCasesApiService.getDailyCases(this.countryCode).subscribe(
            (data: CasesDailyModel[]) => {
                if (!data || !data.length) {
                    this.notEnoughDataError = true;
                    this.casesByDay = [];
                    this.casesByDayLoading = false;

                    return;
                }

                this.notEnoughDataError = false;
                this.casesByDay = data;
                this.casesByDayLoading = false;
            }
        );
    }

    /**
     *
     */
    private fetchTotalCasesByCountry(): void {
        this.isPageLoading = true;
        this.totalCasesLoading = true;
        this.coronaCasesApiService.getTotalCases(this.countryCode).subscribe(
            (data: ApiCasesTotalModel[]) => {
                if (!data || isEmpty(data) || !data.length) {
                    this.totalCases = new CasesTotalModel;
                    this.notEnoughDataError = true;
                    this.totalCasesLoading = false;
                    this.isPageLoading = false;

                    return;
                }

                this.notEnoughDataError = false;
                this.totalCases = data[0].cases;
                this.totalCasesLoading = false;
                this.isPageLoading = false;
            }
        );
    }
}
