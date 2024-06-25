import {Component, Input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() title: string | undefined;
  @Input() value: number | string | undefined;
}
