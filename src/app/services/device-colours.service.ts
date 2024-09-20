import { Injectable } from '@angular/core';
import randomColor from 'randomcolor';

@Injectable({
	providedIn: 'root'
})
export class DeviceColoursService {
	constructor() {}

	public returnRandomColour(deviceCount, lightMode = true): string[] {
		const luminosity = lightMode ? 'dark' : 'light';
		return randomColor({ count: deviceCount, luminosity: luminosity });
	}
}
