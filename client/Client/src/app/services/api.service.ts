import { HttpClient } from '@angular/common/http';
import { AddCreditContract, UsersModel } from './../models/users';

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ArrayLatLonContract, CoupleLatLonFormContract, GeoJSONContract } from '../models/contracts';

@Injectable()
export class ApiService {
  baseUrl: string;
  constructor(private httpClient: HttpClient) {
    this.baseUrl = environment.apiURL;
  }


  getUsers(): Promise<UsersModel[]> {
    return this.getMethod<UsersModel[]>(`${this.baseUrl}/getUsers`);
  }

  getEPSG(): Promise<string[]> {
    return this.getMethod<string[]>(`${this.baseUrl}/getEPSG`);
  }

  /* AddCredit(contract: AddCreditContract, jwt: string): Promise<any> {
    return this.postMethod(`${this.baseUrl}/addCredit`, contract);
  } */

  //for custom JWT as parameter
  AddCredit(contract: AddCreditContract, jwt: string): Observable<Object> {
    return this.httpClient.post(
      `${this.baseUrl}/addCredit`, //url
      contract, //contract into body
      {
        headers: {
          Authorization: `Bearer ${jwt}`
        },
        responseType: 'text' //if not specified could trap in err a 200 response
      }
    );
  }

  convertLatLong(contract: CoupleLatLonFormContract): Promise<number[]> {
    return this.postMethod(`${this.baseUrl}/convertLatLong`, contract );
  }

  convertArrayLatLong(contract: ArrayLatLonContract): Promise<number[][]> {
    return this.postMethod(`${this.baseUrl}/convertArrayLatLong`, contract);
  }

  convertGeoJSON(contract: GeoJSONContract): Promise<string> {
    return this.postMethod(`${this.baseUrl}/convertGeoJSON`, contract);
  }


  //base functions
  postMethod<T>(url: string, body: any): Promise<T> {
    return new Promise<T>((resolve: (value: any) => void, reject: (reason: any) => void) => {
      this.httpClient.post<T>(url, body, {
        headers: {
          Authorization: `Bearer ${environment.userJWT}`
        }, responseType: 'json'
      }).subscribe({
        next: (value) => resolve(value),
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  getMethod<T>(url: string): Promise<T> {
    return new Promise<T>((resolve: (value: any) => void, reject: (reason: any) => void) => {
      this.httpClient.get<T>(url, {
        headers: {
          Authorization: `Bearer ${environment.userJWT}`,
        }
      }).subscribe({
        next: (value) => resolve(value),
        error: (err) => {
          reject(err);
        }
      });
    });
  }

}
