import { Component, OnInit } from '@angular/core';
import { CoronaCasesApiService } from '@app/services/apis';

@Component({
    selector: 'app-pages-dashboard',
    templateUrl: './main.html',
    styleUrls: ['./styles.scss']
})
export class DashboardPage implements OnInit {
    public casesByDay = [];
    public casesTimelineWorld = [];
    public casesTimelineTotal = [];

    constructor(
        public readonly coronaCasesApiService: CoronaCasesApiService
    ) { }

    ngOnInit() {
        //this.fetchCasesByDay();
        this.fetchCasesByTimelineWorld();
        this.fetchCasesByTimelineTotal();
    }

    private fetchCasesByDay(): void {
        this.coronaCasesApiService.getCasesByDays().subscribe(
            response => {
                this.casesByDay = response;
            }
        );
    }

    private fetchCasesByTimelineWorld(): void {
        this.coronaCasesApiService.getCasesByTimelineWorld(null).subscribe(
            response => {
                this.casesTimelineWorld = response;
            }
        );
    }
    private fetchCasesByTimelineTotal(): void {
        this.coronaCasesApiService.getCasesByTimelineTotal(null).subscribe(
            response => {
                this.casesTimelineTotal = response;
            }
        );
    }
}
