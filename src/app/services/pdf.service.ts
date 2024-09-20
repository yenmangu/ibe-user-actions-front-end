import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class PdfService {
	prod = environment.PROD;
	constructor() {}

	public downloadPDF(
		element: HTMLElement,
		fileName: string = 'User Action History.pdf'
	): void {
		html2canvas(element, { logging: this.prod ? false : true }).then(canvas => {
			const topMargin = 10; // margin in mm
			const leftMargin = 10;
			const fileWidth = 208;
			const fileHeight = (canvas.height * fileWidth) / canvas.width;
			const fileURI = canvas.toDataURL('image/png');
			const PDF = new jsPDF('p', 'mm', 'a4');
			const position = 0;
			const positionX = leftMargin;
			const positionY = topMargin;
			PDF.addImage(fileURI, 'PNG', positionX, positionY, fileWidth, fileHeight);
			PDF.save(fileName);
		});
	}
}
