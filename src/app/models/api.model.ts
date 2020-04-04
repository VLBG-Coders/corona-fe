import { CasesDailyModel, CasesTotalModel } from './cases.model';
import { CountryModel } from './country.model';

export class ApiCasesTotalModel {
    country: CountryModel = new CountryModel;
    cases: CasesTotalModel = new CasesTotalModel;
}

export class ApiCasesDailyModel {
    country: CountryModel = new CountryModel;
    timeline: CasesDailyModel[] = [];
}
