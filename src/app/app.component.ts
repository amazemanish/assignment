import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from './services/restaurant.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatPaginator, MatSort, MatTable } from '@angular/material';
import { Restaurant } from './models/restaurant';
import { BehaviorSubject, Observable, fromEvent, pipe } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, merge, mergeMap, tap } from 'rxjs/operators';

import { AddDialogComponent } from './dialogs/add/add.dialog.component';
import { EditDialogComponent } from './dialogs/edit/edit.dialog.component';
import { DeleteDialogComponent } from './dialogs/delete/delete.dialog.component';
import { RestaurantDataSource } from './datasource/restaurant-data-source';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  displayedColumns = ['id', 'name', 'city', 'country', 'created_at', 'updated_at', 'actions'];
  exampleDatabase: RestaurantService | null;
  dataSource: RestaurantDataSource;
  index: number;
  id: number;
  length: number;
  restaurant: Restaurant;

  constructor(public httpClient: HttpClient,
    public dialog: MatDialog,
    public dataService: RestaurantService) { }

  @ViewChild(MatTable) table: MatTable<Restaurant[]>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  ngOnInit() {
    
    this.loadData();
    
    fromEvent(this.filter.nativeElement,'keyup')
    .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
            this.paginator.pageIndex = 0;
            this.loadRestaurantPage();
        })
    )
    .subscribe();
  }

  refresh() {
    this.loadData();
  }

  addNew(restaurant: Restaurant) {
    const dialogRef = this.dialog.open(AddDialogComponent, {
      data: { restaurant: restaurant }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.loadData();
      }
    });
  }

  startEdit(restaurant) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: restaurant
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        // When using an edit things are little different, firstly we find record inside DataService by id
        this.loadData();
      }
    });
  }

  deleteItem(restaurant) {
    
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: restaurant
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.loadData();
      }
    });
  }


  public loadData() {
    this.dataSource = new RestaurantDataSource(this.dataService);
    this.dataSource.loadRestaurant();

    this.dataService.getAllRestaurant().subscribe(data => {
      this.length = parseFloat(data);
    })
    
  }


  ngAfterViewInit() {

    this.paginator.page
    .pipe(
        tap(() => this.loadRestaurantPage())
    )
    .subscribe();
    
    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    
    pipe(
      merge(this.sort.sortChange, this.paginator.page),
      tap(() => this.loadRestaurantPage())
    )
  }

  

  loadRestaurantPage() {
    this.dataSource.loadRestaurant(this.filter.nativeElement.value, this.sort.direction,
      this.paginator.pageIndex, this.paginator.pageSize);
  }

}