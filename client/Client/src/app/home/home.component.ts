import { SwalDialogService } from './../services/dialog-service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { ArrayChords_geoJSON_Contract, coupleLatLong_ArrayChords_Contract, coupleLatLong_GeoJSON_Contract } from '../models/contracts';
import { ApiService } from '../services/api.service';

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
    this.apiService.getEPSG('JWT').subscribe((x: string[]) => {
      if(x) {
        this.registry = x;
        console.log(this.registry)
      }
    }, err => {
      Swal.fire('Error',err.error.error,'error');
    });

  }

  test() {
    this.dialogService.showCredentialsDialog().then( x => {
      if(x) {
        alert('we');
      }
    });
  }

  coupleLatLong_ArrayChords_Form = new FormGroup({
    latitude: new FormControl(''),
    longitude: new FormControl(''),
    arrayChords: new FormControl('')
  });

  coupleLatLong_geoJSON_Form = new FormGroup({
    latitude: new FormControl(''),
    longitude: new FormControl(''),
    geoJSON: new FormControl('')
  });

  ArrayChords_geoJSON_Form = new FormGroup({
    arrayChords: new FormControl(''),
    geoJSON: new FormControl('')
  });


  LatLongToArrayChords() {
    const contract = this.Get_CoupleLatLong_ArrayChords_Contract();
    console.log("LatLongToArrayChords request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  ArrayChordsToLatLong() {
    const contract = this.Get_CoupleLatLong_ArrayChords_Contract();
    console.log("ArrayChordsTolatLong request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  private Get_CoupleLatLong_ArrayChords_Contract(): coupleLatLong_ArrayChords_Contract {
    const contract = new coupleLatLong_ArrayChords_Contract();

    contract.latitude = this.coupleLatLong_ArrayChords_Form.controls['latitude']?.value;
    contract.longitude = this.coupleLatLong_ArrayChords_Form.controls['longitude']?.value;
    contract.arrayChords = this.coupleLatLong_ArrayChords_Form.controls['arrayChords']?.value;

    return contract;
  }

  LatLongToGeoJSON() {
    const contract = this.Get_CoupleLatLong_GeoJSON_Contract();
    console.log("LatLongToGeoJSON request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  GeoJSONToLatLong() {
    const contract = this.Get_CoupleLatLong_GeoJSON_Contract();
    console.log("GeoJSONToLatLong request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  private Get_CoupleLatLong_GeoJSON_Contract(): coupleLatLong_GeoJSON_Contract {
    const contract = new coupleLatLong_GeoJSON_Contract();

    contract.latitude = this.coupleLatLong_geoJSON_Form.controls['latitude']?.value;
    contract.longitude = this.coupleLatLong_geoJSON_Form.controls['longitude']?.value;
    contract.geoJSON = this.coupleLatLong_geoJSON_Form.controls['geoJSON']?.value;

    return contract;
  }

  ArrayChordsToGeoJSON() {
    const contract = this.Get_ArrayChords_GeoJSON_Contract();
    console.log("ArrayChordsToGeoJSON request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  GeoJSONToArrayChords() {
    const contract = this.Get_ArrayChords_GeoJSON_Contract();
    console.log("GeoJSONToArrayChords request", contract);
    Swal.fire({
      title: 'Request',
      text:  JSON.stringify(contract, null, "\t"),
      icon: 'question',
      showCancelButton: true,
      backdrop: true
    }).then((result) => {
        if (result.isConfirmed) {
          //call endpoint

          //spinner


          //show response
          Swal.fire({
            title: `response`
          })
        }
      });
  }

  private Get_ArrayChords_GeoJSON_Contract(): ArrayChords_geoJSON_Contract {
    const contract = new ArrayChords_geoJSON_Contract();

    contract.arrayChords = this.ArrayChords_geoJSON_Form.controls['arrayChords']?.value;
    contract.geoJSON = this.ArrayChords_geoJSON_Form.controls['geoJSON']?.value;

    return contract;
  }

}
