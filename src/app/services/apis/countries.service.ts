import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';

@Injectable()
export class CountriesApiService extends BaseApiService {
    public API_BASE_PATH = '';

    constructor(
        public readonly _httpClient: HttpClient
    ) {
        super();
    }

    /**
     * Fetches cases by country name.
     */
    public getCountries(countryCode: string = null): Observable<any> {
        const url = this.API_URL + '/countries';
        const requestParams = this.getCountryQueryParameter(countryCode);

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }
}
