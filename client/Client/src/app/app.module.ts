import { ApiService } from './services/api.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RedisManagementComponent } from './redis-management/redis-management.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SwalDialogService } from './services/dialog-service';
import { EpsgTypeAheadComponent } from './sub-component/epsg-type-ahead/epsg-type-ahead.component';
import { SourceDestinationBoxComponent } from './sub-component/source-destination-box/source-destination-box.component';
import { CoupleLatLonComponent } from './conversion/couple-lat-lon/couple-lat-lon.component';
import { ArrayLatLonComponent } from './conversion/array-lat-lon/array-lat-lon.component';
import { GeoJSONComponent } from './conversion/geo-json/geo-json.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RedisManagementComponent,
    NotFoundComponent,
    EpsgTypeAheadComponent,
    SourceDestinationBoxComponent,
    CoupleLatLonComponent,
    ArrayLatLonComponent,
    GeoJSONComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    ApiService,
    SwalDialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
