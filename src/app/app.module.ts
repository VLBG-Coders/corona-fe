import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import * as Pages from '@app/pages';

import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { HttpTranslationsLoaderFactory } from './app.translations';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpTranslationsLoaderFactory,
                deps: [
                    HttpClient
                ]
            }
        }),
        AppRoutingModule,
        BrowserAnimationsModule
    ],
    declarations: [
        AppComponent,
        Pages.DashboardPage,
        Pages.Error404Page,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
