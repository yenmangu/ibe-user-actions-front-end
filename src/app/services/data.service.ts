import { Injectable } from '@angular/core';
import { timestamp } from 'rxjs';
import { parseString } from 'xml2js';
import { DeviceColoursService } from './device-colours.service';

@Injectable({
	providedIn: 'root'
})
export class DataService {
	constructor(private colours: DeviceColoursService) {}

	public async processData(xmlString: string): Promise<any> {
		try {
			const xmlObject = await this.parseXml(xmlString);
			console.log('xml object: ', xmlObject);

			if (!this.checkHistoryExists) {
				throw new Error('No History');
			}

			const queryObject = this.getHistoryByDevice(xmlObject);
			const arrayFromEntries = this.makeArray(queryObject.deviceHistory);
			const dateRangeString: string = this.getDateRange(queryObject);
			queryObject.historyArray = arrayFromEntries;
			queryObject.dateRange = dateRangeString;
			console.log('Query Object: ', queryObject);

			return queryObject;
		} catch (error) {
			// console.error('Error in try / catch process data', error);
			throw error;
		}
	}

	private parseXml(xmlData: any): Promise<any> {
		return new Promise((resolve, reject) => {
			parseString(xmlData, { explicitArray: false }, (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	private checkHistoryExists(xmlObject): boolean {
		const { logquery } = xmlObject;
		if (!logquery.device) {
			return false;
		} else {
			return true;
		}
	}

	private getHistoryByDevice(xmlObject) {
		console.log('XML Object: ', xmlObject);
		let queryMetaData: any = {};
		let queryObject: any = {};
		let actionHistory: any[] = [];
		let deviceHistory: any = {};
		const { logquery } = xmlObject;
		const {
			logquery: { $ }
		} = xmlObject;

		queryMetaData = $;

		console.log('$: ', queryMetaData);
		if (!logquery.device) {
			throw new Error('No history recorded');
		}
		if (!logquery.device.length) {
			console.log('device not an array');
			logquery.device = [logquery.device];
		}

		const { device }: { device: any[] } = logquery;

		// console.log('Device from destructure: ', device);

		// console.log('Logquery after array assignment: ', logquery);
		let tempDeviceArray: string[] = [];

		console.log('TempArray: ', tempDeviceArray);

		/**
		 * Loop through each device and process the history string into an array of 'history elements
		 */
		device.forEach((e, index) => {
			const deviceId: string = e.$.uuid;
			tempDeviceArray.push(deviceId);
			const history: string = e.history.trim();
			const historyArray = history.split('\n');

			historyArray.forEach(actionString => {
				actionString.trim();

				const actionBreakdown = this.breakdownAction(actionString);

				// Add device ID to actionBreakdown Object
				actionBreakdown.deviceId = deviceId;
				actionHistory.push(actionBreakdown);
			});

			deviceHistory[deviceId] = historyArray;
		});

		// Get all UNIQUE devices from the device array
		const deviceSet = [...new Set(tempDeviceArray)];
		const deviceCount = deviceSet.length;

		// Get enough UNIQUE colours for the UNIQUE devices
		const deviceColourArray = this.getColours(deviceCount);

		queryObject.deviceColours = this.assignColours(deviceSet, deviceColourArray);
		queryObject.metaData = queryMetaData;
		queryObject.deviceHistory = deviceHistory;
		queryObject.actionHistory = actionHistory;
		console.log('Query Object after breakdown: ', queryObject);

		return queryObject;
	}

	private assignColours(deviceSet, colourArray) {
		if (deviceSet.length !== colourArray.length) {
			return new Error('Unique device count not the same as unique colour count');
		}
		const deviceColours: any = {};

		deviceSet.forEach((device, i) => {
			deviceColours[device] = colourArray[i];
		});
		return deviceColours;
	}

	private getColours(deviceCount: number): any {
		return this.colours.returnRandomColour(deviceCount);
	}

	private breakdownAction(actionString): any {
		const actionBreakdown: any = {};
		const actions = actionString.split('"');
		actions.forEach((action, i) => {
			const actionArray = action.split(',');
			actionArray.forEach((e, i) => {
				const values = this.getValues(e, i);
				actionBreakdown[values.name] = values;
			});
		});

		return actionBreakdown;
	}
	// { key: string; value: string | Date; additional? : any }

	private getValues(actionPair: string, index: number): any {
		const unit: any = {};
		const keyValue = actionPair.split(':');
		switch (keyValue[0]) {
			case 'TM':
				const epoch = Number(keyValue[1]);
				const timeMeta = {
					name: 'timeMeta',
					epoch: epoch,
					fullDate: new Date(epoch * 1000),
					format: this.getFormatDate(epoch)
				};
				return timeMeta;
			case 'GC':
				return { name: 'gameCode', gameCode: keyValue[1] };
			case 'NO':
				const uNumber = { name: 'uNumber', number: keyValue[1] };
				return uNumber;

			case 'AT':
				const uType = { name: 'uType', unitType: keyValue[1] };
				return uType;
			case 'CD':
				return { name: 'command', command: keyValue[1] };
			case 'DT':
				return { name: 'details', details: keyValue[1] };
			case 'SE':
				return { name: 'SE', SE: 'unknown prop' };
			case 'AI':
				return { name: 'AI', AI: 'unknown prop' };
			default:
				return { name: `unknownProp_${index}` };
		}
	}

	private getDateRange(queryObject: { actionHistory: any[] }) {
		const dateArray: any[] = [];
		const now = this.getFormatDate(new Date().getTime(), true, true);
		queryObject.actionHistory.forEach(action => {
			if (action.timeMeta) {
				dateArray.push(action.timeMeta.epoch);
			}
		});
		dateArray.sort();
		console.log();

		const startDate = this.getFormatDate(dateArray[0], true);
		// const endDate = this.getFormatDate(dateArray[dateArray.length - 1], true);

		return `${startDate}-${now}`;
	}
	private makeArray(object: any): any[] {
		const array = Array.from(Object.entries(object));
		// console.log('Array from entries: ', array);
		return array;
	}
	public getFormatDate(
		epoch: number,
		underscore: boolean = false,
		ms: boolean = false
	): any {
		const date = new Date(ms ? epoch : epoch * 1000);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		if (underscore) {
			return `${day}_${month}_${year}`;
		} else {
			return `${day}-${month}-${year}`;
		}
	}
}
