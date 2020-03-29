import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading-indicator',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class LoadingIndicatorComponent {
    private readonly appearanceModes = [
        'simple'
    ]

    @Input()
    public appearance: string = 'simple';
}
