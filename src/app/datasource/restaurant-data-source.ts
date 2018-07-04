import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, Observable, fromEvent, pipe, of } from 'rxjs';

import { Restaurant } from './../models/restaurant';
import { RestaurantService } from './../services/restaurant.service';
import { catchError, finalize } from "rxjs/operators";
export class RestaurantDataSource implements DataSource<Restaurant> {

    private restaurantSubject = new BehaviorSubject<Restaurant[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private coursesService: RestaurantService) {}

    connect(collectionViewer: CollectionViewer): Observable<Restaurant[]> {
        return this.restaurantSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.restaurantSubject.complete();
        this.loadingSubject.complete();
    }

    loadRestaurant(filter = '',
                sortDirection = 'asc', pageIndex = 0, pageSize = 3) {

        this.loadingSubject.next(true);

        this.coursesService.findRestaurant(filter, sortDirection,
            pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(restaurants => this.restaurantSubject.next(restaurants));
    } 
    
}