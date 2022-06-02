import { ApiService } from './../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GeoJSONContract } from 'src/app/models/contracts';
import { SwalDialogService } from 'src/app/services/dialog-service';

@Component({
  selector: 'app-geo-json',
  templateUrl: './geo-json.component.html',
  styleUrls: ['./geo-json.component.scss']
})
export class GeoJSONComponent implements OnInit {

  @Input() registry: string[];
  constructor(
    private apiService: ApiService,
    private dialogService: SwalDialogService
  ) { }

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
    console.log(contract);

    this.apiService.convertGeoJSON(contract).then((x) => {
      if(x) {
        this.dialogService.showSuccessDialog(JSON.stringify(x));
      }
    }).catch(err => this.dialogService.showErrorDialog(err.error.error));

  }

  testItem() {
    //this.GeoJSONForm.controls['GeoJSON'].setValue('{"type":"Point","coordinates":[-80.139145,25.77409]}');
    this.GeoJSONForm.controls['GeoJSON'].setValue(`{
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "MultiLineString",
            "coordinates": [
              [
                [
                  9.231247,
                  48.482832
                ],
                [
                  9.231029,
                  48.48272699999999
                ],
                [
                  9.230776,
                  48.48265899999999
                ],
                [
                  9.230519,
                  48.482582
                ],
                [
                  9.230449,
                  48.48249199999999
                ],
                [
                  9.230528,
                  48.482405
                ]
              ]
            ]
          }
        }
      ]
    }`);
    this.GeoJSONForm.controls['Source'].setValue('EPSG:4326');
    this.GeoJSONForm.controls['Destination'].setValue('EPSG:32633');
  }

}
