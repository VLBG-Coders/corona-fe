import { find, orderBy } from 'lodash';
import { Component, OnInit } from '@angular/core';
import { ApiCasesTotalModel, CasesTotalModel, CountryModel } from '@app/models';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-pages-continents',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class ContinentsPage implements OnInit {
    public totalCasesCountries: ApiCasesTotalModel[] = [];
    public totalCasesCountriesLoading: boolean = false;

    public casesByContinents = [];

    constructor(
        public readonly coronaCasesApiService: CoronaCasesApiService,
    ) { }

    ngOnInit() {
        this.fetchTotalCasesByCountries();
    }

    /**
     *
     */
    private fetchTotalCasesByCountries(): void {
        this.totalCasesCountriesLoading = true;
        this.coronaCasesApiService.getTotalCases().subscribe(
            (data: ApiCasesTotalModel[]) => {
                this.totalCasesCountries = data;
                this.updateContinentMapping();
                this.totalCasesCountriesLoading = false;
            }
        );
    }

    /**
     *
     */
    private updateContinentMapping(): void {
        for (let item of this.totalCasesCountries) {
            if (!item.country.continent) {
                item.country.continent = 'Others';
            }

            let continent = this.getContinentFromListByName(item.country.continent)

            if (!continent) {
                continent = new ContinentModel;
                continent.continent.name = item.country.continent;
                this.updateContinentObject(continent, item);
                this.casesByContinents.push(continent);

                continue;
            }

            this.updateContinentObject(continent, item);
        }
    }

    /**
     *
     */
    private updateContinentObject(continent: ContinentModel, item: ApiCasesTotalModel): void {
        continent.continent.population = item.country.population;

        continent.casesByCountries.push(item);

        continent.casesTotal.confirmed = item.cases.confirmed;
        continent.casesTotal.deaths = item.cases.deaths;
        continent.casesTotal.recovered = item.cases.recovered;
        continent.casesTotal.delta_confirmed = item.cases.delta_confirmed;
        continent.casesTotal.delta_recovered = item.cases.delta_recovered;
        continent.casesTotal.delta_deaths = item.cases.delta_deaths;
    }

    /**
     *
     */
    private getContinentFromListByName(continentName: string): ContinentModel {
        if (!this.casesByContinents.length) {
            return null;
        }

        return find(this.casesByContinents, (item) => {
            return item.continent.name.toLowerCase() === continentName.toLowerCase();
        });
    }
}

export class ContinentModel {
    continent = {
        name: '',
        population: 0
    };
    casesByCountries: ApiCasesTotalModel[] = [];
    casesTotal: CasesTotalModel = new CasesTotalModel;
}
