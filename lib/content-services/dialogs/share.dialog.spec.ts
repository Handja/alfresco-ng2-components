/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { async, TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Observable } from 'rxjs/Observable';

import { ShareDialogComponent } from './share.dialog';

describe('ShareDialogComponent', () => {

    let fixture: ComponentFixture<ShareDialogComponent>;
    let component: ShareDialogComponent;
    let dialogRef;

    let data: any = {
        node: { entry: { properties: { 'qshare:sharedId': 'example-link' }, name: 'example-name' } }
        baseShareUrl: 'baseShareUrl-example'
    };

    beforeEach(async(() => {
        dialogRef = {
            close: jasmine.createSpy('close')
        };

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                BrowserDynamicTestingModule
            ],
            declarations: [
                ShareDialogComponent
            ],
            providers: [
                { provide: MatDialogRef, useValue: dialogRef },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: data
                }
            ]
        });

        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: { entryComponents: [ShareDialogComponent] }
        });

        TestBed.compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ShareDialogComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should init the dialog with the file name and baseShareUrl', () => {
        expect(component.fileName).toBe('example-name');
        expect(component.baseShareUrl).toBe('baseShareUrl-example');
    });

    describe('public link creation', () => {

        it('should not create the public link if it alredy present in the node', () => {
            let spyCreate = spyOn(component, 'createSharedLinks').and.returnValue(Observable.of(''));

            component.ngOnInit();

            expect(spyCreate).not.toHaveBeenCalled();
        });

        it('should not create the public link if it alredy present in the node', () => {
            component.data = {
                node: { entry: { name: 'example-name' } }
                baseShareUrl: 'baseShareUrl-example'
            };

            let spyCreate = spyOn(component, 'createSharedLinks').and.returnValue(Observable.of(''));

            data = {
                node: { entry: { name: 'example-name' } }
                baseShareUrl: 'baseShareUrl-example'
            };

            component.ngOnInit();

            expect(spyCreate).toHaveBeenCalled();
        });
    });

});
