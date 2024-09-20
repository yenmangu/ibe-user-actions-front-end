import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { UserAction } from '../interfaces/user-action';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	apiUrl = environment.API_URL;
	constructor(private http: HttpClient) {}

	reqData(params: { gameCode: string; startFrom: string }): Observable<any> {
		const urlParams = { GAMECODE: params.gameCode, STARTFROM: params.startFrom };
		return this.http
			.get<any>(`${this.apiUrl}/data`, {
				params: urlParams
			})
			.pipe(tap(actions => console.log('Actions: ', actions)));
	}
}
