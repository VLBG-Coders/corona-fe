import { find } from 'lodash';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CasesDailyModel, CasesTotalModel } from '@app/models';
import { CoronaCasesApiService, CountriesApiService } from '@app/services/apis';
import { GeoMapCountryComponent } from '@app/components';

@Component({
    selector: 'app-pages-country-detail',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CountryDetailPage implements OnInit {
    @ViewChild(GeoMapCountryComponent, { static: false })
    private worldChart: GeoMapCountryComponent;

    private readonly PARAM_DELAY = 50;
    private paramSubscriber = null;
    private countries = [];

    public countryCode: string = null;
    public countryName: string = null;
    public selectedCountry;
    public isNoCountrySelected = false;
    public casesByDay: CasesDailyModel[] = null;
    public totalCases: CasesTotalModel = null;

    constructor(
        public readonly _router: Router,
        public readonly _activatedRoute: ActivatedRoute,
        public readonly coronaCasesApiService: CoronaCasesApiService,
        public readonly countriesApiService: CountriesApiService
    ) { }

    ngOnInit() {
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
        this.countryCode = countryCode;
        this.changeSelectedCountry();
    }

    /**
     *
     */
    private setRouteParameters(): void {
        const countryCode = this._activatedRoute.snapshot.paramMap.get('countryCode');

        if (!countryCode) {
            this.isNoCountrySelected = true;

            return;
        }

        this.countryCode = countryCode;
    }

    /**
     *
     */
    private bindMapCountrySelect(): void {
        setTimeout(() => {
            this.worldChart.onCountrySelected.subscribe(
                countryCode => {
                    this.onCountrySelected(countryCode);
                }
            );
        }, 100);
    }

    /**
     *
     */
    private changeSelectedCountry(): void {
        let country = find(this.countries, { 'code': this.countryCode });

        if (!country) {

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
            }
        );
    }

    /**
     *
     */
    private fetchCountryDetails(): void {
        this.countriesApiService.getCountries(this.countryName).subscribe(
            data => {
                this.selectedCountry = data;
            }
        );
    }

    /**
     *
     */
    private fetchDailyCasesByCountry(): void {
        this.coronaCasesApiService.getDailyCases(this.countryName).subscribe(
            (data: CasesDailyModel[]) => {
                this.casesByDay = data;
            }
        );
    }

    /**
     *
     */
    private fetchTotalCasesByCountry(): void {
        this.coronaCasesApiService.getTotalCases(this.countryName).subscribe(
            (data: CasesTotalModel) => {
                this.totalCases = data;
            }
        );
    }
}
