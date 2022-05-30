import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { CredentialsModel } from "../models/users";

@Injectable({
  providedIn: 'root'
})
export class SwalDialogService {


  constructor(
  ) {}

  showSuccessDialog(title: string, msg: string) {
    this.showDialog(title, msg, 'success');
  }

  showWarningDialog(title: string, msg: string) {
    this.showDialog(title, msg, 'warning');
  }

  showErrorDialog(title: string, msg: string) {
    this.showDialog(title, msg, 'error');
  }

  showDialog(title: string, msg:string, icon: SweetAlertIcon) {
    Swal.fire({
      title: title,
      text: msg,
      icon: icon,
      showClass: {
        popup: 'animated zoomIn fasterIn top-margin-custom'
      },
      hideClass: {
        popup: 'animated zoomOut fasterOut top-margin-custom'
      }
    });
  }


/*   askConfirmation(title: string, message: string): Promise<boolean> {
    return (this.showConfirmDialog(null, title, message) as Promise<boolean>);
  }

  showConfirmDialog(myFunction, title: string, text: string, confirm: string = 'CONFIRM', cancel: string = 'CANCEL', showCancel: boolean = true, myIcon: SweetAlertIcon = 'question'): Promise<boolean> | void {
    const ret = Swal.fire({
      title: this.translate.instant(title),
      text: text ? this.translate.instant(text) : '',
      icon: myIcon,
      showCancelButton: showCancel,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#ef5350',
      confirmButtonText: '<i class="fa fa-check button-icon"></i>' + this.translate.instant(confirm),
      cancelButtonText: '<i class="fa fa-times button-icon"></i>' + this.translate.instant(cancel),
      showClass: {
        popup: 'animated zoomIn fasterIn top-margin-custom'
      },
      hideClass: {
        popup: 'animated zoomOut fasterOut top-margin-custom'
      }
    });
    if (myFunction) {
      ret.then((result) => {
        if (result.value) {
          myFunction();
        }
      });
    } else {
      return new Promise<boolean>((resolve, reject) => {
        ret.then((x: any) => {
          resolve(x.value === true);
        })
        .catch(x => reject(x));
      });
    }
  } */


  async showCredentialsDialog(): Promise<void | string>{

    let myInputOptions: Map<string, string> = new Map<string, string>();
    myInputOptions.set(environment.userJWT, 'AROSSI JWT');
    myInputOptions.set(environment.adminJWT, 'AMANCINI JWT');
    myInputOptions.set('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ!', 'MALFORMED JWT');

    let swalResult = await Swal.fire<any>({
      title: 'Select auth token',
      input: 'select',
      inputOptions: myInputOptions,
      width: '750px',
      showCancelButton: true,
      showLoaderOnConfirm: true,
    });

    if(swalResult && swalResult.value && swalResult.isConfirmed === true) {
      return Promise.resolve(swalResult.value);
    } else {
      return Promise.reject('');
    }
  }


}
