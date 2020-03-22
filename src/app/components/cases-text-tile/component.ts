import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cases-text-title',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class CasesTextTileComponent {
    @Input()
    public translationKey: string;

    @Input()
    public value: number;
}
