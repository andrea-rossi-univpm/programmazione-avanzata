import { SwalDialogService } from './../../services/dialog-service';
import { ApiService } from './../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CoupleLatLonFormContract } from 'src/app/models/contracts';

@Component({
  selector: 'app-couple-lat-lon',
  templateUrl: './couple-lat-lon.component.html',
  styleUrls: ['./couple-lat-lon.component.scss']
})
export class CoupleLatLonComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialogService: SwalDialogService
    ) { }

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
    console.log(contract);

    this.apiService.convertLatLong(contract).then((x) => {
      if(x) {
        this.dialogService.showSuccessDialog(JSON.stringify(x));
      }
    }).catch(err => this.dialogService.showErrorDialog(err.error));

  }

}
