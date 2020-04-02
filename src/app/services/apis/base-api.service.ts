import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export class BaseApiService {
    public API_BASE_PATH = '';
    public API_URL = '';

    constructor() {
        this.setApiUrl();
    }

    /**
     * Returns the json body of a given response.
     */
    public retrieveData(response: any): any {
        return response || null;
    }

    /**
     * Returns an url with a jsonp callback.
     */
    public retrieveSimpleJsonpUrl(url: string): string {
        return url + '?callback=JSONP_CALLBACK';
    }

    /**
     *
     */
    public getCountryQueryParameter(countryCode: string): any {
        const requestParams = {
            'params': {}
        }

        if (countryCode) {
            requestParams.params['country'] = countryCode;
        }

        return requestParams;
    }

    /**
     *
     */
    public setApiUrl(): void {
        this.API_URL = environment.apiBaseUrl + this.API_BASE_PATH;
    }
}
