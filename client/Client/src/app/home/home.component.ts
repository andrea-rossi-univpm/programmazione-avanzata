import { SwalDialogService } from './../services/dialog-service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, debounceTime, distinctUntilChanged, filter, merge, map, OperatorFunction } from 'rxjs';
import { CoupleLatLonFormContract } from '../models/contracts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialogService: SwalDialogService
  ) { }

  registry: string[];

  ngOnInit(): void {
    //loading EPSG registry
    this.apiService.getEPSG().subscribe((x: string[]) => {
      if(x) {
        this.registry = x;
        console.log(this.registry)
      }
    }, err => {
      Swal.fire('Error',err.error.error,'error');
    });

  }



  CoupleLatLonForm = new FormGroup({
    Latitude: new FormControl(''),
    Longitude: new FormControl(''),
    Source: new FormControl(''),
    Destination: new FormControl('')
  });


  private GetCoupleLatitudeLongitudeFormContract(): CoupleLatLonFormContract {
    const contract = new CoupleLatLonFormContract();

    contract.Latitude = this.CoupleLatLonForm.controls['Latitude']?.value;
    contract.Longitude = this.CoupleLatLonForm.controls['Longitude']?.value;
    contract.Source = this.CoupleLatLonForm.controls['Source']?.value;
    contract.Destination = this.CoupleLatLonForm.controls['Destination']?.value;

    return contract;
  }

  LatLongConversion() {
    //this.apiService.
  }






  //type ahead settings ///////////////////////////////////////////////////////


  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.registry
        : this.registry.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }
  /////////////////////////////////////////////////////////////////////////////

}
