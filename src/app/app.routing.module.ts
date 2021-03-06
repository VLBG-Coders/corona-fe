import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as Pages from '@app/pages';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    }, {
        path: 'dashboard',
        component: Pages.DashboardPage
    }, {
        path: 'country/:countryCode',
        component: Pages.CountryDetailPage
    }, {
        path: 'country',
        redirectTo: 'country/',
        pathMatch: 'full'
    }, {
        path: 'continents',
        component: Pages.ContinentsPage
    }, {
        path: 'about',
        component: Pages.AboutPage,
    }, {
        path: '404',
        component: Pages.Error404Page,
    }, {
        path: '**',
        component: Pages.Error404Page
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            routes,
            {
                useHash: true
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
