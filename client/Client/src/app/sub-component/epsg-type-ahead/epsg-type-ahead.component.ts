import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, OperatorFunction, Observable, debounceTime, distinctUntilChanged, filter, merge, map } from 'rxjs';

@Component({
  selector: 'app-epsg-type-ahead',
  templateUrl: './epsg-type-ahead.component.html',
  styleUrls: ['./epsg-type-ahead.component.scss']
})
export class EpsgTypeAheadComponent implements OnInit {

  @Input() label: string = "EPSG label: ";
  @Input() EPSGRegistry: string[];
  @Input() control: FormControl;
  constructor() { }

  ngOnInit(): void {
  }

  //type ahead settings ///////////////////////////////////////////////////////


  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    //const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));

    const clicksWithClosedPopup$ = this.click$.pipe(filter(() =>
    this.instance && !this.instance.isPopupOpen())); //<---HERE

    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.EPSGRegistry
        : this.EPSGRegistry.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }
  /////////////////////////////////////////////////////////////////////////////

}
