import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import * as Pages from '@app/pages';
import * as Components from '@app/components';
import * as Services from '@app/services';
import * as Apis from '@app/services/apis';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { HttpTranslationsLoaderFactory } from './app.translations';

@NgModule({
    imports: [
        BrowserModule,
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
        NgxDatatableModule,
        AppRoutingModule,
        BrowserAnimationsModule
    ],
    declarations: [
        AppComponent,
        Components.CasesCountryListComponent,
        Components.CasesLineChartComponent,
        Components.CasesMapChartComponent,
        Components.CasesTextTileComponent,
        Components.CasesTimelineMapComponent,
        Components.GeoMapCountryComponent,
        Components.NavbarComponent,
        Pages.CountryDetailPage,
        Pages.DashboardPage,
        Pages.Error404Page,
    ],
    providers: [
        Apis.CoronaCasesApiService,
        Services.DataStorageService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
