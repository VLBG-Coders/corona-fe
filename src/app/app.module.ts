import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

import * as Pages from '@app/pages';
import * as Components from '@app/components';
import * as Services from '@app/services';
import * as Apis from '@app/services/apis';
import { environment } from '@env/environment';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { HttpTranslationsLoaderFactory } from './app.translations';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpTranslationsLoaderFactory,
                deps: [
                    HttpClient
                ]
            }
        }),
        NgxGoogleAnalyticsModule.forRoot(environment.googleAnalyticsTrackingCode),
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
        Components.CasesBarChartComponent,
        Components.CasesCountryListComponent,
        Components.CasesCountryListCompactComponent,
        Components.CasesLineChartComponent,
        Components.CasesMapChartComponent,
        Components.CasesTextTileComponent,
        Components.GeoMapComponent,
        Components.LoadingIndicatorComponent,
        Components.NavbarComponent,
        Components.SnippetCasesTrendComponent,
        Pages.AboutPage,
        Pages.CountryDetailPage,
        Pages.ContinentsPage,
        Pages.DashboardPage,
        Pages.Error404Page,
    ],
    providers: [
        Apis.CoronaCasesApiService,
        Apis.CountriesApiService,
        Services.AmchartService,
        Services.DataStorageService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
