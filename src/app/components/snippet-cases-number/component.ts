import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-snippet-cases-number',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class SnippetCasesNumberComponent {
    @Input()
    public cases: number;

    @Input()
    public showPlaceholder: boolean = true;

    @Input()
    public placeholder: string = '-';
}
