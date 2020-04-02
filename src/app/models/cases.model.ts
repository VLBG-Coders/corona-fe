export class CasesDailyModel {
    confirmed?: number = null;
    date?: string = null;
    deaths?: number = null;
    recovered?: number = null;
}

export class CasesTotalModel {
    confirmed?: number = null;
    date?: string = null;
    deaths?: number = null;
    delta_confirmed?: number = null;
    delta_recovered?: number = null;
    recovered?: number = null;
}
