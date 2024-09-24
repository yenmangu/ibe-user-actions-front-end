import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	HostListener,
	viewChild,
	AfterViewInit,
	OnDestroy
} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { UserAction } from '../interfaces/user-action';
import { JsonPipe } from '@angular/common';
import { DataService } from '../services/data.service';
import { PdfService } from '../services/pdf.service';
import { PostMessageService } from '../services/post-message.service';

@Component({
	selector: 'app-actions-table',
	standalone: true,
	imports: [JsonPipe, NgIf, NgFor, FormsModule],
	templateUrl: './actions-table.component.html',
	styleUrl: './actions-table.component.scss'
})
export class ActionsTableComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('contentBox', { static: true }) contentEl!: ElementRef;
	@ViewChild('canvas') canvas!: ElementRef;
	private resizeObserver!: ResizeObserver;
	expectedOrigin: string = '';
	queryObject: any = {};
	deviceHistoryArray: any[] = [];
	requestSent: boolean = false;
	tableReady: boolean = false;
	companionOrigin: string = '';
	companionApp: boolean = false;
	parentGameCode: string = '';
	testParams: { gameCode: string; startFrom: string } = {
		gameCode: 'ponty',
		startFrom: '30'
	};
	params: { gameCode: string; startFrom: number } = { gameCode: '', startFrom: 1 };
	receivedGameCode: string = '';
	errorDisplay: { display: boolean; message: string } = {
		display: false,
		message: ''
	};

	constructor(
		private http: HttpService,
		private data: DataService,
		private pdf: PdfService,
		private message: PostMessageService,
		private el: ElementRef
	) {}

	@HostListener('window:resize', ['$event'])
	onResize(event: Event): void {
		this.sendHeight();
	}

	@HostListener('window:message', ['$event'])
	onMessage(event: MessageEvent) {
		// console.log('Message: ', event);

		if (!event || !event.data) {
			return;
		}
		if (event.data.appOrigin) {
			// console.log('Event: ', event);

			const targetOrigin = this.message.getParentOrigin(event);
			if (targetOrigin === null) {
				console.warn('No target origin found from the event');
				return;
			}
			this.companionOrigin = targetOrigin;

			const height: number = this.getHeight();
			this.message.attemptPostMessage(height, targetOrigin);
			this.sendHeight();
			if (event.data.gamecode) {
				// console.log('Event data gamnecode: ', event.data.gamecode);

				if (event.origin === this.companionOrigin) {
					// console.log('event origin matches companion origin');

					this.params.gameCode = event.data.gamecode;
					this.companionApp = true;
				}
			} else {
				return;
			}
		}
	}
	ngOnInit(): void {
		this.companionApp = false;
	}

	ngAfterViewInit(): void {
		this.observeContentHeight();
	}

	private observeContentHeight(): void {
		if (this.contentEl) {
			this.resizeObserver = new ResizeObserver(entries => {
				for (const entry of entries) {
					const newHeight = entry.contentRect.height;
					this.sendHeight();
				}
			});
			this.resizeObserver.observe(this.contentEl.nativeElement);
		}
	}

	private makeRequest(params) {
		// console.log('New Request: ');
		this.requestSent = true;

		this.http.reqData(params).subscribe({
			next: response => {
				// console.log('Response: ', response);
				this.data
					.processData(response.xml)
					.then(result => {
						this.queryObject = result;
						if (result) {
							this.tableReady = true;
							this.queryObject = result;
							if (result.historyArray) {
								this.deviceHistoryArray = result.historyArray;
								this.sendHeight();
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

	private sendHeight(): void {
		const height = this.getHeight();
		const targetOrigin = this.companionOrigin;
		this.message.attemptPostMessage(height, targetOrigin);
	}

	private getHeight() {
		const el = this.contentEl.nativeElement;
		const rect = el.getBoundingClientRect();
		return rect.height;
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

	public handleClick(): void {
		this.resetBools();
		const reqParams = {
			gameCode: this.params.gameCode,
			startFrom: this.params.startFrom.toString()
		};
		this.makeRequest(reqParams);
	}

	public handlePDF(): void {
		if (this.canvas) {
			this.pdf.downloadPDF(
				this.canvas.nativeElement,
				`${this.params.gameCode}-${this.queryObject.dateRange}.pdf`
			);
		}
	}

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

	ngOnDestroy(): void {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
	}
}
