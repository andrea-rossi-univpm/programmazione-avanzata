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


  async showCredentialsDialog(): Promise<void | CredentialsModel>{
    let swalResult = await Swal.fire<any>({
      title: 'Auth',
      html: `
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" class="swal2-input" placeholder="Email" value="andrea@">
        </div>
        <div class="form-group">
          <label for="token">Token:</label>
          <input type="text" id="token" class="swal2-input" placeholder="JWT Token"
            value="${environment.apiURL}"
          >
        </div>
      `,
      width: '750px',
      showCancelButton: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const _email = (Swal.getPopup()?.querySelector('#email') as any).value;
        const _token = (Swal.getPopup()?.querySelector('#token')as any).value;
        if (!_email || !_token) {
          Swal.showValidationMessage('Invalid form');
        }
        return { email: _email, token: _token };
      }

    });

    if(swalResult && swalResult.value) {
      const auth = new CredentialsModel();
      auth.Email = swalResult.value._email;
      auth.Token = swalResult.value._token;
      return Promise.resolve(auth);
    } else {
      return Promise.reject('');
    }
  }


}
