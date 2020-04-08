import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'app-snippet-cases-trend',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class SnippetCasesTrendComponent implements OnChanges {
    @Input()
    public casesToday: number;

    @Input()
    public casesDelta: number;

    public casesYesterday: number;
    public showTrend = false;
    public trendNumber = 0;

    ngOnChanges() {
        this.calculateTrend();
    }

    private calculateTrend(): void {
        if (this.casesDelta === null) {
            console.error('SnippetCasesTrendComponent: not enough data.');
            this.showTrend = false;

            return;
        }

        this.casesYesterday = 0;
        if (this.casesToday > this.casesDelta) {
            this.casesYesterday = this.casesToday - this.casesDelta;
        }

        this.trendNumber = (this.casesToday * 100 / this.casesYesterday) - 100;
        this.showTrend = true;
    }
}
