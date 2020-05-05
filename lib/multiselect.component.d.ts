import { OnInit, OnDestroy, SimpleChanges, OnChanges, ChangeDetectorRef, AfterViewChecked, EventEmitter, ElementRef } from '@angular/core';
import { ControlValueAccessor, Validator, FormControl } from '@angular/forms';
import { DropdownSettings } from './multiselect.interface';
import { ListFilterPipe } from './list-filter';
import { Item, Badge, Search } from './menu-item';
import { DataService } from './multiselect.service';
import { Subscription, Subject } from 'rxjs';
export declare const DROPDOWN_CONTROL_VALUE_ACCESSOR: any;
export declare const DROPDOWN_CONTROL_VALIDATION: any;
export declare class AngularMultiSelect implements OnInit, ControlValueAccessor, OnChanges, Validator, AfterViewChecked, OnDestroy {
    _elementRef: ElementRef;
    private cdr;
    private ds;
    data: Array<any>;
    settings: DropdownSettings;
    loading: boolean;
    onSelect: EventEmitter<any>;
    onDeSelect: EventEmitter<any>;
    onSelectAll: EventEmitter<Array<any>>;
    onDeSelectAll: EventEmitter<Array<any>>;
    onOpen: EventEmitter<any>;
    onClose: EventEmitter<any>;
    onScrollToEnd: EventEmitter<any>;
    onFilterSelectAll: EventEmitter<Array<any>>;
    onFilterDeSelectAll: EventEmitter<Array<any>>;
    onAddFilterNewItem: EventEmitter<any>;
    onGroupSelect: EventEmitter<any>;
    onGroupDeSelect: EventEmitter<any>;
    itemTempl: Item;
    badgeTempl: Badge;
    searchTempl: Search;
    searchInput: ElementRef;
    selectedListElem: ElementRef;
    dropdownListElem: ElementRef;
    onEscapeDown(event: KeyboardEvent): void;
    virtualdata: any;
    searchTerm$: Subject<string>;
    filterPipe: ListFilterPipe;
    selectedItems: Array<any>;
    isActive: boolean;
    isSelectAll: boolean;
    isFilterSelectAll: boolean;
    isInfiniteFilterSelectAll: boolean;
    groupedData: Array<any>;
    filter: any;
    chunkArray: any[];
    scrollTop: any;
    chunkIndex: any[];
    cachedItems: any[];
    groupCachedItems: any[];
    totalRows: any;
    itemHeight: any;
    screenItemsLen: any;
    cachedItemsLen: any;
    totalHeight: any;
    scroller: any;
    maxBuffer: any;
    lastScrolled: any;
    lastRepaintY: any;
    selectedListHeight: any;
    filterLength: any;
    infiniteFilterLength: any;
    viewPortItems: any;
    item: any;
    dropdownListYOffset: number;
    subscription: Subscription;
    defaultSettings: DropdownSettings;
    randomSize: boolean;
    parseError: boolean;
    filteredList: any;
    virtualScroollInit: boolean;
    private virtualScroller;
    constructor(_elementRef: ElementRef, cdr: ChangeDetectorRef, ds: DataService);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    ngAfterViewInit(): void;
    ngAfterViewChecked(): void;
    onItemClick(item: any, index: number, evt: Event): boolean;
    validate(c: FormControl): any;
    private onTouchedCallback;
    private onChangeCallback;
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    trackByFn(index: number, item: any): any;
    isSelected(clickedItem: any): boolean;
    addSelected(item: any): void;
    removeSelected(clickedItem: any): void;
    toggleDropdown(evt: any): boolean;
    openDropdown(): boolean;
    closeDropdown(): void;
    closeDropdownOnClickOut(): void;
    toggleSelectAll(): void;
    filterGroupedList(): void;
    toggleFilterSelectAll(): void;
    toggleInfiniteFilterSelectAll(): void;
    clearSearch(): void;
    onFilterChange(data: any): void;
    cloneArray(arr: any): any;
    updateGroupInfo(item: any): void;
    transformData(arr: Array<any>, field: any): Array<any>;
    filterInfiniteList(evt: any): void;
    resetInfiniteSearch(): void;
    onScrollEnd(e: any): void;
    ngOnDestroy(): void;
    selectGroup(item: any): void;
    addFilterNewItem(): void;
    calculateDropdownDirection(): void;
    openTowardsTop(value: boolean): void;
    clearSelection(e: any): void;
}
export declare class AngularMultiSelectModule {
}
