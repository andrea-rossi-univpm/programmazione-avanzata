import { ApiService } from './../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ArrayLatLonContract } from 'src/app/models/contracts';
import { SwalDialogService } from 'src/app/services/dialog-service';

@Component({
  selector: 'app-array-lat-lon',
  templateUrl: './array-lat-lon.component.html',
  styleUrls: ['./array-lat-lon.component.scss']
})
export class ArrayLatLonComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogService: SwalDialogService
    ) { }

  @Input() registry: string[];

  ngOnInit(): void {

  }

  ArrayLatLonForm = new FormGroup({
    Source: new FormControl(''),
    Destination: new FormControl(''),
    ArrayLatLon:  this.fb.array([])
  });

  get ArrayLatLon() {
    return this.ArrayLatLonForm.controls["ArrayLatLon"] as FormArray;
  }

  addItem() {
    this.ArrayLatLon.push(
      this.fb.group({
        Latitude: [''],
        Longitude:['']
      })
    );
  }

  deleteItem(idx: number) {
    this.ArrayLatLon.removeAt(idx);
  }

  private GetArrayLatLonFormContract(): ArrayLatLonContract {
    const contract = new ArrayLatLonContract();

    const myArray: number[][] = [];
    this.ArrayLatLonForm.controls['ArrayLatLon'].value.forEach( (x: any) => {
      const latLon = Object.values(x) as Array<number>;
      myArray.push(latLon);
    });

    contract.ArrayLatLon = myArray;
    contract.Source = this.ArrayLatLonForm.controls['Source']?.value;
    contract.Destination = this.ArrayLatLonForm.controls['Destination']?.value;

    return contract;
  }

  Conversion() {
    const contract = this.GetArrayLatLonFormContract();
    console.log(contract);

    this.apiService.convertArrayLatLong(contract).then((x) => {
      if(x) {
        this.dialogService.showSuccessDialog(JSON.stringify(x));
      }
    }).catch(err => this.dialogService.showErrorDialog(err.error.error));

  }

}
