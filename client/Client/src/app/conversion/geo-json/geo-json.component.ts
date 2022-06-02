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
            "type": "Polygon",
            "coordinates": [
              [
                [
                  13.517475128173828,
                  43.61035243286212
                ],
                [
                  13.509063720703125,
                  43.60190005460943
                ],
                [
                  13.523311614990234,
                  43.59854363383666
                ],
                [
                  13.526573181152344,
                  43.601775746067986
                ],
                [
                  13.520050048828125,
                  43.60848803975705
                ],
                [
                  13.517475128173828,
                  43.61035243286212
                ]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  13.496532440185547,
                  43.59232754538541
                ],
                [
                  13.495588302612305,
                  43.58735421230633
                ],
                [
                  13.502111434936523,
                  43.5861108148262
                ],
                [
                  13.502283096313477,
                  43.590897754215206
                ],
                [
                  13.496532440185547,
                  43.59232754538541
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
