import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PostMessageService {
	originArray: string[] = [
		'http://localhost:4200',
		'http://192.168.68.100:4200',
		'https://dev.companion.ibescore.com',
		'https://companion.ibescore.com'
	];

	constructor() {}

	private getTargetOrigin() {}

	public attemptPostMessage(height: number, targetOrigin: string) {
		// console.log('Attempt Post Message in message service invoked');

		const data: any = { frameHeight: height };
		window.parent.postMessage(data, targetOrigin);
	}

	public getParentOrigin(event: MessageEvent): string | null {
		if (!event.data.appOrigin) {
			console.log('App Origin not found in MessageEvent');

			return null;
		} else {
			return event.data.appOrigin;
		}
	}
}
