import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { SwalDialogService } from './../services/dialog-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private dialogService: SwalDialogService,
    private fb: FormBuilder
  ) { }

  registry: string[];

  ngOnInit(): void {
    //loading EPSG registry
    this.loadRegistry();
  }

  loadRegistry() {
    this.apiService.getEPSG().subscribe((x: string[]) => {
      if(x) {
        this.registry = x;
        console.log(this.registry)
      }
    }, err => {
      Swal.fire('Error',err.error.error,'error');
    });
  }
}
