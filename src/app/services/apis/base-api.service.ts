import { Observable } from 'rxjs';

export class BaseApiService {
    protected readonly DATE_FORMAT_SHORT = 'YYYY-MM-DD';
    public API_URL = '';

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
}
