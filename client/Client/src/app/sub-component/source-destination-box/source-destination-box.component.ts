import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-source-destination-box',
  templateUrl: './source-destination-box.component.html',
  styleUrls: ['./source-destination-box.component.scss']
})
export class SourceDestinationBoxComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() EPSGRegistry: string[];

  constructor() { }

  ngOnInit(): void {
  }

}
