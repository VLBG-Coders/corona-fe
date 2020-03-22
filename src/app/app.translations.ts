import { HttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

// AoT requires an exported function for factories.
export function HttpTranslationsLoaderFactory(http: HttpClient) {
    return new MultiTranslateHttpLoader(http, [
        {
            prefix: './assets/i18n/app/',
            suffix: '.json'
        }
    ]);
}
