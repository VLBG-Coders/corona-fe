import { has } from 'lodash';
import { Injectable } from '@angular/core';

@Injectable()
export class DataStorageService {
    public appDataStorage: any = {};

    /**
     * Stores app data.
     */
    public setAppStorageData(dataKey: string, data: any): void {
        this.appDataStorage[dataKey] = data;
    }

    /**
     * Returns the app data.
     */
    public getAppStorageData(dataKey: string): any {
        if (!has(this.appDataStorage, dataKey)) {
            return undefined;
        }

        return this.appDataStorage[dataKey];
    }
}
