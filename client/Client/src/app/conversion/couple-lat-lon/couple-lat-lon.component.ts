import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CoupleLatLonFormContract } from 'src/app/models/contracts';

@Component({
  selector: 'app-couple-lat-lon',
  templateUrl: './couple-lat-lon.component.html',
  styleUrls: ['./couple-lat-lon.component.scss']
})
export class CoupleLatLonComponent implements OnInit {

  constructor() { }

  @Input() registry: string[];

  ngOnInit(): void {

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

  Conversion() {
    const contract = this.GetCoupleLatitudeLongitudeFormContract();
    console.log(contract)
    //this.apiService.
  }

}
