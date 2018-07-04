import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Restaurant } from './../models/restaurant';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly API_URL = 'http://127.0.0.1:8000/api/restaurant/';

  dataChange: BehaviorSubject<Restaurant[]> = new BehaviorSubject<Restaurant[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;

  constructor(private httpClient: HttpClient, private matsnackbar: MatSnackBar) { }

  get data(): Restaurant[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  /** CRUD METHODS */
  getAllRestaurant() {
    return this.httpClient.get(this.API_URL).pipe(
      map(res => res['count'])
    );
  }

  findRestaurant(filter = '', sortOrder = 'asc',
    pageNumber = 0, pageSize = 3): Observable<Restaurant[]> {

    return this.httpClient.get(this.API_URL, {
      params: new HttpParams()
        .set('filter', filter)
        .set('sortOrder', sortOrder)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    }).pipe(
      map(res => res['data'])
    );
  }

  addRestaurant(restaurant: Restaurant) {

    this.httpClient.post(this.API_URL, restaurant).subscribe(data => {
      this.dialogData = restaurant;
      this.matsnackbar.open('Successfully added');
    },
      (err: HttpErrorResponse) => {
        this.matsnackbar.open('Error occurred. Details: ' + err.name + ' ' + err.message);
      });
  }

  updateIssue(restaurant: Restaurant): void {
    this.httpClient.put(this.API_URL + restaurant.id, restaurant).subscribe(data => {
      this.dialogData = restaurant;
      this.matsnackbar.open('Successfully edited');
    },
    (err: HttpErrorResponse) => {
      this.matsnackbar.open('Error occurred. Details: ' + err.name + ' ' + err.message);
    }
  );
  }

  deleteIssue(id: number): void {
    this.httpClient.delete(this.API_URL + id).subscribe(data => {
      console.log(data['']);
      this.matsnackbar.open('Successfully deleted');
      },
      (err: HttpErrorResponse) => {
        this.matsnackbar.open('Error occurred. Details: ' + err.name + ' ' + err.message);
      }
    );
  }
}

