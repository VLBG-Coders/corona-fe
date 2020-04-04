import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-snippet-cases-trend',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class SnippetCasesTrendComponent {
    @Input()
    public casesToday: number;

    @Input()
    public casesYesterday: number;
}
