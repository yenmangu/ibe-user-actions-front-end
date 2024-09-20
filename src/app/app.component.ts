import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActionsTableComponent } from './actions-table/actions-table.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, ActionsTableComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent {
	title = 'security-actions';
}
