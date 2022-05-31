import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GeoJSONContract } from 'src/app/models/contracts';

@Component({
  selector: 'app-geo-json',
  templateUrl: './geo-json.component.html',
  styleUrls: ['./geo-json.component.scss']
})
export class GeoJSONComponent implements OnInit {

  @Input() registry: string[];
  constructor() { }

  ngOnInit(): void {
  }

  GeoJSONForm = new FormGroup({
    GeoJSON: new FormControl(''),
    Source: new FormControl(''),
    Destination: new FormControl('')
  });

  private GetGeoJSONFormContract(): GeoJSONContract {
    const contract = new GeoJSONContract();

    contract.GeoJSON = this.GeoJSONForm.controls['GeoJSON']?.value;
    contract.Source = this.GeoJSONForm.controls['Source']?.value;
    contract.Destination = this.GeoJSONForm.controls['Destination']?.value;

    return contract;
  }

  Conversion() {
    const contract = this.GetGeoJSONFormContract();
    console.log(contract)
    //this.apiService.
  }

}
