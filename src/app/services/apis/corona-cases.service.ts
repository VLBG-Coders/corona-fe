import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { environment } from '@env/environment';

@Injectable()
export class CoronaCasesApiService extends BaseApiService {
    public API_BASE_PATH = '/cases';

    constructor(
        public readonly _httpClient: HttpClient
    ) {
        super();
    }

    /**
     * Fetches cases by country name.
     */
    public getCasesByCountryId(countryId: number): Observable<any> {
        const url = this.API_URL;
        const requestParams = {
            'params': {
                'country': String(countryId)
            }
        };

        if (!environment.production) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-by-country.json', requestParams)
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetches cases by country name.
     */
    public getCasesByTimelineTotal(countryId: number): Observable<any> {
        const url = this.API_URL;
        const requestParams = {
            'params': {
                'country': String(countryId)
            }
        };

        if (!environment.production) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/timeline-total.json', requestParams)
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetches cases by country name.
     */
    public getCasesByTimelineWorld(countryId: number): Observable<any> {
        const url = this.API_URL;
        const requestParams = {
            'params': {
                'country': String(countryId)
            }
        };

        if (!environment.production) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/timeline-world.json', requestParams)
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetches cases by days.
     */
    public getCasesByCountries(): Observable<any> {
        const url = this.API_URL;

        if (!environment.production) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-by-countries.json')
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url)
            .pipe(map(this.retrieveData));
    }

    /**
     * Fetches cases by days.
     */
    public getCasesByDays(fromDate?: string): Observable<any> {
        const url = this.API_URL;
        const requestParams = {
            'params': {
                'from': fromDate
            }
        };

        if (!environment.production) {
            return this._httpClient
                .get(environment.apiMockBaseUrl + '/cases-total-days.json', requestParams)
                .pipe(map(this.retrieveData));
        }

        return this._httpClient
            .get(url, requestParams)
            .pipe(map(this.retrieveData));
    }
}
