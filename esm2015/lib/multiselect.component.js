/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, HostListener, NgModule, ChangeDetectorRef, ViewEncapsulation, ContentChild, ViewChild, forwardRef, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MyException } from './multiselect.model';
import { ClickOutsideDirective, ScrollDirective, styleDirective, setPosition } from './clickOutside';
import { ListFilterPipe } from './list-filter';
import { Item, Badge, Search, TemplateRenderer, CIcon } from './menu-item';
import { DataService } from './multiselect.service';
import { Subject } from 'rxjs';
import { VirtualScrollerModule, VirtualScrollerComponent } from './virtual-scroll/virtual-scroll';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
/** @type {?} */
export const DROPDOWN_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef((/**
     * @return {?}
     */
    () => AngularMultiSelect)),
    multi: true
};
/** @type {?} */
export const DROPDOWN_CONTROL_VALIDATION = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef((/**
     * @return {?}
     */
    () => AngularMultiSelect)),
    multi: true,
};
/** @type {?} */
const noop = (/**
 * @return {?}
 */
() => {
});
const ɵ0 = noop;
export class AngularMultiSelect {
    /**
     * @param {?} _elementRef
     * @param {?} cdr
     * @param {?} ds
     */
    constructor(_elementRef, cdr, ds) {
        this._elementRef = _elementRef;
        this.cdr = cdr;
        this.ds = ds;
        this.onSelect = new EventEmitter();
        this.onDeSelect = new EventEmitter();
        this.onSelectAll = new EventEmitter();
        this.onDeSelectAll = new EventEmitter();
        this.onOpen = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onScrollToEnd = new EventEmitter();
        this.onFilterSelectAll = new EventEmitter();
        this.onFilterDeSelectAll = new EventEmitter();
        this.onAddFilterNewItem = new EventEmitter();
        this.onGroupSelect = new EventEmitter();
        this.onGroupDeSelect = new EventEmitter();
        this.virtualdata = [];
        this.searchTerm$ = new Subject();
        this.isActive = false;
        this.isSelectAll = false;
        this.isFilterSelectAll = false;
        this.isInfiniteFilterSelectAll = false;
        this.chunkIndex = [];
        this.cachedItems = [];
        this.groupCachedItems = [];
        this.itemHeight = 41.6;
        this.filterLength = 0;
        this.infiniteFilterLength = 0;
        this.dropdownListYOffset = 0;
        this.defaultSettings = {
            singleSelection: false,
            text: 'Select',
            enableCheckAll: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            filterSelectAllText: 'Select all filtered results',
            filterUnSelectAllText: 'UnSelect all filtered results',
            enableSearchFilter: false,
            searchBy: [],
            maxHeight: 300,
            badgeShowLimit: 999999999999,
            classes: '',
            disabled: false,
            searchPlaceholderText: 'Search',
            showCheckbox: true,
            noDataLabel: 'No Data Available',
            searchAutofocus: true,
            lazyLoading: false,
            labelKey: 'itemName',
            primaryKey: 'id',
            position: 'bottom',
            autoPosition: true,
            enableFilterSelectAll: true,
            selectGroup: false,
            addNewItemOnFilter: false,
            addNewButtonText: "Add",
            escapeToClose: true,
            clearAll: true
        };
        this.randomSize = true;
        this.filteredList = [];
        this.virtualScroollInit = false;
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
        this.searchTerm$.asObservable().pipe(debounceTime(1000), distinctUntilChanged(), tap((/**
         * @param {?} term
         * @return {?}
         */
        term => term))).subscribe((/**
         * @param {?} val
         * @return {?}
         */
        val => {
            this.filterInfiniteList(val);
        }));
    }
    /**
     * @param {?} event
     * @return {?}
     */
    onEscapeDown(event) {
        if (this.settings.escapeToClose) {
            this.closeDropdown();
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.settings = Object.assign(this.defaultSettings, this.settings);
        this.cachedItems = this.cloneArray(this.data);
        if (this.settings.position == 'top') {
            setTimeout((/**
             * @return {?}
             */
            () => {
                this.selectedListHeight = { val: 0 };
                this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            }));
        }
        this.subscription = this.ds.getData().subscribe((/**
         * @param {?} data
         * @return {?}
         */
        data => {
            if (data) {
                /** @type {?} */
                let len = 0;
                data.forEach((/**
                 * @param {?} obj
                 * @param {?} i
                 * @return {?}
                 */
                (obj, i) => {
                    if (!obj.hasOwnProperty('grpTitle')) {
                        len++;
                    }
                }));
                this.filterLength = len;
                this.onFilterChange(data);
            }
        }));
        setTimeout((/**
         * @return {?}
         */
        () => {
            this.calculateDropdownDirection();
        }));
        this.virtualScroollInit = false;
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes.data && !changes.data.firstChange) {
            if (this.settings.groupBy) {
                this.groupedData = this.transformData(this.data, this.settings.groupBy);
                if (this.data.length == 0) {
                    this.selectedItems = [];
                }
                this.groupCachedItems = this.cloneArray(this.groupedData);
            }
            this.cachedItems = this.cloneArray(this.data);
        }
        if (changes.settings && !changes.settings.firstChange) {
            this.settings = Object.assign(this.defaultSettings, this.settings);
        }
        if (changes.loading) {
            console.log(this.loading);
        }
        if (this.settings.lazyLoading && this.virtualScroollInit && changes.data) {
            this.virtualdata = changes.data.currentValue;
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        if (this.selectedItems) {
            if (this.selectedItems.length == 0 || this.data.length == 0 || this.selectedItems.length < this.data.length) {
                this.isSelectAll = false;
            }
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        if (this.settings.lazyLoading) {
            // this._elementRef.nativeElement.getElementsByClassName("lazyContainer")[0].addEventListener('scroll', this.onScroll.bind(this));
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewChecked() {
        if (this.selectedListElem.nativeElement.clientHeight && this.settings.position == 'top' && this.selectedListHeight) {
            this.selectedListHeight.val = this.selectedListElem.nativeElement.clientHeight;
            this.cdr.detectChanges();
        }
    }
    /**
     * @param {?} item
     * @param {?} index
     * @param {?} evt
     * @return {?}
     */
    onItemClick(item, index, evt) {
        if (this.settings.disabled) {
            return false;
        }
        /** @type {?} */
        let found = this.isSelected(item);
        /** @type {?} */
        let limit = this.selectedItems.length < this.settings.limitSelection ? true : false;
        if (!found) {
            if (this.settings.limitSelection) {
                if (limit) {
                    this.addSelected(item);
                    this.onSelect.emit(item);
                }
            }
            else {
                this.addSelected(item);
                this.onSelect.emit(item);
            }
        }
        else {
            this.removeSelected(item);
            this.onDeSelect.emit(item);
        }
        if (this.isSelectAll || this.data.length > this.selectedItems.length) {
            this.isSelectAll = false;
        }
        if (this.data.length == this.selectedItems.length) {
            this.isSelectAll = true;
        }
        if (this.settings.groupBy) {
            this.updateGroupInfo(item);
        }
    }
    /**
     * @param {?} c
     * @return {?}
     */
    validate(c) {
        return null;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    writeValue(value) {
        if (value !== undefined && value !== null && value !== '') {
            if (this.settings.singleSelection) {
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                    this.selectedItems = [value[0]];
                }
                else {
                    try {
                        if (value.length > 1) {
                            this.selectedItems = [value[0]];
                            throw new MyException(404, { "msg": "Single Selection Mode, Selected Items cannot have more than one item." });
                        }
                        else {
                            this.selectedItems = value;
                        }
                    }
                    catch (e) {
                        console.error(e.body.msg);
                    }
                }
            }
            else {
                if (this.settings.limitSelection) {
                    this.selectedItems = value.slice(0, this.settings.limitSelection);
                }
                else {
                    this.selectedItems = value;
                }
                if (this.selectedItems.length === this.data.length && this.data.length > 0) {
                    this.isSelectAll = true;
                }
                if (this.settings.groupBy) {
                    this.groupedData = this.transformData(this.data, this.settings.groupBy);
                    this.groupCachedItems = this.cloneArray(this.groupedData);
                }
            }
        }
        else {
            this.selectedItems = [];
        }
    }
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    //From ControlValueAccessor interface
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
    /**
     * @param {?} index
     * @param {?} item
     * @return {?}
     */
    trackByFn(index, item) {
        return item[this.settings.primaryKey];
    }
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    isSelected(clickedItem) {
        /** @type {?} */
        let found = false;
        this.selectedItems && this.selectedItems.forEach((/**
         * @param {?} item
         * @return {?}
         */
        item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                found = true;
            }
        }));
        return found;
    }
    /**
     * @param {?} item
     * @return {?}
     */
    addSelected(item) {
        if (this.settings.singleSelection) {
            this.selectedItems = [];
            this.selectedItems.push(item);
            this.closeDropdown();
        }
        else
            this.selectedItems.push(item);
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    }
    /**
     * @param {?} clickedItem
     * @return {?}
     */
    removeSelected(clickedItem) {
        this.selectedItems && this.selectedItems.forEach((/**
         * @param {?} item
         * @return {?}
         */
        item => {
            if (clickedItem[this.settings.primaryKey] === item[this.settings.primaryKey]) {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
        }));
        this.onChangeCallback(this.selectedItems);
        this.onTouchedCallback(this.selectedItems);
    }
    /**
     * @param {?} evt
     * @return {?}
     */
    toggleDropdown(evt) {
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = !this.isActive;
        if (this.isActive) {
            if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
                setTimeout((/**
                 * @return {?}
                 */
                () => {
                    this.searchInput.nativeElement.focus();
                }), 0);
            }
            this.onOpen.emit(true);
        }
        else {
            this.onClose.emit(false);
        }
        setTimeout((/**
         * @return {?}
         */
        () => {
            this.calculateDropdownDirection();
        }), 0);
        if (this.settings.lazyLoading) {
            this.virtualdata = this.data;
            this.virtualScroollInit = true;
        }
        evt.preventDefault();
    }
    /**
     * @return {?}
     */
    openDropdown() {
        if (this.settings.disabled) {
            return false;
        }
        this.isActive = true;
        if (this.settings.searchAutofocus && this.searchInput && this.settings.enableSearchFilter && !this.searchTempl) {
            setTimeout((/**
             * @return {?}
             */
            () => {
                this.searchInput.nativeElement.focus();
            }), 0);
        }
        this.onOpen.emit(true);
    }
    /**
     * @return {?}
     */
    closeDropdown() {
        if (this.searchInput && this.settings.lazyLoading) {
            this.searchInput.nativeElement.value = "";
        }
        if (this.searchInput) {
            this.searchInput.nativeElement.value = "";
        }
        this.filter = "";
        this.isActive = false;
        this.onClose.emit(false);
    }
    /**
     * @return {?}
     */
    closeDropdownOnClickOut() {
        if (this.isActive) {
            if (this.searchInput && this.settings.lazyLoading) {
                this.searchInput.nativeElement.value = "";
            }
            if (this.searchInput) {
                this.searchInput.nativeElement.value = "";
            }
            this.filter = "";
            this.isActive = false;
            this.clearSearch();
            this.onClose.emit(false);
        }
    }
    /**
     * @return {?}
     */
    toggleSelectAll() {
        if (!this.isSelectAll) {
            this.selectedItems = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                (obj) => {
                    obj.selected = true;
                }));
                this.groupCachedItems.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                (obj) => {
                    obj.selected = true;
                }));
            }
            this.selectedItems = this.data.slice();
            this.isSelectAll = true;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onSelectAll.emit(this.selectedItems);
        }
        else {
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                (obj) => {
                    obj.selected = false;
                }));
                this.groupCachedItems.forEach((/**
                 * @param {?} obj
                 * @return {?}
                 */
                (obj) => {
                    obj.selected = false;
                }));
            }
            this.selectedItems = [];
            this.isSelectAll = false;
            this.onChangeCallback(this.selectedItems);
            this.onTouchedCallback(this.selectedItems);
            this.onDeSelectAll.emit(this.selectedItems);
        }
    }
    /**
     * @return {?}
     */
    filterGroupedList() {
        if (this.filter == "" || this.filter == null) {
            this.clearSearch();
            return;
        }
        this.groupedData = this.cloneArray(this.groupCachedItems);
        this.groupedData = this.groupedData.filter((/**
         * @param {?} obj
         * @return {?}
         */
        obj => {
            /** @type {?} */
            let arr = obj.list.filter((/**
             * @param {?} t
             * @return {?}
             */
            t => {
                return t.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            }));
            obj.list = arr;
            return arr.some((/**
             * @param {?} cat
             * @return {?}
             */
            cat => {
                return cat.itemName.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
            }));
        }));
        console.log(this.groupedData);
    }
    /**
     * @return {?}
     */
    toggleFilterSelectAll() {
        if (!this.isFilterSelectAll) {
            /** @type {?} */
            let added = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    if (item.list) {
                        item.list.forEach((/**
                         * @param {?} el
                         * @return {?}
                         */
                        (el) => {
                            if (!this.isSelected(el)) {
                                this.addSelected(el);
                                added.push(el);
                            }
                        }));
                    }
                    this.updateGroupInfo(item);
                }));
            }
            else {
                this.ds.getFilteredData().forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    if (!this.isSelected(item)) {
                        this.addSelected(item);
                        added.push(item);
                    }
                }));
            }
            this.isFilterSelectAll = true;
            this.onFilterSelectAll.emit(added);
        }
        else {
            /** @type {?} */
            let removed = [];
            if (this.settings.groupBy) {
                this.groupedData.forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    if (item.list) {
                        item.list.forEach((/**
                         * @param {?} el
                         * @return {?}
                         */
                        (el) => {
                            if (this.isSelected(el)) {
                                this.removeSelected(el);
                                removed.push(el);
                            }
                        }));
                        this.updateGroupInfo(item);
                    }
                }));
            }
            else {
                this.ds.getFilteredData().forEach((/**
                 * @param {?} item
                 * @return {?}
                 */
                (item) => {
                    if (this.isSelected(item)) {
                        this.removeSelected(item);
                        removed.push(item);
                    }
                }));
            }
            this.isFilterSelectAll = false;
            this.onFilterDeSelectAll.emit(removed);
        }
    }
    /**
     * @return {?}
     */
    toggleInfiniteFilterSelectAll() {
        if (!this.isInfiniteFilterSelectAll) {
            this.data.forEach((/**
             * @param {?} item
             * @return {?}
             */
            (item) => {
                if (!this.isSelected(item)) {
                    this.addSelected(item);
                }
            }));
            this.isInfiniteFilterSelectAll = true;
        }
        else {
            this.data.forEach((/**
             * @param {?} item
             * @return {?}
             */
            (item) => {
                if (this.isSelected(item)) {
                    this.removeSelected(item);
                }
            }));
            this.isInfiniteFilterSelectAll = false;
        }
    }
    /**
     * @return {?}
     */
    clearSearch() {
        if (this.settings.groupBy) {
            this.groupedData = [];
            this.groupedData = this.cloneArray(this.groupCachedItems);
        }
        this.filter = "";
        this.isFilterSelectAll = false;
    }
    /**
     * @param {?} data
     * @return {?}
     */
    onFilterChange(data) {
        if (this.filter && this.filter == "" || data.length == 0) {
            this.isFilterSelectAll = false;
        }
        /** @type {?} */
        let cnt = 0;
        data.forEach((/**
         * @param {?} item
         * @return {?}
         */
        (item) => {
            if (!item.hasOwnProperty('grpTitle') && this.isSelected(item)) {
                cnt++;
            }
        }));
        if (cnt > 0 && this.filterLength == cnt) {
            this.isFilterSelectAll = true;
        }
        else if (cnt > 0 && this.filterLength != cnt) {
            this.isFilterSelectAll = false;
        }
        this.cdr.detectChanges();
    }
    /**
     * @param {?} arr
     * @return {?}
     */
    cloneArray(arr) {
        /** @type {?} */
        let i;
        /** @type {?} */
        let copy;
        if (Array.isArray(arr)) {
            return JSON.parse(JSON.stringify(arr));
        }
        else if (typeof arr === 'object') {
            throw 'Cannot clone array containing an object!';
        }
        else {
            return arr;
        }
    }
    /**
     * @param {?} item
     * @return {?}
     */
    updateGroupInfo(item) {
        /** @type {?} */
        let key = this.settings.groupBy;
        this.groupedData.forEach((/**
         * @param {?} obj
         * @return {?}
         */
        (obj) => {
            /** @type {?} */
            let cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((/**
                     * @param {?} el
                     * @return {?}
                     */
                    (el) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    }));
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        }));
        this.groupCachedItems.forEach((/**
         * @param {?} obj
         * @return {?}
         */
        (obj) => {
            /** @type {?} */
            let cnt = 0;
            if (obj.grpTitle && (item[key] == obj[key])) {
                if (obj.list) {
                    obj.list.forEach((/**
                     * @param {?} el
                     * @return {?}
                     */
                    (el) => {
                        if (this.isSelected(el)) {
                            cnt++;
                        }
                    }));
                }
            }
            if (obj.list && (cnt === obj.list.length) && (item[key] == obj[key])) {
                obj.selected = true;
            }
            else if (obj.list && (cnt != obj.list.length) && (item[key] == obj[key])) {
                obj.selected = false;
            }
        }));
    }
    /**
     * @param {?} arr
     * @param {?} field
     * @return {?}
     */
    transformData(arr, field) {
        /** @type {?} */
        const groupedObj = arr.reduce((/**
         * @param {?} prev
         * @param {?} cur
         * @return {?}
         */
        (prev, cur) => {
            if (!prev[cur[field]]) {
                prev[cur[field]] = [cur];
            }
            else {
                prev[cur[field]].push(cur);
            }
            return prev;
        }), {});
        /** @type {?} */
        const tempArr = [];
        Object.keys(groupedObj).map((/**
         * @param {?} x
         * @return {?}
         */
        (x) => {
            /** @type {?} */
            let obj = {};
            obj["grpTitle"] = true;
            obj[this.settings.labelKey] = x;
            obj[this.settings.groupBy] = x;
            obj['selected'] = false;
            obj['list'] = [];
            /** @type {?} */
            let cnt = 0;
            groupedObj[x].forEach((/**
             * @param {?} item
             * @return {?}
             */
            (item) => {
                item['list'] = [];
                obj.list.push(item);
                if (this.isSelected(item)) {
                    cnt++;
                }
            }));
            if (cnt == obj.list.length) {
                obj.selected = true;
            }
            else {
                obj.selected = false;
            }
            tempArr.push(obj);
            // obj.list.forEach((item: any) => {
            //     tempArr.push(item);
            // });
        }));
        return tempArr;
    }
    /**
     * @param {?} evt
     * @return {?}
     */
    filterInfiniteList(evt) {
        /** @type {?} */
        let filteredElems = [];
        if (this.settings.groupBy) {
            this.groupedData = this.groupCachedItems.slice();
        }
        else {
            this.data = this.cachedItems.slice();
            this.virtualdata = this.cachedItems.slice();
        }
        if ((evt != null || evt != '') && !this.settings.groupBy) {
            if (this.settings.searchBy.length > 0) {
                for (let t = 0; t < this.settings.searchBy.length; t++) {
                    this.virtualdata.filter((/**
                     * @param {?} el
                     * @return {?}
                     */
                    (el) => {
                        if (el[this.settings.searchBy[t].toString()].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                        }
                    }));
                }
            }
            else {
                this.virtualdata.filter((/**
                 * @param {?} el
                 * @return {?}
                 */
                function (el) {
                    for (let prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }));
            }
            this.virtualdata = [];
            this.virtualdata = filteredElems;
            this.infiniteFilterLength = this.virtualdata.length;
        }
        if (evt.toString() != '' && this.settings.groupBy) {
            this.groupedData.filter((/**
             * @param {?} el
             * @return {?}
             */
            function (el) {
                if (el.hasOwnProperty('grpTitle')) {
                    filteredElems.push(el);
                }
                else {
                    for (let prop in el) {
                        if (el[prop].toString().toLowerCase().indexOf(evt.toString().toLowerCase()) >= 0) {
                            filteredElems.push(el);
                            break;
                        }
                    }
                }
            }));
            this.groupedData = [];
            this.groupedData = filteredElems;
            this.infiniteFilterLength = this.groupedData.length;
        }
        else if (evt.toString() == '' && this.cachedItems.length > 0) {
            this.virtualdata = [];
            this.virtualdata = this.cachedItems;
            this.infiniteFilterLength = 0;
        }
        this.virtualScroller.refresh();
    }
    /**
     * @return {?}
     */
    resetInfiniteSearch() {
        this.filter = "";
        this.isInfiniteFilterSelectAll = false;
        this.virtualdata = [];
        this.virtualdata = this.cachedItems;
        this.groupedData = this.groupCachedItems;
        this.infiniteFilterLength = 0;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onScrollEnd(e) {
        if (e.endIndex === this.data.length - 1 || e.startIndex === 0) {
        }
        this.onScrollToEnd.emit(e);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
    /**
     * @param {?} item
     * @return {?}
     */
    selectGroup(item) {
        if (item.selected) {
            item.selected = false;
            item.list.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            (obj) => {
                this.removeSelected(obj);
            }));
            this.updateGroupInfo(item);
            this.onGroupSelect.emit(item);
        }
        else {
            item.selected = true;
            item.list.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            (obj) => {
                if (!this.isSelected(obj)) {
                    this.addSelected(obj);
                }
            }));
            this.updateGroupInfo(item);
            this.onGroupDeSelect.emit(item);
        }
    }
    /**
     * @return {?}
     */
    addFilterNewItem() {
        this.onAddFilterNewItem.emit(this.filter);
        this.filterPipe = new ListFilterPipe(this.ds);
        this.filterPipe.transform(this.data, this.filter, this.settings.searchBy);
    }
    /**
     * @return {?}
     */
    calculateDropdownDirection() {
        /** @type {?} */
        let shouldOpenTowardsTop = this.settings.position == 'top';
        if (this.settings.autoPosition) {
            /** @type {?} */
            const dropdownHeight = this.dropdownListElem.nativeElement.clientHeight;
            /** @type {?} */
            const viewportHeight = document.documentElement.clientHeight;
            /** @type {?} */
            const selectedListBounds = this.selectedListElem.nativeElement.getBoundingClientRect();
            /** @type {?} */
            const spaceOnTop = selectedListBounds.top;
            /** @type {?} */
            const spaceOnBottom = viewportHeight - selectedListBounds.top;
            if (spaceOnBottom < spaceOnTop && dropdownHeight < spaceOnTop) {
                this.openTowardsTop(true);
            }
            else {
                this.openTowardsTop(false);
            }
            // Keep preference if there is not enough space on either the top or bottom
            /* 			if (spaceOnTop || spaceOnBottom) {
                            if (shouldOpenTowardsTop) {
                                shouldOpenTowardsTop = spaceOnTop;
                            } else {
                                shouldOpenTowardsTop = !spaceOnBottom;
                            }
                        } */
        }
    }
    /**
     * @param {?} value
     * @return {?}
     */
    openTowardsTop(value) {
        if (value && this.selectedListElem.nativeElement.clientHeight) {
            this.dropdownListYOffset = 15 + this.selectedListElem.nativeElement.clientHeight;
        }
        else {
            this.dropdownListYOffset = 0;
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    clearSelection(e) {
        if (this.settings.groupBy) {
            this.groupCachedItems.forEach((/**
             * @param {?} obj
             * @return {?}
             */
            (obj) => {
                obj.selected = false;
            }));
        }
        this.clearSearch();
        this.selectedItems = [];
        this.onDeSelectAll.emit(this.selectedItems);
    }
}
AngularMultiSelect.decorators = [
    { type: Component, args: [{
                selector: 'angular2-multiselect',
                template: "<div class=\"cuppa-dropdown\" (clickOutside)=\"closeDropdownOnClickOut()\">\n    <div class=\"selected-list\" #selectedList>\n        <div class=\"c-btn\" (click)=\"toggleDropdown($event)\" [ngClass]=\"{'disabled': settings.disabled}\" [attr.tabindex]=\"0\">\n\n            <span *ngIf=\"selectedItems?.length == 0\">{{settings.text}}</span>\n            <span *ngIf=\"settings.singleSelection && !badgeTempl\">\n                <span *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);\">\n                    {{item[settings.labelKey]}}\n                </span>\n            </span>\n            <span class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && settings.singleSelection && badgeTempl \">\n                <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n\n            <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                            <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                        </span>\n            <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                <c-icon [name]=\"'remove'\"></c-icon>\n            </span>\n        </div>\n        </span>\n        <div class=\"c-list\" *ngIf=\"selectedItems?.length > 0 && !settings.singleSelection\">\n            <div class=\"c-token\" *ngFor=\"let item of selectedItems;trackBy: trackByFn.bind(this);let k = index\" [hidden]=\"k > settings.badgeShowLimit-1\">\n                <span *ngIf=\"!badgeTempl\" class=\"c-label\">{{item[settings.labelKey]}}</span>\n                <span *ngIf=\"badgeTempl\" class=\"c-label\">\n                    <c-templateRenderer [data]=\"badgeTempl\" [item]=\"item\"></c-templateRenderer>\n                </span>\n                <span class=\"c-remove\" (click)=\"onItemClick(item,k,$event);$event.stopPropagation()\">\n                    <c-icon [name]=\"'remove'\"></c-icon>\n                </span>\n            </div>\n        </div>\n        <span class=\"countplaceholder\" *ngIf=\"selectedItems?.length > settings.badgeShowLimit\">+{{selectedItems?.length - settings.badgeShowLimit }}</span>\n        <span class=\"c-remove clear-all\" *ngIf=\"settings.clearAll && selectedItems?.length > 0\" (click)=\"clearSelection($event);$event.stopPropagation()\">\n            <c-icon [name]=\"'remove'\"></c-icon>\n        </span>\n        <span *ngIf=\"!isActive\" class=\"c-angle-down\">\n    <c-icon [name]=\"'angle-down'\"></c-icon>\n            </span>\n        <span *ngIf=\"isActive\" class=\"c-angle-up\">\n            <c-icon [name]=\"'angle-up'\"></c-icon>\n\n            </span>\n    </div>\n</div>\n<div #dropdownList class=\"dropdown-list\"\n[ngClass]=\"{'dropdown-list-top': dropdownListYOffset}\"\n[style.bottom.px]=\"dropdownListYOffset ? dropdownListYOffset : null\"\n[hidden]=\"!isActive\">\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\" class=\"arrow-2\"></div>\n    <div [ngClass]=\"{'arrow-up': !dropdownListYOffset, 'arrow-down': dropdownListYOffset}\"></div>\n<div class=\"list-area\" [ngClass]=\"{'single-select-mode': settings.singleSelection }\">\n        <div class=\"pure-checkbox select-all\" *ngIf=\"settings.enableCheckAll && !settings.singleSelection && !settings.limitSelection && data?.length > 0\"\n            (click)=\"toggleSelectAll()\">\n            <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n            />\n            <label>\n                <span [hidden]=\"isSelectAll\">{{settings.selectAllText}}</span>\n                <span [hidden]=\"!isSelectAll\">{{settings.unSelectAllText}}</span>\n            </label>\n        </div>\n        <img class=\"loading-icon\" *ngIf=\"loading\" src=\"assets/img/loading.gif\"/>\n        <div class=\"list-filter\" *ngIf=\"settings.enableSearchFilter\">\n            <span class=\"c-search\">\n                <c-icon [name]=\"'search'\"></c-icon>\n                </span>\n            <span *ngIf=\"!settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"clearSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n            <span *ngIf=\"settings.lazyLoading\" [hidden]=\"filter == undefined || filter?.length == 0\" class=\"c-clear\" (click)=\"resetInfiniteSearch()\">\n                <c-icon [name]=\"'clear'\"></c-icon>\n                </span>\n\n            <input class=\"c-input\" *ngIf=\"settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupedList()\">\n                <input class=\"c-input\" *ngIf=\"!settings.groupBy && !settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" >\n            <input class=\"c-input\" *ngIf=\"settings.lazyLoading && !searchTempl\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"searchTerm$.next($event.target.value)\">\n            <!--            <input class=\"c-input\" *ngIf=\"!settings.lazyLoading && !searchTempl && settings.groupBy\" #searchInput type=\"text\" [placeholder]=\"settings.searchPlaceholderText\"\n                [(ngModel)]=\"filter\" (keyup)=\"filterGroupList($event)\">-->\n            <c-templateRenderer *ngIf=\"searchTempl\" [data]=\"searchTempl\" [item]=\"item\"></c-templateRenderer>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"!settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"!settings.groupBy && filter?.length > 0 && filterLength > 0\" (click)=\"toggleFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                <label>\n                <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n            <div class=\"pure-checkbox select-all\" *ngIf=\"settings.groupBy && filter?.length > 0 && groupedData?.length > 0\" (click)=\"toggleFilterSelectAll()\">\n                    <input type=\"checkbox\" [checked]=\"isFilterSelectAll && filter?.length > 0\" [disabled]=\"settings.limitSelection == selectedItems?.length\" />\n                    <label>\n                    <span [hidden]=\"isFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                    <span [hidden]=\"!isFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n                </label>\n                </div>\n            <label class=\"nodata-label\" *ngIf=\"!settings.groupBy && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n            <label class=\"nodata-label\" *ngIf=\"settings.groupBy && groupedData?.length == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">{{settings.noDataLabel}}</label>\n\n            <div class=\"btn-container\" *ngIf=\"settings.addNewItemOnFilter && filterLength == 0\" [hidden]=\"filter == undefined || filter?.length == 0\">\n            <button class=\"c-btn btn-iceblue\" (click)=\"addFilterNewItem()\">{{settings.addNewButtonText}}</button>\n            </div>\n        </div>\n        <div class=\"filter-select-all\" *ngIf=\"settings.lazyLoading && settings.enableFilterSelectAll\">\n            <div class=\"pure-checkbox select-all\" *ngIf=\"filter?.length > 0 && infiniteFilterLength > 0\" (click)=\"toggleInfiniteFilterSelectAll()\">\n                <input type=\"checkbox\" [checked]=\"isInfiniteFilterSelectAll\" [disabled]=\"settings.limitSelection == selectedItems?.length\"\n                />\n                <label>\n                <span [hidden]=\"isInfiniteFilterSelectAll\">{{settings.filterSelectAllText}}</span>\n                <span [hidden]=\"!isInfiniteFilterSelectAll\">{{settings.filterUnSelectAllText}}</span>\n            </label>\n            </div>\n        </div>\n\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n                <ul virtualScroller #scroll [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                    <li *ngFor=\"let item of scroll.viewPortItems; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label>{{item[settings.labelKey]}}</label>\n                    </li>\n                </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <li *ngFor=\"let item of data | listFilter:filter : settings.searchBy; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                    class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n            </ul>\n        </div>\n        <div *ngIf=\"!settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n                <ul virtualScroller #scroll2 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" class=\"lazyContainer\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                    <li *ngFor=\"let item of scroll2.viewPortItems; let i = index;\" (click)=\"onItemClick(item,i,$event)\"\n                        class=\"pure-checkbox\" [ngClass]=\"{'selected-item': isSelected(item) == true }\">\n                        <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                        />\n                        <label></label>\n                        <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                    </li>\n                </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul virtualScroller #scroll3 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n            (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                <span *ngFor=\"let item of scroll3.viewPortItems; let i = index;\">\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                <li *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label></label>\n                    <c-templateRenderer [data]=\"itemTempl\" [item]=\"item\"></c-templateRenderer>\n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl != undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                <span *ngFor=\"let item of groupedData; let i = index;\">\n                    <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                    <ul class=\"lazyContainer\">\n                        <span *ngFor=\"let val of item.list ; let j = index;\">\n                        <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'grp-title': val.grpTitle,'grp-item': !val.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                />\n                                <label></label>\n                                <c-templateRenderer [data]=\"itemTempl\" [item]=\"val\"></c-templateRenderer>\n                            </li>\n                            </span>\n                </ul>\n                    \n                </li>\n                </span>\n            </ul>\n        </div>\n        <div *ngIf=\"settings.groupBy && settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <virtual-scroller [items]=\"groupedData\" (vsUpdate)=\"viewPortItems = $event\" (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\">\n                <ul virtualScroller #scroll4 [enableUnequalChildrenSizes]=\"randomSize\" [items]=\"virtualdata\" (vsStart)=\"onScrollEnd($event)\"\n                (vsEnd)=\"onScrollEnd($event)\" [ngStyle]=\"{'height': settings.maxHeight+'px'}\" class=\"lazyContainer\">\n                    <span *ngFor=\"let item of scroll4.viewPortItems; let i = index;\">\n                <li  *ngIf=\"item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle && !settings.singleSelection\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection, 'selected-item': isSelected(item) == true }\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span>\n                </ul>\n            </virtual-scroller>\n        </div>\n        <div *ngIf=\"settings.groupBy && !settings.lazyLoading && itemTempl == undefined\" [style.maxHeight]=\"settings.maxHeight+'px'\" style=\"overflow: auto;\">\n            <ul class=\"lazyContainer\">\n                    <span *ngFor=\"let item of groupedData ; let i = index;\">\n                            <li (click)=\"selectGroup(item)\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                    <input  *ngIf=\"settings.showCheckbox && !settings.singleSelection\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                                    />\n                                    <label>{{item[settings.labelKey]}}</label>\n                                    <ul class=\"lazyContainer\">\n                                            <span *ngFor=\"let val of item.list ; let j = index;\">\n                                            <li (click)=\"onItemClick(val,j,$event); $event.stopPropagation()\" [ngClass]=\"{'selected-item': isSelected(val) == true,'grp-title': val.grpTitle,'grp-item': !val.grpTitle && !settings.singleSelection}\" class=\"pure-checkbox\">\n                                                    <input *ngIf=\"settings.showCheckbox\" type=\"checkbox\" [checked]=\"isSelected(val)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(val)\"\n                                                    />\n                                                    <label>{{val[settings.labelKey]}}</label>\n                                                </li>\n                                                </span>\n                                    </ul>\n                                </li>\n                    </span>\n                <!-- <span *ngFor=\"let item of groupedData ; let i = index;\">\n                    <li (click)=\"onItemClick(item,i,$event)\" *ngIf=\"!item.grpTitle\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && !item.grpTitle\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                <li *ngIf=\"item.grpTitle && !settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"isSelected(item)\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                 <li  (click)=\"selectGroup(item)\" *ngIf=\"item.grpTitle && settings.selectGroup\" [ngClass]=\"{'grp-title': item.grpTitle,'grp-item': !item.grpTitle}\" class=\"pure-checkbox\">\n                    <input *ngIf=\"settings.showCheckbox && settings.selectGroup\" type=\"checkbox\" [checked]=\"item.selected\" [disabled]=\"settings.limitSelection == selectedItems?.length && !isSelected(item)\"\n                    />\n                    <label>{{item[settings.labelKey]}}</label>\n                </li>\n                </span> -->\n            </ul>\n        </div>\n        <h5 class=\"list-message\" *ngIf=\"data?.length == 0\">{{settings.noDataLabel}}</h5>\n    </div>\n</div>\n</div>",
                host: { '[class]': 'defaultSettings.classes' },
                providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR, DROPDOWN_CONTROL_VALIDATION],
                encapsulation: ViewEncapsulation.None,
                styles: ["virtual-scroll{display:block;width:100%}.cuppa-dropdown{position:relative}.c-btn{display:inline-block;border-width:1px;line-height:1.25;border-radius:3px;font-size:.85rem;padding:5px 10px;cursor:pointer;align-items:center;min-height:38px}.c-btn.disabled{background:#ccc}.selected-list .c-list{float:left;padding:0;margin:0;width:calc(100% - 20px)}.selected-list .c-list .c-token{list-style:none;padding:4px 22px 4px 8px;border-radius:2px;margin-right:4px;margin-top:2px;float:left;position:relative}.selected-list .c-list .c-token .c-label{display:block;float:left}.selected-list .c-list .c-token .c-remove{position:absolute;right:8px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);width:8px}.selected-list .c-list .c-token .c-remove svg{fill:#fff}.selected-list .fa-angle-down,.selected-list .fa-angle-up{font-size:15pt;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-angle-down,.selected-list .c-angle-up{width:12px;height:12px;position:absolute;right:10px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);pointer-events:none}.selected-list .c-angle-down svg,.selected-list .c-angle-up svg{fill:#333}.selected-list .countplaceholder{position:absolute;right:45px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.selected-list .c-btn{width:100%;padding:5px 10px;cursor:pointer;display:flex;position:relative}.selected-list .c-btn .c-icon{position:absolute;right:5px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.dropdown-list{position:absolute;padding-top:14px;width:100%;z-index:99999}.dropdown-list ul{padding:0;list-style:none;overflow:auto;margin:0}.dropdown-list ul li{padding:10px;cursor:pointer;text-align:left}.dropdown-list ul li:first-child{padding-top:10px}.dropdown-list ul li:last-child{padding-bottom:10px}.dropdown-list ::-webkit-scrollbar{width:8px}.dropdown-list ::-webkit-scrollbar-thumb{background:#ccc;border-radius:5px}.dropdown-list ::-webkit-scrollbar-track{background:#f2f2f2}.arrow-down,.arrow-up{width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-bottom:15px solid #fff;margin-left:15px;position:absolute;top:0}.arrow-down{bottom:-14px;top:unset;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.arrow-2{border-bottom:15px solid #ccc;top:-1px}.arrow-down.arrow-2{top:unset;bottom:-16px}.list-area{border:1px solid #ccc;border-radius:3px;background:#fff;margin:0}.select-all{padding:10px;border-bottom:1px solid #ccc;text-align:left}.list-filter{border-bottom:1px solid #ccc;position:relative;padding-left:35px;height:35px}.list-filter input{border:0;width:100%;height:100%;padding:0}.list-filter input:focus{outline:0}.list-filter .c-search{position:absolute;top:9px;left:10px;width:15px;height:15px}.list-filter .c-search svg{fill:#888}.list-filter .c-clear{position:absolute;top:10px;right:10px;width:15px;height:15px}.list-filter .c-clear svg{fill:#888}.pure-checkbox input[type=checkbox]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=checkbox]:focus+label:before,.pure-checkbox input[type=checkbox]:hover+label:before{background-color:#f2f2f2}.pure-checkbox input[type=checkbox]:active+label:before{transition-duration:0s}.pure-checkbox input[type=checkbox]+label{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;margin:0;font-weight:300}.pure-checkbox input[type=checkbox]+label:before{box-sizing:content-box;content:'';position:absolute;top:50%;left:0;width:15px;height:15px;margin-top:-9px;text-align:center;transition:.4s;border-radius:3px}.pure-checkbox input[type=checkbox]+label:after{box-sizing:content-box;content:'';position:absolute;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;transform-origin:50%;transition:transform .2s ease-out,-webkit-transform .2s ease-out;background-color:transparent;top:50%;left:3px;width:9px;height:4px;margin-top:-5px;border-style:solid;border-width:0 0 2px 2px;-o-border-image:none;border-image:none;-webkit-transform:rotate(-45deg) scale(0);transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=checkbox]:disabled+label:before{border-color:#ccc}.pure-checkbox input[type=checkbox]:disabled:focus+label:before .pure-checkbox input[type=checkbox]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=checkbox]:disabled:checked+label:before{background-color:#ccc}.pure-checkbox input[type=radio]:checked+label:before{background-color:#fff}.pure-checkbox input[type=radio]:checked+label:after{-webkit-transform:scale(1);transform:scale(1)}.pure-checkbox input[type=radio]+label:before{border-radius:50%}.pure-checkbox input[type=checkbox]:checked+label:after{content:'';transition:transform .2s ease-out,-webkit-transform .2s ease-out;-webkit-transform:rotate(-45deg) scale(1);transform:rotate(-45deg) scale(1)}.list-message{text-align:center;margin:0;padding:15px 0;font-size:initial}.list-grp{padding:0 15px!important}.list-grp h4{text-transform:capitalize;margin:15px 0 0;font-size:14px;font-weight:700}.list-grp>li{padding-left:15px!important}.grp-item{padding-left:30px!important}.grp-title{padding-bottom:0!important}.grp-title label{margin-bottom:0!important;font-weight:800;text-transform:capitalize}.grp-title:hover{background:0 0!important}.loading-icon{width:20px;position:absolute;right:10px;top:23px;z-index:1}.nodata-label{width:100%;text-align:center;padding:10px 0 0}.btn-container{text-align:center;padding:0 5px 10px}.clear-all{width:8px;position:absolute;top:50%;right:30px;-webkit-transform:translateY(-50%);transform:translateY(-50%)}"]
            }] }
];
/** @nocollapse */
AngularMultiSelect.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: DataService }
];
AngularMultiSelect.propDecorators = {
    data: [{ type: Input }],
    settings: [{ type: Input }],
    loading: [{ type: Input }],
    onSelect: [{ type: Output, args: ['onSelect',] }],
    onDeSelect: [{ type: Output, args: ['onDeSelect',] }],
    onSelectAll: [{ type: Output, args: ['onSelectAll',] }],
    onDeSelectAll: [{ type: Output, args: ['onDeSelectAll',] }],
    onOpen: [{ type: Output, args: ['onOpen',] }],
    onClose: [{ type: Output, args: ['onClose',] }],
    onScrollToEnd: [{ type: Output, args: ['onScrollToEnd',] }],
    onFilterSelectAll: [{ type: Output, args: ['onFilterSelectAll',] }],
    onFilterDeSelectAll: [{ type: Output, args: ['onFilterDeSelectAll',] }],
    onAddFilterNewItem: [{ type: Output, args: ['onAddFilterNewItem',] }],
    onGroupSelect: [{ type: Output, args: ['onGroupSelect',] }],
    onGroupDeSelect: [{ type: Output, args: ['onGroupDeSelect',] }],
    itemTempl: [{ type: ContentChild, args: [Item, { static: true },] }],
    badgeTempl: [{ type: ContentChild, args: [Badge, { static: true },] }],
    searchTempl: [{ type: ContentChild, args: [Search, { static: true },] }],
    searchInput: [{ type: ViewChild, args: ['searchInput', { static: true },] }],
    selectedListElem: [{ type: ViewChild, args: ['selectedList', { static: true },] }],
    dropdownListElem: [{ type: ViewChild, args: ['dropdownList', { static: true },] }],
    onEscapeDown: [{ type: HostListener, args: ['document:keyup.escape', ['$event'],] }],
    virtualScroller: [{ type: ViewChild, args: [VirtualScrollerComponent, { static: false },] }]
};
if (false) {
    /** @type {?} */
    AngularMultiSelect.prototype.data;
    /** @type {?} */
    AngularMultiSelect.prototype.settings;
    /** @type {?} */
    AngularMultiSelect.prototype.loading;
    /** @type {?} */
    AngularMultiSelect.prototype.onSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onDeSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onDeSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onOpen;
    /** @type {?} */
    AngularMultiSelect.prototype.onClose;
    /** @type {?} */
    AngularMultiSelect.prototype.onScrollToEnd;
    /** @type {?} */
    AngularMultiSelect.prototype.onFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onFilterDeSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.onAddFilterNewItem;
    /** @type {?} */
    AngularMultiSelect.prototype.onGroupSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.onGroupDeSelect;
    /** @type {?} */
    AngularMultiSelect.prototype.itemTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.badgeTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.searchTempl;
    /** @type {?} */
    AngularMultiSelect.prototype.searchInput;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedListElem;
    /** @type {?} */
    AngularMultiSelect.prototype.dropdownListElem;
    /** @type {?} */
    AngularMultiSelect.prototype.virtualdata;
    /** @type {?} */
    AngularMultiSelect.prototype.searchTerm$;
    /** @type {?} */
    AngularMultiSelect.prototype.filterPipe;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.isActive;
    /** @type {?} */
    AngularMultiSelect.prototype.isSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.isFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.isInfiniteFilterSelectAll;
    /** @type {?} */
    AngularMultiSelect.prototype.groupedData;
    /** @type {?} */
    AngularMultiSelect.prototype.filter;
    /** @type {?} */
    AngularMultiSelect.prototype.chunkArray;
    /** @type {?} */
    AngularMultiSelect.prototype.scrollTop;
    /** @type {?} */
    AngularMultiSelect.prototype.chunkIndex;
    /** @type {?} */
    AngularMultiSelect.prototype.cachedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.groupCachedItems;
    /** @type {?} */
    AngularMultiSelect.prototype.totalRows;
    /** @type {?} */
    AngularMultiSelect.prototype.itemHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.screenItemsLen;
    /** @type {?} */
    AngularMultiSelect.prototype.cachedItemsLen;
    /** @type {?} */
    AngularMultiSelect.prototype.totalHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.scroller;
    /** @type {?} */
    AngularMultiSelect.prototype.maxBuffer;
    /** @type {?} */
    AngularMultiSelect.prototype.lastScrolled;
    /** @type {?} */
    AngularMultiSelect.prototype.lastRepaintY;
    /** @type {?} */
    AngularMultiSelect.prototype.selectedListHeight;
    /** @type {?} */
    AngularMultiSelect.prototype.filterLength;
    /** @type {?} */
    AngularMultiSelect.prototype.infiniteFilterLength;
    /** @type {?} */
    AngularMultiSelect.prototype.viewPortItems;
    /** @type {?} */
    AngularMultiSelect.prototype.item;
    /** @type {?} */
    AngularMultiSelect.prototype.dropdownListYOffset;
    /** @type {?} */
    AngularMultiSelect.prototype.subscription;
    /** @type {?} */
    AngularMultiSelect.prototype.defaultSettings;
    /** @type {?} */
    AngularMultiSelect.prototype.randomSize;
    /** @type {?} */
    AngularMultiSelect.prototype.parseError;
    /** @type {?} */
    AngularMultiSelect.prototype.filteredList;
    /** @type {?} */
    AngularMultiSelect.prototype.virtualScroollInit;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.virtualScroller;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.onTouchedCallback;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.onChangeCallback;
    /** @type {?} */
    AngularMultiSelect.prototype._elementRef;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.cdr;
    /**
     * @type {?}
     * @private
     */
    AngularMultiSelect.prototype.ds;
}
export class AngularMultiSelectModule {
}
AngularMultiSelectModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, FormsModule, VirtualScrollerModule],
                declarations: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
                exports: [AngularMultiSelect, ClickOutsideDirective, ScrollDirective, styleDirective, ListFilterPipe, Item, TemplateRenderer, Badge, Search, setPosition, CIcon],
                providers: [DataService]
            },] }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzZWxlY3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhcjItbXVsdGlzZWxlY3QtZHJvcGRvd24vIiwic291cmNlcyI6WyJsaWIvbXVsdGlzZWxlY3QuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFVLFlBQVksRUFBcUMsUUFBUSxFQUE0QixpQkFBaUIsRUFBb0IsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFzQyxNQUFNLGVBQWUsQ0FBQztBQUNqVCxPQUFPLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUF3QixhQUFhLEVBQTBCLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0gsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVsRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDM0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE9BQU8sRUFBZ0IsT0FBTyxFQUFHLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xHLE9BQU8sRUFBTyxZQUFZLEVBQUUsb0JBQW9CLEVBQWEsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7O0FBRXpGLE1BQU0sT0FB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bEh0Qyx5Q0FBOEI7Ozs7O0lBQUUsaUNBQThCOzs7OztJQUFFLGdDQUF1Qjs7QUE4cEJ2RyxNQUFNLE9BQU8sd0JBQXdCOzs7WUFOcEMsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUscUJBQXFCLENBQUM7Z0JBQzNELFlBQVksRUFBRSxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7Z0JBQ3JLLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7Z0JBQ2hLLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUMzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBIb3N0TGlzdGVuZXIsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LE9uRGVzdHJveSwgTmdNb2R1bGUsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgQ2hhbmdlRGV0ZWN0b3JSZWYsIEFmdGVyVmlld0NoZWNrZWQsIFZpZXdFbmNhcHN1bGF0aW9uLCBDb250ZW50Q2hpbGQsIFZpZXdDaGlsZCwgZm9yd2FyZFJlZiwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBFbGVtZW50UmVmLCBBZnRlclZpZXdJbml0LCBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgTkdfVkFMVUVfQUNDRVNTT1IsIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxJREFUT1JTLCBWYWxpZGF0b3IsIEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE15RXhjZXB0aW9uIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5tb2RlbCc7XG5pbXBvcnQgeyBEcm9wZG93blNldHRpbmdzIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5pbnRlcmZhY2UnO1xuaW1wb3J0IHsgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlLCBTY3JvbGxEaXJlY3RpdmUsIHN0eWxlRGlyZWN0aXZlLCBzZXRQb3NpdGlvbiB9IGZyb20gJy4vY2xpY2tPdXRzaWRlJztcbmltcG9ydCB7IExpc3RGaWx0ZXJQaXBlIH0gZnJvbSAnLi9saXN0LWZpbHRlcic7XG5pbXBvcnQgeyBJdGVtLCBCYWRnZSwgU2VhcmNoLCBUZW1wbGF0ZVJlbmRlcmVyLCBDSWNvbiB9IGZyb20gJy4vbWVudS1pdGVtJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9tdWx0aXNlbGVjdC5zZXJ2aWNlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiwgU3ViamVjdCAgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFZpcnR1YWxTY3JvbGxlck1vZHVsZSwgVmlydHVhbFNjcm9sbGVyQ29tcG9uZW50IH0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbC92aXJ0dWFsLXNjcm9sbCc7XG5pbXBvcnQgeyBtYXAsIGRlYm91bmNlVGltZSwgZGlzdGluY3RVbnRpbENoYW5nZWQsIHN3aXRjaE1hcCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnOyBcblxuZXhwb3J0IGNvbnN0IERST1BET1dOX0NPTlRST0xfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBBbmd1bGFyTXVsdGlTZWxlY3QpLFxuICAgIG11bHRpOiB0cnVlXG59O1xuZXhwb3J0IGNvbnN0IERST1BET1dOX0NPTlRST0xfVkFMSURBVElPTjogYW55ID0ge1xuICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQW5ndWxhck11bHRpU2VsZWN0KSxcbiAgICBtdWx0aTogdHJ1ZSxcbn1cbmNvbnN0IG5vb3AgPSAoKSA9PiB7XG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FuZ3VsYXIyLW11bHRpc2VsZWN0JyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbXVsdGlzZWxlY3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIGhvc3Q6IHsgJ1tjbGFzc10nOiAnZGVmYXVsdFNldHRpbmdzLmNsYXNzZXMnIH0sXG4gICAgc3R5bGVVcmxzOiBbJy4vbXVsdGlzZWxlY3QuY29tcG9uZW50LnNjc3MnXSxcbiAgICBwcm92aWRlcnM6IFtEUk9QRE9XTl9DT05UUk9MX1ZBTFVFX0FDQ0VTU09SLCBEUk9QRE9XTl9DT05UUk9MX1ZBTElEQVRJT05dLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuXG5leHBvcnQgY2xhc3MgQW5ndWxhck11bHRpU2VsZWN0IGltcGxlbWVudHMgT25Jbml0LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25DaGFuZ2VzLCBWYWxpZGF0b3IsIEFmdGVyVmlld0NoZWNrZWQsIE9uRGVzdHJveSB7XG5cbiAgICBASW5wdXQoKVxuICAgIGRhdGE6IEFycmF5PGFueT47XG5cbiAgICBASW5wdXQoKVxuICAgIHNldHRpbmdzOiBEcm9wZG93blNldHRpbmdzO1xuXG4gICAgQElucHV0KClcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuXG4gICAgQE91dHB1dCgnb25TZWxlY3QnKVxuICAgIG9uU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25EZVNlbGVjdCcpXG4gICAgb25EZVNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uU2VsZWN0QWxsJylcbiAgICBvblNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25EZVNlbGVjdEFsbCcpXG4gICAgb25EZVNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25PcGVuJylcbiAgICBvbk9wZW46IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkNsb3NlJylcbiAgICBvbkNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25TY3JvbGxUb0VuZCcpXG4gICAgb25TY3JvbGxUb0VuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICAgIEBPdXRwdXQoJ29uRmlsdGVyU2VsZWN0QWxsJylcbiAgICBvbkZpbHRlclNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25GaWx0ZXJEZVNlbGVjdEFsbCcpXG4gICAgb25GaWx0ZXJEZVNlbGVjdEFsbDogRXZlbnRFbWl0dGVyPEFycmF5PGFueT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBcnJheTxhbnk+PigpO1xuXG4gICAgQE91dHB1dCgnb25BZGRGaWx0ZXJOZXdJdGVtJylcbiAgICBvbkFkZEZpbHRlck5ld0l0ZW06IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAT3V0cHV0KCdvbkdyb3VwU2VsZWN0JylcbiAgICBvbkdyb3VwU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gICAgQE91dHB1dCgnb25Hcm91cERlU2VsZWN0JylcbiAgICBvbkdyb3VwRGVTZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgICBAQ29udGVudENoaWxkKEl0ZW0sIHsgc3RhdGljOiB0cnVlIH0pIGl0ZW1UZW1wbDogSXRlbTtcbiAgICBAQ29udGVudENoaWxkKEJhZGdlLCB7IHN0YXRpYzogdHJ1ZSB9KSBiYWRnZVRlbXBsOiBCYWRnZTtcbiAgICBAQ29udGVudENoaWxkKFNlYXJjaCwgeyBzdGF0aWM6IHRydWUgfSkgc2VhcmNoVGVtcGw6IFNlYXJjaDtcblxuXG4gICAgQFZpZXdDaGlsZCgnc2VhcmNoSW5wdXQnLCB7IHN0YXRpYzogdHJ1ZSB9KSBzZWFyY2hJbnB1dDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdzZWxlY3RlZExpc3QnLCB7IHN0YXRpYzogdHJ1ZSB9KSBzZWxlY3RlZExpc3RFbGVtOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2Ryb3Bkb3duTGlzdCcsIHsgc3RhdGljOiB0cnVlIH0pIGRyb3Bkb3duTGlzdEVsZW06IEVsZW1lbnRSZWY7XG5cbiAgICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDprZXl1cC5lc2NhcGUnLCBbJyRldmVudCddKVxuICAgIG9uRXNjYXBlRG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5lc2NhcGVUb0Nsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRHJvcGRvd24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2aXJ0dWFsZGF0YTogYW55ID0gW107XG4gICAgc2VhcmNoVGVybSQgPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XG5cbiAgICBmaWx0ZXJQaXBlOiBMaXN0RmlsdGVyUGlwZTtcbiAgICBwdWJsaWMgc2VsZWN0ZWRJdGVtczogQXJyYXk8YW55PjtcbiAgICBwdWJsaWMgaXNBY3RpdmU6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNTZWxlY3RBbGw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNGaWx0ZXJTZWxlY3RBbGw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwdWJsaWMgaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHB1YmxpYyBncm91cGVkRGF0YTogQXJyYXk8YW55PjtcbiAgICBmaWx0ZXI6IGFueTtcbiAgICBwdWJsaWMgY2h1bmtBcnJheTogYW55W107XG4gICAgcHVibGljIHNjcm9sbFRvcDogYW55O1xuICAgIHB1YmxpYyBjaHVua0luZGV4OiBhbnlbXSA9IFtdO1xuICAgIHB1YmxpYyBjYWNoZWRJdGVtczogYW55W10gPSBbXTtcbiAgICBwdWJsaWMgZ3JvdXBDYWNoZWRJdGVtczogYW55W10gPSBbXTtcbiAgICBwdWJsaWMgdG90YWxSb3dzOiBhbnk7XG4gICAgcHVibGljIGl0ZW1IZWlnaHQ6IGFueSA9IDQxLjY7XG4gICAgcHVibGljIHNjcmVlbkl0ZW1zTGVuOiBhbnk7XG4gICAgcHVibGljIGNhY2hlZEl0ZW1zTGVuOiBhbnk7XG4gICAgcHVibGljIHRvdGFsSGVpZ2h0OiBhbnk7XG4gICAgcHVibGljIHNjcm9sbGVyOiBhbnk7XG4gICAgcHVibGljIG1heEJ1ZmZlcjogYW55O1xuICAgIHB1YmxpYyBsYXN0U2Nyb2xsZWQ6IGFueTtcbiAgICBwdWJsaWMgbGFzdFJlcGFpbnRZOiBhbnk7XG4gICAgcHVibGljIHNlbGVjdGVkTGlzdEhlaWdodDogYW55O1xuICAgIHB1YmxpYyBmaWx0ZXJMZW5ndGg6IGFueSA9IDA7XG4gICAgcHVibGljIGluZmluaXRlRmlsdGVyTGVuZ3RoOiBhbnkgPSAwO1xuICAgIHB1YmxpYyB2aWV3UG9ydEl0ZW1zOiBhbnk7XG4gICAgcHVibGljIGl0ZW06IGFueTtcbiAgICBwdWJsaWMgZHJvcGRvd25MaXN0WU9mZnNldDogbnVtYmVyID0gMDtcbiAgICBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcbiAgICBkZWZhdWx0U2V0dGluZ3M6IERyb3Bkb3duU2V0dGluZ3MgPSB7XG4gICAgICAgIHNpbmdsZVNlbGVjdGlvbjogZmFsc2UsXG4gICAgICAgIHRleHQ6ICdTZWxlY3QnLFxuICAgICAgICBlbmFibGVDaGVja0FsbDogdHJ1ZSxcbiAgICAgICAgc2VsZWN0QWxsVGV4dDogJ1NlbGVjdCBBbGwnLFxuICAgICAgICB1blNlbGVjdEFsbFRleHQ6ICdVblNlbGVjdCBBbGwnLFxuICAgICAgICBmaWx0ZXJTZWxlY3RBbGxUZXh0OiAnU2VsZWN0IGFsbCBmaWx0ZXJlZCByZXN1bHRzJyxcbiAgICAgICAgZmlsdGVyVW5TZWxlY3RBbGxUZXh0OiAnVW5TZWxlY3QgYWxsIGZpbHRlcmVkIHJlc3VsdHMnLFxuICAgICAgICBlbmFibGVTZWFyY2hGaWx0ZXI6IGZhbHNlLFxuICAgICAgICBzZWFyY2hCeTogW10sXG4gICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICBiYWRnZVNob3dMaW1pdDogOTk5OTk5OTk5OTk5LFxuICAgICAgICBjbGFzc2VzOiAnJyxcbiAgICAgICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICBzZWFyY2hQbGFjZWhvbGRlclRleHQ6ICdTZWFyY2gnLFxuICAgICAgICBzaG93Q2hlY2tib3g6IHRydWUsXG4gICAgICAgIG5vRGF0YUxhYmVsOiAnTm8gRGF0YSBBdmFpbGFibGUnLFxuICAgICAgICBzZWFyY2hBdXRvZm9jdXM6IHRydWUsXG4gICAgICAgIGxhenlMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgbGFiZWxLZXk6ICdpdGVtTmFtZScsXG4gICAgICAgIHByaW1hcnlLZXk6ICdpZCcsXG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgYXV0b1Bvc2l0aW9uOiB0cnVlLFxuICAgICAgICBlbmFibGVGaWx0ZXJTZWxlY3RBbGw6IHRydWUsXG4gICAgICAgIHNlbGVjdEdyb3VwOiBmYWxzZSxcbiAgICAgICAgYWRkTmV3SXRlbU9uRmlsdGVyOiBmYWxzZSxcbiAgICAgICAgYWRkTmV3QnV0dG9uVGV4dDogXCJBZGRcIixcbiAgICAgICAgZXNjYXBlVG9DbG9zZTogdHJ1ZSxcbiAgICAgICAgY2xlYXJBbGw6IHRydWVcbiAgICB9XG4gICAgcmFuZG9tU2l6ZTpib29sZWFuID0gdHJ1ZTtcbiAgICBwdWJsaWMgcGFyc2VFcnJvcjogYm9vbGVhbjtcbiAgICBwdWJsaWMgZmlsdGVyZWRMaXN0OiBhbnkgPSBbXTtcbiAgICB2aXJ0dWFsU2Nyb29sbEluaXQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBAVmlld0NoaWxkKFZpcnR1YWxTY3JvbGxlckNvbXBvbmVudCwge3N0YXRpYzogZmFsc2V9KVxuICAgIHByaXZhdGUgdmlydHVhbFNjcm9sbGVyOiBWaXJ0dWFsU2Nyb2xsZXJDb21wb25lbnQ7XG4gICAgY29uc3RydWN0b3IocHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgZHM6IERhdGFTZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoVGVybSQuYXNPYnNlcnZhYmxlKCkucGlwZShcbiAgICAgICAgZGVib3VuY2VUaW1lKDEwMDApLFxuICAgICAgICBkaXN0aW5jdFVudGlsQ2hhbmdlZCgpLFxuICAgICAgICB0YXAodGVybSA9PiB0ZXJtKVxuICAgICAgICApLnN1YnNjcmliZSh2YWwgPT4ge1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJJbmZpbml0ZUxpc3QodmFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG5cbiAgICAgICAgdGhpcy5jYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmRhdGEpO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NpdGlvbiA9PSAndG9wJykge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZExpc3RIZWlnaHQgPSB7IHZhbDogMCB9O1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaXN0SGVpZ2h0LnZhbCA9IHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gdGhpcy5kcy5nZXREYXRhKCkuc3Vic2NyaWJlKGRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBsZXQgbGVuID0gMDtcbiAgICAgICAgICAgICAgICBkYXRhLmZvckVhY2goKG9iajogYW55LCBpOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoJ2dycFRpdGxlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbisrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJMZW5ndGggPSBsZW47XG4gICAgICAgICAgICAgICAgdGhpcy5vbkZpbHRlckNoYW5nZShkYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZURyb3Bkb3duRGlyZWN0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnZpcnR1YWxTY3Jvb2xsSW5pdCA9IGZhbHNlO1xuICAgIH1cbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2VzLmRhdGEgJiYgIWNoYW5nZXMuZGF0YS5maXJzdENoYW5nZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEodGhpcy5kYXRhLCB0aGlzLnNldHRpbmdzLmdyb3VwQnkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYWNoZWRJdGVtcyA9IHRoaXMuY2xvbmVBcnJheSh0aGlzLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFuZ2VzLnNldHRpbmdzICYmICFjaGFuZ2VzLnNldHRpbmdzLmZpcnN0Q2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoYW5nZXMubG9hZGluZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5sb2FkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0aGlzLnNldHRpbmdzLmxhenlMb2FkaW5nICYmIHRoaXMudmlydHVhbFNjcm9vbGxJbml0ICYmIGNoYW5nZXMuZGF0YSl7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gY2hhbmdlcy5kYXRhLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBuZ0RvQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09IDAgfHwgdGhpcy5kYXRhLmxlbmd0aCA9PSAwIHx8IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPCB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgIC8vIHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibGF6eUNvbnRhaW5lclwiKVswXS5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm9uU2Nyb2xsLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCAmJiB0aGlzLnNldHRpbmdzLnBvc2l0aW9uID09ICd0b3AnICYmIHRoaXMuc2VsZWN0ZWRMaXN0SGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGlzdEhlaWdodC52YWwgPSB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25JdGVtQ2xpY2soaXRlbTogYW55LCBpbmRleDogbnVtYmVyLCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZm91bmQgPSB0aGlzLmlzU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPCB0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVTZWxlY3RlZChpdGVtKTtcbiAgICAgICAgICAgIHRoaXMub25EZVNlbGVjdC5lbWl0KGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0QWxsIHx8IHRoaXMuZGF0YS5sZW5ndGggPiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPT0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHVibGljIHZhbGlkYXRlKGM6IEZvcm1Db250cm9sKTogYW55IHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHByaXZhdGUgb25Ub3VjaGVkQ2FsbGJhY2s6IChfOiBhbnkpID0+IHZvaWQgPSBub29wO1xuICAgIHByaXZhdGUgb25DaGFuZ2VDYWxsYmFjazogKF86IGFueSkgPT4gdm9pZCA9IG5vb3A7XG5cbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zaW5nbGVTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLnRyYW5zZm9ybURhdGEodGhpcy5kYXRhLCB0aGlzLnNldHRpbmdzLmdyb3VwQnkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cGVkRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFt2YWx1ZVswXV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbdmFsdWVbMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBNeUV4Y2VwdGlvbig0MDQsIHsgXCJtc2dcIjogXCJTaW5nbGUgU2VsZWN0aW9uIE1vZGUsIFNlbGVjdGVkIEl0ZW1zIGNhbm5vdCBoYXZlIG1vcmUgdGhhbiBvbmUgaXRlbS5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUuYm9keS5tc2cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5saW1pdFNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB2YWx1ZS5zbGljZSgwLCB0aGlzLnNldHRpbmdzLmxpbWl0U2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCA9PT0gdGhpcy5kYXRhLmxlbmd0aCAmJiB0aGlzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy50cmFuc2Zvcm1EYXRhKHRoaXMuZGF0YSwgdGhpcy5zZXR0aW5ncy5ncm91cEJ5KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZ3JvdXBlZERhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9Gcm9tIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxuICAgIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSkge1xuICAgICAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sgPSBmbjtcbiAgICB9XG5cbiAgICAvL0Zyb20gQ29udHJvbFZhbHVlQWNjZXNzb3IgaW50ZXJmYWNlXG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSkge1xuICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrID0gZm47XG4gICAgfVxuICAgIHRyYWNrQnlGbihpbmRleDogbnVtYmVyLCBpdGVtOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XTtcbiAgICB9XG4gICAgaXNTZWxlY3RlZChjbGlja2VkSXRlbTogYW55KSB7XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgJiYgdGhpcy5zZWxlY3RlZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBpZiAoY2xpY2tlZEl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSA9PT0gaXRlbVt0aGlzLnNldHRpbmdzLnByaW1hcnlLZXldKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH1cbiAgICBhZGRTZWxlY3RlZChpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2luZ2xlU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5jbG9zZURyb3Bkb3duKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgfVxuICAgIHJlbW92ZVNlbGVjdGVkKGNsaWNrZWRJdGVtOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zICYmIHRoaXMuc2VsZWN0ZWRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaWYgKGNsaWNrZWRJdGVtW3RoaXMuc2V0dGluZ3MucHJpbWFyeUtleV0gPT09IGl0ZW1bdGhpcy5zZXR0aW5ncy5wcmltYXJ5S2V5XSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcy5zcGxpY2UodGhpcy5zZWxlY3RlZEl0ZW1zLmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICB9XG4gICAgdG9nZ2xlRHJvcGRvd24oZXZ0OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQWN0aXZlID0gIXRoaXMuaXNBY3RpdmU7XG4gICAgICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5zZWFyY2hBdXRvZm9jdXMgJiYgdGhpcy5zZWFyY2hJbnB1dCAmJiB0aGlzLnNldHRpbmdzLmVuYWJsZVNlYXJjaEZpbHRlciAmJiAhdGhpcy5zZWFyY2hUZW1wbCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub25PcGVuLmVtaXQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdChmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZURyb3Bkb3duRGlyZWN0aW9uKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgICBpZih0aGlzLnNldHRpbmdzLmxhenlMb2FkaW5nKXtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxTY3Jvb2xsSW5pdCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICAgIHB1YmxpYyBvcGVuRHJvcGRvd24oKSB7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNlYXJjaEF1dG9mb2N1cyAmJiB0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MuZW5hYmxlU2VhcmNoRmlsdGVyICYmICF0aGlzLnNlYXJjaFRlbXBsKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25PcGVuLmVtaXQodHJ1ZSk7XG4gICAgfVxuICAgIHB1YmxpYyBjbG9zZURyb3Bkb3duKCkge1xuICAgICAgICBpZiAodGhpcy5zZWFyY2hJbnB1dCAmJiB0aGlzLnNldHRpbmdzLmxhenlMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0KSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsdGVyID0gXCJcIjtcbiAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdChmYWxzZSk7XG4gICAgfVxuICAgIHB1YmxpYyBjbG9zZURyb3Bkb3duT25DbGlja091dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlYXJjaElucHV0ICYmIHRoaXMuc2V0dGluZ3MubGF6eUxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VhcmNoSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaElucHV0Lm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maWx0ZXIgPSBcIlwiO1xuICAgICAgICAgICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jbGVhclNlYXJjaCgpO1xuICAgICAgICAgICAgdGhpcy5vbkNsb3NlLmVtaXQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvZ2dsZVNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLmRhdGEuc2xpY2UoKTtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG5cbiAgICAgICAgICAgIHRoaXMub25TZWxlY3RBbGwuZW1pdCh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBDYWNoZWRJdGVtcy5mb3JFYWNoKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgICAgICB0aGlzLm9uVG91Y2hlZENhbGxiYWNrKHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG5cbiAgICAgICAgICAgIHRoaXMub25EZVNlbGVjdEFsbC5lbWl0KHRoaXMuc2VsZWN0ZWRJdGVtcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmlsdGVyR3JvdXBlZExpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbHRlciA9PSBcIlwiIHx8IHRoaXMuZmlsdGVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTZWFyY2goKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5jbG9uZUFycmF5KHRoaXMuZ3JvdXBDYWNoZWRJdGVtcyk7XG4gICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmdyb3VwZWREYXRhLmZpbHRlcihvYmogPT4ge1xuICAgICAgICAgICAgbGV0IGFyciA9IG9iai5saXN0LmZpbHRlcih0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdC5pdGVtTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGhpcy5maWx0ZXIudG9Mb3dlckNhc2UoKSkgPiAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb2JqLmxpc3QgPSBhcnI7XG4gICAgICAgICAgICByZXR1cm4gYXJyLnNvbWUoY2F0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2F0Lml0ZW1OYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih0aGlzLmZpbHRlci50b0xvd2VyQ2FzZSgpKSA+IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ncm91cGVkRGF0YSk7XG4gICAgfVxuICAgIHRvZ2dsZUZpbHRlclNlbGVjdEFsbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRmlsdGVyU2VsZWN0QWxsKSB7XG4gICAgICAgICAgICBsZXQgYWRkZWQgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkZWQucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcy5nZXRGaWx0ZXJlZERhdGEoKS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRlZC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm9uRmlsdGVyU2VsZWN0QWxsLmVtaXQoYWRkZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5saXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRzLmdldEZpbHRlcmVkRGF0YSgpLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMub25GaWx0ZXJEZVNlbGVjdEFsbC5lbWl0KHJlbW92ZWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRvZ2dsZUluZmluaXRlRmlsdGVyU2VsZWN0QWxsKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VsZWN0ZWQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChpdGVtKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmlzSW5maW5pdGVGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhclNlYXJjaCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZ3JvdXBCeSkge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5ncm91cENhY2hlZEl0ZW1zLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuZ3JvdXBlZERhdGEgPSB0aGlzLmNsb25lQXJyYXkodGhpcy5ncm91cENhY2hlZEl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcblxuICAgIH1cbiAgICBvbkZpbHRlckNoYW5nZShkYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyICYmIHRoaXMuZmlsdGVyID09IFwiXCIgfHwgZGF0YS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICBkYXRhLmZvckVhY2goKGl0ZW06IGFueSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoIWl0ZW0uaGFzT3duUHJvcGVydHkoJ2dycFRpdGxlJykgJiYgdGhpcy5pc1NlbGVjdGVkKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjbnQgPiAwICYmIHRoaXMuZmlsdGVyTGVuZ3RoID09IGNudCkge1xuICAgICAgICAgICAgdGhpcy5pc0ZpbHRlclNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY250ID4gMCAmJiB0aGlzLmZpbHRlckxlbmd0aCAhPSBjbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNGaWx0ZXJTZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgfVxuICAgIGNsb25lQXJyYXkoYXJyOiBhbnkpIHtcbiAgICAgICAgbGV0IGksIGNvcHk7XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJyKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHRocm93ICdDYW5ub3QgY2xvbmUgYXJyYXkgY29udGFpbmluZyBhbiBvYmplY3QhJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhcnI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlR3JvdXBJbmZvKGl0ZW06IGFueSkge1xuICAgICAgICBsZXQga2V5ID0gdGhpcy5zZXR0aW5ncy5ncm91cEJ5O1xuICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgY250ID0gMDtcbiAgICAgICAgICAgIGlmIChvYmouZ3JwVGl0bGUgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLmxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxpc3QuZm9yRWFjaCgoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZChlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9iai5saXN0ICYmIChjbnQgPT09IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2JqLmxpc3QgJiYgKGNudCAhPSBvYmoubGlzdC5sZW5ndGgpICYmIChpdGVtW2tleV0gPT0gb2JqW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgb2JqLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmdyb3VwQ2FjaGVkSXRlbXMuZm9yRWFjaCgob2JqOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICAgICAgaWYgKG9iai5ncnBUaXRsZSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmoubGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBvYmoubGlzdC5mb3JFYWNoKChlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKGVsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2JqLmxpc3QgJiYgKGNudCA9PT0gb2JqLmxpc3QubGVuZ3RoKSAmJiAoaXRlbVtrZXldID09IG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChvYmoubGlzdCAmJiAoY250ICE9IG9iai5saXN0Lmxlbmd0aCkgJiYgKGl0ZW1ba2V5XSA9PSBvYmpba2V5XSkpIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRyYW5zZm9ybURhdGEoYXJyOiBBcnJheTxhbnk+LCBmaWVsZDogYW55KTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGdyb3VwZWRPYmo6IGFueSA9IGFyci5yZWR1Y2UoKHByZXY6IGFueSwgY3VyOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmICghcHJldltjdXJbZmllbGRdXSkge1xuICAgICAgICAgICAgICAgIHByZXZbY3VyW2ZpZWxkXV0gPSBbY3VyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJldltjdXJbZmllbGRdXS5wdXNoKGN1cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJldjtcbiAgICAgICAgfSwge30pO1xuICAgICAgICBjb25zdCB0ZW1wQXJyOiBhbnkgPSBbXTtcbiAgICAgICAgT2JqZWN0LmtleXMoZ3JvdXBlZE9iaikubWFwKCh4OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGxldCBvYmo6IGFueSA9IHt9O1xuICAgICAgICAgICAgb2JqW1wiZ3JwVGl0bGVcIl0gPSB0cnVlO1xuICAgICAgICAgICAgb2JqW3RoaXMuc2V0dGluZ3MubGFiZWxLZXldID0geDtcbiAgICAgICAgICAgIG9ialt0aGlzLnNldHRpbmdzLmdyb3VwQnldID0geDtcbiAgICAgICAgICAgIG9ialsnc2VsZWN0ZWQnXSA9IGZhbHNlO1xuICAgICAgICAgICAgb2JqWydsaXN0J10gPSBbXTtcbiAgICAgICAgICAgIGxldCBjbnQgPSAwO1xuICAgICAgICAgICAgZ3JvdXBlZE9ialt4XS5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtWydsaXN0J10gPSBbXTtcbiAgICAgICAgICAgICAgICBvYmoubGlzdC5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY250Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY250ID09IG9iai5saXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9iai5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYmouc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbXBBcnIucHVzaChvYmopO1xuICAgICAgICAgICAgLy8gb2JqLmxpc3QuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgdGVtcEFyci5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGVtcEFycjtcbiAgICB9XG4gICAgcHVibGljIGZpbHRlckluZmluaXRlTGlzdChldnQ6IGFueSkge1xuICAgICAgICBsZXQgZmlsdGVyZWRFbGVtczogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zLnNsaWNlKCk7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gdGhpcy5jYWNoZWRJdGVtcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChldnQgIT0gbnVsbCB8fCBldnQgIT0gJycpICYmICF0aGlzLnNldHRpbmdzLmdyb3VwQnkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnNlYXJjaEJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IHRoaXMuc2V0dGluZ3Muc2VhcmNoQnkubGVuZ3RoOyB0KyspIHtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhLmZpbHRlcigoZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3RoaXMuc2V0dGluZ3Muc2VhcmNoQnlbdF0udG9TdHJpbmcoKV0udG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZXZ0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkRWxlbXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXJ0dWFsZGF0YS5maWx0ZXIoZnVuY3Rpb24gKGVsOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gZmlsdGVyZWRFbGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSB0aGlzLnZpcnR1YWxkYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZ0LnRvU3RyaW5nKCkgIT0gJycgJiYgdGhpcy5zZXR0aW5ncy5ncm91cEJ5KSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhLmZpbHRlcihmdW5jdGlvbiAoZWw6IGFueSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5oYXNPd25Qcm9wZXJ0eSgnZ3JwVGl0bGUnKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsW3Byb3BdLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKGV2dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEVsZW1zLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gZmlsdGVyZWRFbGVtcztcbiAgICAgICAgICAgIHRoaXMuaW5maW5pdGVGaWx0ZXJMZW5ndGggPSB0aGlzLmdyb3VwZWREYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldnQudG9TdHJpbmcoKSA9PSAnJyAmJiB0aGlzLmNhY2hlZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zO1xuICAgICAgICAgICAgdGhpcy5pbmZpbml0ZUZpbHRlckxlbmd0aCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsU2Nyb2xsZXIucmVmcmVzaCgpO1xuICAgIH1cbiAgICByZXNldEluZmluaXRlU2VhcmNoKCkge1xuICAgICAgICB0aGlzLmZpbHRlciA9IFwiXCI7XG4gICAgICAgIHRoaXMuaXNJbmZpbml0ZUZpbHRlclNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpcnR1YWxkYXRhID0gW107XG4gICAgICAgIHRoaXMudmlydHVhbGRhdGEgPSB0aGlzLmNhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmdyb3VwZWREYXRhID0gdGhpcy5ncm91cENhY2hlZEl0ZW1zO1xuICAgICAgICB0aGlzLmluZmluaXRlRmlsdGVyTGVuZ3RoID0gMDtcbiAgICB9XG4gICAgb25TY3JvbGxFbmQoZTogYW55KSB7XG4gICAgICAgIGlmKGUuZW5kSW5kZXggPT09IHRoaXMuZGF0YS5sZW5ndGggLSAxIHx8IGUuc3RhcnRJbmRleCA9PT0gMCl7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9uU2Nyb2xsVG9FbmQuZW1pdChlKTtcbiAgICAgICAgXG4gICAgfVxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBzZWxlY3RHcm91cChpdGVtOiBhbnkpIHtcbiAgICAgICAgaWYgKGl0ZW0uc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGl0ZW0ubGlzdC5mb3JFYWNoKChvYmo6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0ZWQob2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVHcm91cEluZm8oaXRlbSk7XG4gICAgICAgICAgICB0aGlzLm9uR3JvdXBTZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaXRlbS5saXN0LmZvckVhY2goKG9iajogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlR3JvdXBJbmZvKGl0ZW0pO1xuICAgICAgICAgICAgdGhpcy5vbkdyb3VwRGVTZWxlY3QuZW1pdChpdGVtKTtcbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgYWRkRmlsdGVyTmV3SXRlbSgpIHtcbiAgICAgICAgdGhpcy5vbkFkZEZpbHRlck5ld0l0ZW0uZW1pdCh0aGlzLmZpbHRlcik7XG4gICAgICAgIHRoaXMuZmlsdGVyUGlwZSA9IG5ldyBMaXN0RmlsdGVyUGlwZSh0aGlzLmRzKTtcbiAgICAgICAgdGhpcy5maWx0ZXJQaXBlLnRyYW5zZm9ybSh0aGlzLmRhdGEsIHRoaXMuZmlsdGVyLCB0aGlzLnNldHRpbmdzLnNlYXJjaEJ5KTtcbiAgICB9XG4gICAgY2FsY3VsYXRlRHJvcGRvd25EaXJlY3Rpb24oKSB7XG4gICAgICAgIGxldCBzaG91bGRPcGVuVG93YXJkc1RvcCA9IHRoaXMuc2V0dGluZ3MucG9zaXRpb24gPT0gJ3RvcCc7XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG9Qb3NpdGlvbikge1xuICAgICAgICAgICAgY29uc3QgZHJvcGRvd25IZWlnaHQgPSB0aGlzLmRyb3Bkb3duTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCB2aWV3cG9ydEhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZExpc3RCb3VuZHMgPSB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgY29uc3Qgc3BhY2VPblRvcDogbnVtYmVyID0gc2VsZWN0ZWRMaXN0Qm91bmRzLnRvcDtcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlT25Cb3R0b206IG51bWJlciA9IHZpZXdwb3J0SGVpZ2h0IC0gc2VsZWN0ZWRMaXN0Qm91bmRzLnRvcDtcbiAgICAgICAgICAgIGlmIChzcGFjZU9uQm90dG9tIDwgc3BhY2VPblRvcCAmJiBkcm9wZG93bkhlaWdodCA8IHNwYWNlT25Ub3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5Ub3dhcmRzVG9wKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuVG93YXJkc1RvcChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBLZWVwIHByZWZlcmVuY2UgaWYgdGhlcmUgaXMgbm90IGVub3VnaCBzcGFjZSBvbiBlaXRoZXIgdGhlIHRvcCBvciBib3R0b21cbiAgICAgICAgICAgIC8qIFx0XHRcdGlmIChzcGFjZU9uVG9wIHx8IHNwYWNlT25Cb3R0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkT3BlblRvd2FyZHNUb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkT3BlblRvd2FyZHNUb3AgPSBzcGFjZU9uVG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZE9wZW5Ub3dhcmRzVG9wID0gIXNwYWNlT25Cb3R0b207XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSAqL1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgb3BlblRvd2FyZHNUb3AodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHRoaXMuc2VsZWN0ZWRMaXN0RWxlbS5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5kcm9wZG93bkxpc3RZT2Zmc2V0ID0gMTUgKyB0aGlzLnNlbGVjdGVkTGlzdEVsZW0ubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRyb3Bkb3duTGlzdFlPZmZzZXQgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyU2VsZWN0aW9uKGU6IGFueSkge1xuICAgICAgICB0aGlzLmNsZWFyU2VhcmNoKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtdO1xuICAgICAgICB0aGlzLm9uRGVTZWxlY3RBbGwuZW1pdCh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgIH1cbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBGb3Jtc01vZHVsZSwgVmlydHVhbFNjcm9sbGVyTW9kdWxlXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtBbmd1bGFyTXVsdGlTZWxlY3QsIENsaWNrT3V0c2lkZURpcmVjdGl2ZSwgU2Nyb2xsRGlyZWN0aXZlLCBzdHlsZURpcmVjdGl2ZSwgTGlzdEZpbHRlclBpcGUsIEl0ZW0sIFRlbXBsYXRlUmVuZGVyZXIsIEJhZGdlLCBTZWFyY2gsIHNldFBvc2l0aW9uLCBDSWNvbl0sXG4gICAgZXhwb3J0czogW0FuZ3VsYXJNdWx0aVNlbGVjdCwgQ2xpY2tPdXRzaWRlRGlyZWN0aXZlLCBTY3JvbGxEaXJlY3RpdmUsIHN0eWxlRGlyZWN0aXZlLCBMaXN0RmlsdGVyUGlwZSwgSXRlbSwgVGVtcGxhdGVSZW5kZXJlciwgQmFkZ2UsIFNlYXJjaCwgc2V0UG9zaXRpb24sIENJY29uXSxcbiAgICBwcm92aWRlcnM6IFtEYXRhU2VydmljZV1cbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhck11bHRpU2VsZWN0TW9kdWxlIHsgfVxuIl19