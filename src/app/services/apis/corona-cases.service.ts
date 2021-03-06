import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';
import { BaseApiService } from './base-api.service';
import { environment } from '@env/environment';

@Injectable()
export class CoronaCasesApiService extends BaseApiService {
    public API_BASE_PATH = '/covid19';

    constructor(
        public readonly _httpClient: HttpClient
    ) {
        super();
        this.setApiUrl();
    }

    /**
     * Fetches cases on a daily basis.
     */
    @Cacheable()
    public getDailyCases(countryCode: string = null): Observable<any> {
        const url = this.API_URL + '/cases-daily';
        const requestParams = this.getCountryQueryParameter(countryCode);

        if (environment.useApiMock) {
            if (countryCode) {
                return this._httpClient
                    .get(environment.apiMockBaseUrl + '/cases-daily-country.json', requestParams)
                    .pipe(map(this.retrieveData));
            }

            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-daily.json', requestParams)
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetch total cases.
     */
    @Cacheable()
    public getTotalCases(countryCode: string = null): Observable<any> {
        const url = this.API_URL + '/cases-total';
        const requestParams = this.getCountryQueryParameter(countryCode);

        if (environment.useApiMock) {
            if (countryCode) {
                return this._httpClient
                    .get(environment.apiMockBaseUrl + '/cases-total-country.json')
                    .pipe(map(this.retrieveData));
            }

            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-total.json')
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetch total cases.
     */
    @Cacheable()
    public getTotalCasesWorldwide(): Observable<any> {
        const url = this.API_URL + '/cases-total';
        const requestParams = {
            'params': {
                'worldwide': 'true'
            }
        };

        if (environment.useApiMock) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-total-worldwide.json')
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }
}
