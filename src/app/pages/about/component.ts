import { Component } from '@angular/core';

@Component({
    selector: 'app-pages-about',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class AboutPage {
    public contributors = [
        {
            name: 'Nachbauer Philip',
            image: 'notsure.png',
            website: 'https://naba.at',
            employerName: 'Anivo',
            employerUrl: 'https://www.anivo360.com/',
            github: 'notsure',
            twitter: 'nochbur',
            linkedin: 'philip-nachbauer-246017155'
        }, {
            name: 'Hiller Elias',
            image: 'turbo-ele.jpg',
            employerName: 'Crate',
            employerUrl: 'https://crate.io/',
            github: 'turbo-ele',
            twitter: 'turboele',
            linkedin: 'elias-hiller-676102117'
        }, {
            name: 'Mitgutsch David',
            image: 'mida.jpg',
            employerName: 'Anivo',
            employerUrl: 'https://www.anivo360.com/',
            github: 'mida02',
            twitter: '',
            linkedin: 'davmit'
        }
    ];

    public imageBaseUrl = '/assets/images/contributors/';
    public linkedInBaseUrl = 'https://www.linkedin.com/in/';
    public githubBaseUrl = 'https://github.com/';
    public twitterBaseUrl = 'https://twitter.com/';
}
