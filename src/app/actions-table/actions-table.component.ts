import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { UserAction } from '../interfaces/user-action';
import { JsonPipe } from '@angular/common';
import { DataService } from '../services/data.service';
import { PdfService } from '../services/pdf.service';

@Component({
	selector: 'app-actions-table',
	standalone: true,
	imports: [JsonPipe, NgIf, NgFor, FormsModule],
	templateUrl: './actions-table.component.html',
	styleUrl: './actions-table.component.scss'
})
export class ActionsTableComponent implements OnInit {
	@ViewChild('canvas') canvas!: ElementRef;

	queryObject: any = {};
	deviceHistoryArray: any[] = [];
	requestSent: boolean = false;
	tableReady: boolean = false;
	testParams: { gameCode: string; startFrom: string } = {
		gameCode: 'ponty',
		startFrom: '30'
	};
	params: { gameCode: string; startFrom: number } = { gameCode: '', startFrom: 1 };

	errorDisplay: { display: boolean; message: string } = {
		display: false,
		message: ''
	};

	constructor(
		private http: HttpService,
		private data: DataService,
		private pdf: PdfService
	) {}
	ngOnInit(): void {}
	handleClick() {
		this.resetBools();
		const reqParams = {
			gameCode: this.params.gameCode,
			startFrom: this.params.startFrom.toString()
		};
		this.makeRequest(reqParams);
	}
	private makeRequest(params) {
		console.log('New Request: ');
		this.requestSent = true;

		this.http.reqData(params).subscribe({
			next: response => {
				console.log('Response: ', response);
				this.data
					.processData(response.xml)
					.then(result => {
						this.queryObject = result;
						if (result) {
							this.tableReady = true;
							this.queryObject = result;
							if (result.historyArray) {
								this.deviceHistoryArray = result.historyArray;
							}
						}
					})
					.catch(error => {
						this.handleError(error);
					});
			},
			error: err => {
				this.handleError(err);
			}
		});
	}

	private handleError(error: any): void {
		this.errorDisplay.display = true;
		if (error.status && error.status === 500) {
			this.errorDisplay.message = 'Internal Server Error';
			return;
		}
		if (error.message === 'nonposint') {
			this.errorDisplay.message = 'Please provide a valid start from';
		}
		this.errorDisplay.message = error.message;
		console.error('Error: ', error);
	}

	private resetBools(): void {
		this.errorDisplay = { display: false, message: '' };
		this.requestSent = false;
		this.tableReady = false;
	}

	public setColour(device) {}

	public returnStringDate(action) {
		if (!action?.timeMeta) {
			return 'No Date Found';
		}
		const { epoch, format } = action.timeMeta;
		if (typeof epoch === 'string') {
			const epochNum = Number(epoch);
			return new Date(epochNum * 1000).toString();
		} else if (typeof epoch === 'number') {
			const time = new Date(epoch * 1000).toLocaleTimeString();
			return `${time}\t${format}`;
		} else return 'No Date Found';
	}

	public handlePDF(): void {
		if (this.canvas) {
			this.pdf.downloadPDF(
				this.canvas.nativeElement,
				`${this.params.gameCode}-${this.queryObject.dateRange}.pdf`
			);
		}
	}
}
