import { SwalDialogService } from './../services/dialog-service';
import { UsersModel } from './../models/users';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-redis-management',
  templateUrl: './redis-management.component.html',
  styleUrls: ['./redis-management.component.scss']
})
export class RedisManagementComponent implements OnInit {

  users: UsersModel[];
  constructor(
    private apiService: ApiService,
    private dialogService: SwalDialogService
    ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().then((x: UsersModel[]) => {
        if(x) {
          this.users = x;
        }
      }).catch( err => this.dialogService.showErrorDialog(err));
  }

  async addCredit(email: string) {

    this.dialogService.showCredentialsDialog().then( async jwt => {
        if(jwt) {
          let swalResult = await Swal.fire<any>({
            title: 'How many credits?',
            icon: 'question',
            input: 'range',
            inputValue: 10
          });

          if(swalResult && swalResult.value) {
            const creditToAdd = parseInt(swalResult.value);
            if(Number.isInteger(creditToAdd)) {
              this.apiService.AddCredit({
                CreditToAdd: creditToAdd,
                Email: email
              }, jwt).subscribe((x) => {
                  if(x) {
                    this.dialogService.showSuccessDialog(x.toString());
                  }
                }, err => {
                  this.dialogService.showErrorDialog(err.error.error)
                }
              );
            } else {
              Swal.fire('Error','Error while parsing credits','error');
            }

          }
        }
    });
  }

}
