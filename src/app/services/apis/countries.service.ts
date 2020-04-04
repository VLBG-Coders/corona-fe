import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';
import { BaseApiService } from './base-api.service';
import { environment } from '@env/environment';

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
    @Cacheable()
    public getCountries(countryCode: string = null): Observable<any> {
        const url = this.API_URL + '/countries';
        const requestParams = this.getCountryQueryParameter(countryCode);

        if (environment.useApiMock) {
            if (countryCode) {
                return this._httpClient
                    .get(environment.apiMockBaseUrl + '/country.json')
                    .pipe(map(this.retrieveData));
            }

            return this._httpClient
                .get(environment.apiMockBaseUrl + '/countries.json')
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }
}
