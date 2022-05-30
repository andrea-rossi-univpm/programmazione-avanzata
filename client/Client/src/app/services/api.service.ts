import { HttpClient } from '@angular/common/http';
import { AddCreditContract, UsersModel } from './../models/users';

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {
  baseUrl: string;
  constructor(private httpClient: HttpClient) {
    this.baseUrl = environment.apiURL;
  }

  /* getUsers(): Promise<UsersModel> {
    return this.get<UsersModel>(`GetClaims`);
  } */

  /* createDemoData(item: DemoModel) {
    return this.post(`createSample`, item);
  } */

  getUsers(jwt: string): Observable<UsersModel[]> {
    return this.httpClient.get<UsersModel[]>(
      `${this.baseUrl}/getUsers`, {
        headers: {
          Authorization: `Bearer ${environment.jwt}`,
        }
      }
    );
  }

  getEPSG(jwt: string): Observable<string[]> {
    return this.httpClient.get<string[]>(
      `${this.baseUrl}/getEPSG`, {
        headers: {
          Authorization: `Bearer ${environment.jwt}`,
        }
      }
    );
  }

  AddCredit(contract: AddCreditContract, jwt: string): Observable<Object> {
    return this.httpClient.post(
      `${this.baseUrl}/addCredit`, //url
      contract, //contract into body
      {
        headers: {
          Authorization: `Bearer ${environment.jwt}`
        },
        responseType: 'text' //if not specified could trap in err a 200 response
      }
    );
  }

}
