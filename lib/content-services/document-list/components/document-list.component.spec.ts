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

import { CUSTOM_ELEMENTS_SCHEMA, NgZone, SimpleChange, TemplateRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlfrescoApiService, TranslationService } from '@alfresco/adf-core';
import { DataColumn, DataTableComponent } from '@alfresco/adf-core';
import { DataTableModule } from '@alfresco/adf-core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FileNode, FolderNode } from '../../mock';
import {
    fakeNodeAnswerWithNOEntries,
    fakeNodeWithCreatePermission,
    fakeNodeWithNoPermission,
    fakeGetSitesAnswer,
    fakeGetSiteMembership
} from '../../mock';
import { ContentActionModel } from '../models/content-action.model';
import { NodeMinimal, NodeMinimalEntry, NodePaging } from '../models/document-library.model';
import { ImageResolver } from './../data/image-resolver.model';
import { RowFilter } from './../data/row-filter.model';

import { DocumentListService } from './../services/document-list.service';
import { CustomResourcesService } from './../services/custom-resources.service';
import { DocumentListComponent } from './document-list.component';

declare let jasmine: any;

describe('DocumentList', () => {

    let documentList: DocumentListComponent;
    let documentListService: DocumentListService;
    let apiService: AlfrescoApiService;
    let customResourcesService: CustomResourcesService;
    let fixture: ComponentFixture<DocumentListComponent>;
    let element: HTMLElement;
    let eventMock: any;

    beforeEach(async(() => {
        let zone = new NgZone({ enableLongStackTrace: false });

        TestBed.configureTestingModule({
            imports: [
                DataTableModule
            ],
            declarations: [
                DocumentListComponent
            ],
            providers: [
                DocumentListService,
                CustomResourcesService,
                { provide: NgZone, useValue: zone }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        eventMock = {
            preventDefault: function () {
            }
        };

        fixture = TestBed.createComponent(DocumentListComponent);

        let translateService = TestBed.get(TranslationService);
        spyOn(translateService, 'get').and.callFake((key) => {
            return Observable.of(key);
        });

        element = fixture.nativeElement;
        documentList = fixture.componentInstance;
        documentListService = TestBed.get(DocumentListService);
        apiService = TestBed.get(AlfrescoApiService);
        customResourcesService = TestBed.get(CustomResourcesService);

        fixture.detectChanges();
    });

    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    it('should setup default columns', () => {
        documentList.ngAfterContentInit();

        expect(documentList.data.getColumns().length).not.toBe(0);
    });

    it('should add the custom columns', () => {
        let column = <DataColumn> {
            title: 'title',
            key: 'source',
            cssClass: 'css',
            srTitle: '',
            type: 'text',
            format: ''
        };

        let columns = documentList.data.getColumns();
        columns.push(column);

        documentList.ngAfterContentInit();
        expect(columns.length).toBe(6);
        expect(columns[5]).toBe(column);
    });

    it('should call action\'s handler with node', () => {
        let node = new FileNode();
        let action = new ContentActionModel();
        action.handler = () => {
        };

        spyOn(action, 'handler').and.stub();

        documentList.executeContentAction(node, action);
        expect(action.handler).toHaveBeenCalledWith(node, documentList, undefined);

    });

    it('should call action\'s handler with node and permission', () => {
        let node = new FileNode();
        let action = new ContentActionModel();
        action.handler = () => {
        };
        action.permission = 'fake-permission';
        spyOn(action, 'handler').and.stub();

        documentList.executeContentAction(node, action);

        expect(action.handler).toHaveBeenCalledWith(node, documentList, 'fake-permission');
    });

    it('should call action\'s execute with node if it is defined', () => {
        let node = new FileNode();
        let action = new ContentActionModel();
        action.execute = () => {
        };
        spyOn(action, 'execute').and.stub();

        documentList.executeContentAction(node, action);

        expect(action.execute).toHaveBeenCalledWith(node);
    });

    it('should call action\'s execute only after the handler has been executed', () => {
        const deleteObservable: Subject<any> = new Subject<any>();
        let node = new FileNode();
        let action = new ContentActionModel();
        action.handler = () => deleteObservable;
        action.execute = () => {
        };
        spyOn(action, 'execute').and.stub();

        documentList.executeContentAction(node, action);

        expect(action.execute).not.toHaveBeenCalled();
        deleteObservable.next();
        expect(action.execute).toHaveBeenCalledWith(node);
    });

    it('should show the loading state during the loading of new elements', (done) => {
        documentList.ngAfterContentInit();
        documentList.node = new NodePaging();

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(element.querySelector('.adf-document-list-loading')).toBeDefined();
            done();
        });
    });

    it('should hide the header if showHeader is false', (done) => {
        documentList.showHeader = false;

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(element.querySelector('.adf-datatable-header')).toBe(null);
            done();
        });
    });

    it('should show the header if showHeader is true', (done) => {
        documentList.showHeader = true;

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(element.querySelector('.adf-datatable-header')).toBeDefined();
            done();
        });
    });

    it('should reset selection upon reload', () => {
        spyOn(documentList, 'resetSelection').and.callThrough();

        documentList.reload();
        fixture.detectChanges();

        expect(documentList.resetSelection).toHaveBeenCalled();
    });

    it('should use the cardview style if cardview is true', (done) => {
        documentList.display = 'gallery';

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(element.querySelector('.adf-data-table-card')).toBeDefined();
            done();
        });
    });

    it('should use the base document list style if cardview is false', (done) => {
        documentList.display = 'list';

        fixture.detectChanges();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(element.querySelector('.adf-data-table-card')).toBe(null);
            expect(element.querySelector('.adf-data-table')).toBeDefined();
            done();
        });
    });

    it('should reset selection upon reload', () => {
        spyOn(documentList, 'resetSelection').and.callThrough();

        documentList.reload();
        fixture.detectChanges();

        expect(documentList.resetSelection).toHaveBeenCalled();
    });

    it('should reset when a prameter changes', () => {
        spyOn(documentList.dataTable, 'resetSelection').and.callThrough();

        documentList.ngOnChanges({});
        expect(documentList.dataTable.resetSelection).toHaveBeenCalled();
    });

    it('should empty template be present when no element are present', (done) => {
        documentList.currentFolderId = '1d26e465-dea3-42f3-b415-faa8364b9692';
        documentList.folderNode = new NodeMinimal();
        documentList.folderNode.id = '1d26e465-dea3-42f3-b415-faa8364b9692';

        documentList.reload();

        fixture.detectChanges();

        documentList.ready.subscribe(() => {
            fixture.detectChanges();
            expect(element.querySelector('#adf-document-list-empty')).toBeDefined();
            done();
        });

        jasmine.Ajax.requests.at(0).respondWith({
            status: 200,
            contentType: 'application/json',
            responseText: JSON.stringify(fakeNodeAnswerWithNOEntries)
        });
    });

    it('should not execute action without node provided', () => {
        let action = new ContentActionModel();
        action.handler = function () {
        };

        spyOn(action, 'handler').and.stub();
        documentList.executeContentAction(null, action);
        expect(action.handler).not.toHaveBeenCalled();
    });

    it('should not give node actions for empty target', () => {
        let actions = documentList.getNodeActions(null);
        expect(actions.length).toBe(0);
    });

    it('should filter content actions for various targets', () => {
        let folderMenu = new ContentActionModel();
        folderMenu.target = 'folder';

        let documentMenu = new ContentActionModel();
        documentMenu.target = 'document';

        documentList.actions = [
            folderMenu,
            documentMenu
        ];

        let actions = documentList.getNodeActions(new FolderNode());
        expect(actions.length).toBe(1);
        expect(actions[0].target).toBe(folderMenu.target);

        actions = documentList.getNodeActions(new FileNode());
        expect(actions.length).toBe(1);
        expect(actions[0].target).toBe(documentMenu.target);
    });

    it('should disable the action if there is no permission for the file and disableWithNoPermission true', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: true,
            permission: 'delete',
            target: 'document',
            title: 'FileAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFile: true, name: 'xyz', allowableOperations: ['create', 'update'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FileAction');
        expect(actions[0].disabled).toBe(true);

    });

    it('should not disable the action if there is copy permission', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: true,
            permission: 'copy',
            target: 'document',
            title: 'FileAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFile: true, name: 'xyz', allowableOperations: ['create', 'update'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FileAction');
        expect(actions[0].disabled).toBeFalsy();

    });

    it('should disable the action if there is no permission for the folder and disableWithNoPermission true', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: true,
            permission: 'delete',
            target: 'folder',
            title: 'FolderAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFolder: true, name: 'xyz', allowableOperations: ['create', 'update'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FolderAction');
        expect(actions[0].disabled).toBe(true);

    });

    it('should disable the action if there is no permission for the file and disableWithNoPermission false', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: false,
            permission: 'delete',
            target: 'document',
            title: 'FileAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFile: true, name: 'xyz', allowableOperations: ['create', 'update'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FileAction');
        expect(actions[0].disabled).toBe(true);
    });

    it('should disable the action if there is no permission for the folder and disableWithNoPermission false', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: false,
            permission: 'delete',
            target: 'folder',
            title: 'FolderAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFolder: true, name: 'xyz', allowableOperations: ['create', 'update'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FolderAction');
        expect(actions[0].disabled).toBe(true);
    });

    it('should not disable the action if there is the right permission for the file', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: true,
            permission: 'delete',
            target: 'document',
            title: 'FileAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFile: true, name: 'xyz', allowableOperations: ['create', 'update', 'delete'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FileAction');
        expect(actions[0].disabled).toBeUndefined();
    });

    it('should not disable the action if there is the right permission for the folder', () => {
        let documentMenu = new ContentActionModel({
            disableWithNoPermission: true,
            permission: 'delete',
            target: 'folder',
            title: 'FolderAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFolder: true, name: 'xyz', allowableOperations: ['create', 'update', 'delete'] } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FolderAction');
        expect(actions[0].disabled).toBeUndefined();
    });

    it('should not disable the action if there are no permissions for the file', () => {
        let documentMenu = new ContentActionModel({
            permission: 'delete',
            target: 'document',
            title: 'FileAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFile: true, name: 'xyz', allowableOperations: null } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FileAction');
        expect(actions[0].disabled).toBeUndefined();
    });

    it('should not disable the action if there are no permissions for the folder', () => {
        let documentMenu = new ContentActionModel({
            permission: 'delete',
            target: 'folder',
            title: 'FolderAction'
        });

        documentList.actions = [
            documentMenu
        ];

        let nodeFile = { entry: { isFolder: true, name: 'xyz', allowableOperations: null } };

        let actions = documentList.getNodeActions(nodeFile);
        expect(actions.length).toBe(1);
        expect(actions[0].title).toEqual('FolderAction');
        expect(actions[0].disabled).toBeUndefined();
    });

    it('should find no content actions', () => {
        let documentButton = new ContentActionModel();
        documentButton.target = 'document';
        documentList.actions = [documentButton];

        let node = new NodeMinimalEntry();
        expect(documentList.getNodeActions(node)).toEqual([]);

        node = new FileNode();
        node.entry.isFile = false;
        node.entry.isFolder = false;
        expect(documentList.getNodeActions(node)).toEqual([]);
    });

    it('should emit nodeClick event', (done) => {
        let node = new FileNode();
        documentList.nodeClick.subscribe(e => {
            expect(e.value).toBe(node);
            done();
        });
        documentList.onNodeClick(node);
    });

    it('should display folder content on click', () => {
        let node = new FolderNode('<display name>');

        spyOn(documentList, 'loadFolder').and.returnValue(Promise.resolve(true));

        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.onNodeClick(node);

        expect(documentList.loadFolder).toHaveBeenCalled();
    });

    it('should not display folder content when no target node provided', () => {
        expect(documentList.navigate).toBe(true);
        spyOn(documentList, 'loadFolder').and.stub();

        documentList.onNodeClick(null);
        expect(documentList.loadFolder).not.toHaveBeenCalled();

    });

    it('should display folder content only on folder node click', () => {
        expect(documentList.navigate).toBe(true);
        spyOn(documentList, 'loadFolder').and.stub();

        let node = new FileNode();
        documentList.onNodeClick(node);

        expect(documentList.loadFolder).not.toHaveBeenCalled();
    });

    it('should not display folder content on click when navigation is off', () => {
        spyOn(documentList, 'loadFolder').and.stub();

        let node = new FolderNode('<display name>');
        documentList.navigate = false;
        documentList.onNodeClick(node);

        expect(documentList.loadFolder).not.toHaveBeenCalled();
    });

    it('should execute context action on callback', () => {
        let action = {
            node: {},
            model: {}
        };

        spyOn(documentList, 'executeContentAction').and.stub();
        documentList.contextActionCallback(action);
        expect(documentList.executeContentAction).toHaveBeenCalledWith(action.node, action.model);
    });

    it('should not execute context action on callback', () => {
        spyOn(documentList, 'executeContentAction').and.stub();
        documentList.contextActionCallback(null);
        expect(documentList.executeContentAction).not.toHaveBeenCalled();
    });

    it('should subscribe to context action handler', () => {
        spyOn(documentList, 'loadFolder').and.stub();
        spyOn(documentList, 'contextActionCallback').and.stub();
        let value = {};
        documentList.ngOnInit();
        documentList.contextActionHandler.next(value);
        expect(documentList.contextActionCallback).toHaveBeenCalledWith(value);
    });

    it('should suppress default context menu', () => {
        documentList.contextMenuActions = true;
        spyOn(eventMock, 'preventDefault').and.stub();
        documentList.onShowContextMenu(eventMock);
        expect(eventMock.preventDefault).toHaveBeenCalled();
    });

    it('should not suppress default context menu', () => {
        documentList.contextMenuActions = false;
        spyOn(eventMock, 'preventDefault').and.stub();
        documentList.onShowContextMenu(eventMock);
        expect(eventMock.preventDefault).not.toHaveBeenCalled();
    });

    it('should emit file preview event on single click', (done) => {
        let file = new FileNode();
        documentList.preview.subscribe(e => {
            expect(e.value).toBe(file);
            done();
        });
        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.onNodeClick(file);
    });

    it('should emit file preview event on double click', (done) => {
        let file = new FileNode();
        documentList.preview.subscribe(e => {
            expect(e.value).toBe(file);
            done();
        });
        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(file);
    });

    it('should perform folder navigation on single click', () => {
        let folder = new FolderNode();
        spyOn(documentList, 'performNavigation').and.stub();

        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.onNodeClick(folder);
        expect(documentList.performNavigation).toHaveBeenCalled();
    });

    it('should perform folder navigation on double click', () => {
        let folder = new FolderNode();
        spyOn(documentList, 'performNavigation').and.stub();

        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(folder);
        expect(documentList.performNavigation).toHaveBeenCalled();
    });

    it('should not perform folder navigation on double click when single mode', () => {
        let folder = new FolderNode();
        spyOn(documentList, 'performNavigation').and.stub();

        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(folder);

        expect(documentList.performNavigation).not.toHaveBeenCalled();
    });

    it('should not perform folder navigation on double click when navigation off', () => {
        let folder = new FolderNode();
        spyOn(documentList, 'performNavigation').and.stub();

        documentList.navigate = false;
        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(folder);

        expect(documentList.performNavigation).not.toHaveBeenCalled();
    });

    it('should perform navigation for folder node only', () => {
        let folder = new FolderNode();
        let file = new FileNode();

        expect(documentList.performNavigation(folder)).toBeTruthy();
        expect(documentList.performNavigation(file)).toBeFalsy();
        expect(documentList.performNavigation(null)).toBeFalsy();
    });

    it('should require valid node for file preview', () => {
        let file = new FileNode();
        file.entry = null;
        let called = false;

        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.preview.subscribe(val => called = true);

        documentList.onNodeClick(file);
        expect(called).toBeFalsy();

        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(file);
        expect(called).toBeFalsy();
    });

    it('should require valid node for folder navigation', () => {
        let folder = new FolderNode();
        folder.entry = null;
        spyOn(documentList, 'performNavigation').and.stub();

        documentList.navigationMode = DocumentListComponent.SINGLE_CLICK_NAVIGATION;
        documentList.onNodeClick(folder);

        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.onNodeDblClick(folder);

        expect(documentList.performNavigation).not.toHaveBeenCalled();
    });

    it('should display folder content from loadFolder on reload if folderNode defined', () => {
        documentList.folderNode = new NodeMinimal();

        spyOn(documentList, 'loadFolder').and.callThrough();
        documentList.reload();
        expect(documentList.loadFolder).toHaveBeenCalled();
    });

    it('should display folder content from loadFolderByNodeId on reload if currentFolderId defined', () => {
        documentList.currentFolderId = 'id-folder';
        spyOn(documentList, 'loadFolderByNodeId').and.callThrough();
        documentList.reload();
        expect(documentList.loadFolderByNodeId).toHaveBeenCalled();
    });

    it('should require node to resolve context menu actions', () => {
        expect(documentList.getContextActions(null)).toBeNull();

        let file = new FileNode();
        file.entry = null;

        expect(documentList.getContextActions(file)).toBeNull();
    });

    it('should fetch context menu actions for a file node', () => {
        let actionModel: any = {};
        spyOn(documentList, 'getNodeActions').and.returnValue([actionModel]);

        let file = new FileNode();
        let actions = documentList.getContextActions(file);

        expect(documentList.getNodeActions).toHaveBeenCalledWith(file);
        expect(actions.length).toBe(1);
        expect(actions[0].model).toBe(actionModel);
        expect(actions[0].node).toBe(file);
        expect(actions[0].subject).toBe(documentList.contextActionHandler);
    });

    it('should fetch context menu actions for a folder node', () => {
        let actionModel: any = {};
        spyOn(documentList, 'getNodeActions').and.returnValue([actionModel]);

        let folder = new FolderNode();
        let actions = documentList.getContextActions(folder);

        expect(documentList.getNodeActions).toHaveBeenCalledWith(folder);
        expect(actions.length).toBe(1);
        expect(actions[0].model).toBe(actionModel);
        expect(actions[0].node).toBe(folder);
        expect(actions[0].subject).toBe(documentList.contextActionHandler);
    });

    it('should fetch no context menu actions for unknown type', () => {
        spyOn(documentList, 'getNodeActions').and.stub();

        let node = new FileNode();
        node.entry.isFile = false;
        node.entry.isFolder = false;

        let actions = documentList.getContextActions(node);
        expect(actions).toBeNull();
    });

    it('should return null value when no content actions found', () => {
        spyOn(documentList, 'getNodeActions').and.returnValue([]);

        let file = new FileNode();
        let actions = documentList.getContextActions(file);

        expect(actions).toBeNull();
        expect(documentList.getNodeActions).toHaveBeenCalled();
    });

    it('should enforce single-click on mobile browser', () => {
        spyOn(documentList, 'isMobile').and.returnValue(true);
        documentList.navigationMode = DocumentListComponent.DOUBLE_CLICK_NAVIGATION;
        documentList.ngOnInit();
        expect(documentList.isMobile).toHaveBeenCalled();
        expect(documentList.navigationMode).toBe(DocumentListComponent.SINGLE_CLICK_NAVIGATION);
    });

    it('should require dataTable to check empty template', () => {
        documentList.dataTable = null;
        expect(documentList.isEmptyTemplateDefined()).toBeFalsy();
    });

    it('should check [empty folder] template ', () => {
        documentList.emptyFolderTemplate = <TemplateRef<any>> {};
        documentList.dataTable = new DataTableComponent(null, null);
        expect(documentList.dataTable).toBeDefined();
        expect(documentList.isEmptyTemplateDefined()).toBeTruthy();

        documentList.emptyFolderTemplate = null;
        expect(documentList.isEmptyTemplateDefined()).toBeFalsy();
    });

    it('should require dataTable to check no permission template', () => {
        documentList.dataTable = null;
        expect(documentList.isNoPermissionTemplateDefined()).toBe(false);
    });

    it('should return true if custom permission template is provided', () => {
        documentList.noPermissionTemplate = <TemplateRef<any>> {};
        documentList.dataTable = new DataTableComponent(null, null);

        expect(documentList.isNoPermissionTemplateDefined()).toBe(true);
    });

    it('should return false if no custom permission template is provided', () => {
        documentList.noPermissionTemplate = null;
        documentList.dataTable = new DataTableComponent(null, null);

        expect(documentList.isNoPermissionTemplateDefined()).toBe(false);
    });

    it('should empty folder NOT show the pagination', () => {
        documentList.emptyFolderTemplate = <TemplateRef<any>> {};
        documentList.dataTable = new DataTableComponent(null, null);

        expect(documentList.isEmpty()).toBeTruthy();
        expect(element.querySelector('alfresco-pagination')).toBe(null);
    });

    it('should set row filter and reload contents if currentFolderId is set when setting rowFilter', () => {
        let filter = <RowFilter> {};
        documentList.currentFolderId = 'id';
        spyOn(documentList.data, 'setFilter').and.callThrough();
        spyOn(documentListService, 'getFolder');

        documentList.ngOnChanges({ rowFilter: new SimpleChange(null, filter, true) });

        expect(documentList.data.setFilter).toHaveBeenCalledWith(filter);
        expect(documentListService.getFolder).toHaveBeenCalled();
    });

    it('should NOT reload contents if currentFolderId is NOT set when setting rowFilter', () => {
        documentList.currentFolderId = null;
        spyOn(documentListService, 'getFolder');

        documentList.ngOnChanges({ rowFilter: new SimpleChange(null, <RowFilter> {}, true) });

        expect(documentListService.getFolder).not.toHaveBeenCalled();
    });

    it('should set image resolver for underlying adapter', () => {
        let resolver = <ImageResolver> {};
        spyOn(documentList.data, 'setImageResolver').and.callThrough();

        documentList.ngOnChanges({ imageResolver: new SimpleChange(null, resolver, true) });

        expect(documentList.data.setImageResolver).toHaveBeenCalledWith(resolver);
    });

    it('should emit [nodeClick] event on row click', () => {
        let node = new NodeMinimalEntry();

        spyOn(documentList, 'onNodeClick').and.callThrough();
        documentList.onNodeClick(node);
        expect(documentList.onNodeClick).toHaveBeenCalledWith(node);
    });

    it('should emit node-click DOM event', (done) => {
        let node = new NodeMinimalEntry();

        const htmlElement = fixture.debugElement.nativeElement as HTMLElement;
        htmlElement.addEventListener('node-click', (e: CustomEvent) => {
            done();
        });

        documentList.onNodeClick(node);
    });

    it('should emit [nodeDblClick] event on row double-click', () => {
        let node = new NodeMinimalEntry();

        spyOn(documentList, 'onNodeDblClick').and.callThrough();
        documentList.onNodeDblClick(node);
        expect(documentList.onNodeDblClick).toHaveBeenCalledWith(node);
    });

    it('should emit node-dblclick DOM event', (done) => {
        let node = new NodeMinimalEntry();

        const htmlElement = fixture.debugElement.nativeElement as HTMLElement;
        htmlElement.addEventListener('node-dblclick', (e: CustomEvent) => {
            done();
        });

        documentList.onNodeDblClick(node);
    });

    it('should load folder by ID on init', () => {
        documentList.currentFolderId = '1d26e465-dea3-42f3-b415-faa8364b9692';
        spyOn(documentList, 'loadFolder').and.returnValue(Promise.resolve());

        documentList.ngOnChanges({ folderNode: new SimpleChange(null, documentList.currentFolderId, true) });
        expect(documentList.loadFolder).toHaveBeenCalled();
    });

    it('should emit error when getFolderNode fails', (done) => {
        const error = { message: '{ "error": { "statusCode": 501 } }' };
        spyOn(documentListService, 'getFolderNode').and.returnValue(Observable.throw(error));

        documentList.error.subscribe(val => {
            expect(val).toBe(error);
            done();
        });

        documentList.loadFolderByNodeId('123');
    });

    it('should emit error when loadFolderNodesByFolderNodeId fails', (done) => {
        const error = { message: '{ "error": { "statusCode": 501 } }' };
        spyOn(documentListService, 'getFolderNode').and.returnValue(Observable.of(fakeNodeWithCreatePermission));
        spyOn(documentList, 'loadFolderNodesByFolderNodeId').and.returnValue(Promise.reject(error));

        documentList.error.subscribe(val => {
            expect(val).toBe(error);
            done();
        });

        documentList.loadFolderByNodeId('123');
    });

    it('should set no permision when getFolderNode fails with 403', (done) => {
        const error = { message: '{ "error": { "statusCode": 403 } }' };
        spyOn(documentListService, 'getFolderNode').and.returnValue(Observable.throw(error));

        documentList.error.subscribe(val => {
            expect(val).toBe(error);
            expect(documentList.noPermission).toBe(true);
            done();
        });

        documentList.loadFolderByNodeId('123');
    });

    it('should reset noPermission upon reload', () => {
        documentList.noPermission = true;
        fixture.detectChanges();

        documentList.reload();
        fixture.detectChanges();

        expect(documentList.noPermission).toBeFalsy();
    });

    it('should reload contents if node data changes after previously got noPermission error', () => {
        spyOn(documentList.data, 'loadPage').and.callThrough();

        documentList.noPermission = true;
        fixture.detectChanges();

        documentList.ngOnChanges({ node: new SimpleChange(null, { list: { entities: {} } }, true) });

        expect(documentList.data.loadPage).toHaveBeenCalled();
        expect(documentList.noPermission).toBeFalsy();
    });

    it('should noPermission be true if navigate to a folder with no  permission', (done) => {
        const error = { message: '{ "error": { "statusCode": 403 } }' };

        documentList.currentFolderId = '1d26e465-dea3-42f3-b415-faa8364b9692';
        documentList.folderNode = new NodeMinimal();
        documentList.folderNode.id = '1d26e465-dea3-42f3-b415-faa8364b9692';

        spyOn(documentListService, 'getFolderNode').and.returnValue(Observable.of(fakeNodeWithNoPermission));
        spyOn(documentListService, 'getFolder').and.returnValue(Observable.throw(error));

        documentList.loadFolder();
        let clickedFolderNode = new FolderNode('fake-folder-node');
        documentList.onNodeDblClick(clickedFolderNode);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
            expect(documentList.noPermission).toBeTruthy();
            done();
        });
    });

    it('should not perform navigation for virtual sources', () => {
        const sources = ['-trashcan-', '-sharedlinks-', '-sites-', '-mysites-', '-favorites-', '-recent-'];
        const node = new FolderNode('folder');

        documentList.currentFolderId = 'node-id';
        expect(documentList.canNavigateFolder(node)).toBeTruthy();

        sources.forEach(source => {
            documentList.currentFolderId = source;
            expect(documentList.canNavigateFolder(node)).toBeFalsy();
        });
    });

    it('should fetch trashcan', () => {
        spyOn(apiService.nodesApi, 'getDeletedNodes').and.returnValue(Promise.resolve(null));

        documentList.loadFolderByNodeId('-trashcan-');
        expect(apiService.nodesApi.getDeletedNodes).toHaveBeenCalled();
    });

    it('should emit error when fetch trashcan fails', (done) => {
        spyOn(apiService.nodesApi, 'getDeletedNodes').and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-trashcan-');
    });

    it('should fetch shared links', () => {
        const sharedlinksApi = apiService.getInstance().core.sharedlinksApi;
        spyOn(sharedlinksApi, 'findSharedLinks').and.returnValue(Promise.resolve(null));

        documentList.loadFolderByNodeId('-sharedlinks-');
        expect(sharedlinksApi.findSharedLinks).toHaveBeenCalled();
    });

    it('should emit error when fetch shared links fails', (done) => {
        spyOn(apiService.getInstance().core.sharedlinksApi, 'findSharedLinks')
            .and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-sharedlinks-');
    });

    it('should fetch sites', () => {
        const sitesApi = apiService.getInstance().core.sitesApi;
        spyOn(sitesApi, 'getSites').and.returnValue(Promise.resolve(null));

        documentList.loadFolderByNodeId('-sites-');
        expect(sitesApi.getSites).toHaveBeenCalled();
    });

    it('should emit error when fetch sites fails', (done) => {
        spyOn(apiService.getInstance().core.sitesApi, 'getSites')
            .and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-sites-');
    });

    it('should assure that sites have name property set', (done) => {
        const sitesApi = apiService.getInstance().core.sitesApi;
        spyOn(sitesApi, 'getSites').and.returnValue(Promise.resolve(fakeGetSitesAnswer));

        documentList.loadFolderByNodeId('-sites-');
        expect(sitesApi.getSites).toHaveBeenCalled();

        documentList.ready.subscribe((page) => {
            const entriesWithoutName = page.list.entries.filter(item => !item.entry.name);
            expect(entriesWithoutName.length).toBe(0);
            done();
        });
    });

    it('should assure that sites have name property set correctly', (done) => {
        const sitesApi = apiService.getInstance().core.sitesApi;
        spyOn(sitesApi, 'getSites').and.returnValue(Promise.resolve(fakeGetSitesAnswer));

        documentList.loadFolderByNodeId('-sites-');
        expect(sitesApi.getSites).toHaveBeenCalled();

        documentList.ready.subscribe((page) => {
            const wrongName = page.list.entries.filter(item => (item.entry.name !== item.entry.title));
            expect(wrongName.length).toBe(0);
            done();
        });
    });

    it('should fetch user membership sites', () => {
        const peopleApi = apiService.getInstance().core.peopleApi;
        spyOn(peopleApi, 'getSiteMembership').and.returnValue(Promise.resolve());

        documentList.loadFolderByNodeId('-mysites-');
        expect(peopleApi.getSiteMembership).toHaveBeenCalled();
    });

    it('should emit error when fetch membership sites fails', (done) => {
        spyOn(apiService.getInstance().core.peopleApi, 'getSiteMembership')
            .and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-mysites-');
    });

    it('should assure that user membership sites have name property set', (done) => {
        const peopleApi = apiService.getInstance().core.peopleApi;
        spyOn(peopleApi, 'getSiteMembership').and.returnValue(Promise.resolve(fakeGetSiteMembership));

        documentList.loadFolderByNodeId('-mysites-');
        expect(peopleApi.getSiteMembership).toHaveBeenCalled();

        documentList.ready.subscribe((page) => {
            const entriesWithoutName = page.list.entries.filter(item => !item.entry.name);
            expect(entriesWithoutName.length).toBe(0);
            done();
        });
    });

    it('should assure that user membership sites have name property set correctly', (done) => {
        const peopleApi = apiService.getInstance().core.peopleApi;
        spyOn(peopleApi, 'getSiteMembership').and.returnValue(Promise.resolve(fakeGetSiteMembership));

        documentList.loadFolderByNodeId('-mysites-');
        expect(peopleApi.getSiteMembership).toHaveBeenCalled();

        documentList.ready.subscribe((page) => {
            const wrongName = page.list.entries.filter(item => (item.entry.name !== item.entry.title));
            expect(wrongName.length).toBe(0);
            done();
        });
    });

    it('should fetch favorites', () => {
        const favoritesApi = apiService.getInstance().core.favoritesApi;
        spyOn(favoritesApi, 'getFavorites').and.returnValue(Promise.resolve(null));

        documentList.loadFolderByNodeId('-favorites-');
        expect(favoritesApi.getFavorites).toHaveBeenCalled();
    });

    it('should emit error when fetch favorites fails', (done) => {
        spyOn(apiService.getInstance().core.favoritesApi, 'getFavorites')
            .and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-favorites-');
    });

    it('should fetch recent', () => {
        const person = { entry: { id: 'person ' } };

        let getPersonSpy = spyOn(apiService.peopleApi, 'getPerson').and.returnValue(Promise.resolve(person));

        documentList.loadFolderByNodeId('-recent-');

        expect(getPersonSpy).toHaveBeenCalledWith('-me-');
    });

    it('should emit error when fetch recent fails on getPerson call', (done) => {
        spyOn(apiService.peopleApi, 'getPerson').and.returnValue(Promise.reject('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-recent-');
    });

    it('should emit error when fetch recent fails on search call', (done) => {
        spyOn(customResourcesService, 'loadFolderByNodeId').and.returnValue(Observable.throw('error'));

        documentList.error.subscribe(val => {
            expect(val).toBe('error');
            done();
        });

        documentList.loadFolderByNodeId('-recent-');
    });

    it('should reset folder node upon changing current folder id', () => {
        documentList.folderNode = <any> {};

        documentList.ngOnChanges({ currentFolderId: new SimpleChange(null, '-sites-', false) });

        expect(documentList.folderNode).toBeNull();
    });

    it('should reset folder node on loading folder by node id', () => {
        documentList.folderNode = <any> {};

        const sitesApi = apiService.getInstance().core.sitesApi;
        spyOn(sitesApi, 'getSites').and.returnValue(Promise.resolve(null));

        documentList.loadFolderByNodeId('-sites-');

        expect(documentList.folderNode).toBeNull();
    });

    it('should have correct currentFolderId on loading folder by node id', () => {
        documentList.currentFolderId = '12345-some-id-6789';

        const peopleApi = apiService.getInstance().core.peopleApi;
        spyOn(peopleApi, 'getSiteMembership').and.returnValue(Promise.resolve());

        documentList.loadFolderByNodeId('-mysites-');
        expect(documentList.currentFolderId).toBe('-mysites-');
    });

    it('should reload data upon changing pagination settings', () => {
        spyOn(documentList, 'reload').and.stub();

        documentList.maxItems = 0;
        documentList.skipCount = 0;

        documentList.updatePagination({
            maxItems: 10,
            skipCount: 10
        });

        expect(documentList.reload).toHaveBeenCalled();
    });

    it('should NOT reload data on first call of ngOnChanges', () => {
        spyOn(documentList, 'reload').and.stub();

        const firstChange = true;
        documentList.ngOnChanges({ skipCount: new SimpleChange(undefined, 10, firstChange) });

        expect(documentList.reload).not.toHaveBeenCalled();
    });

    it('should NOT reload data on ngOnChanges upon reset of skipCount to 0', () => {
        spyOn(documentList, 'reload').and.stub();

        documentList.maxItems = 10;
        documentList.skipCount = 10;

        const firstChange = true;
        documentList.ngOnChanges({ skipCount: new SimpleChange(undefined, 0, !firstChange) });

        expect(documentList.reload).not.toHaveBeenCalled();
    });

    it('should reload data upon changing pagination setting skipCount to 0', () => {
        spyOn(documentList, 'reload').and.stub();

        documentList.maxItems = 5;
        documentList.skipCount = 5;

        documentList.updatePagination({
            maxItems: 5,
            skipCount: 0
        });

        expect(documentList.reload).toHaveBeenCalled();
    });

    it('should add includeFields in the server request when present', () => {
        documentList.currentFolderId = 'fake-id';
        documentList.includeFields = ['test-include'];
        spyOn(documentListService, 'getFolder');

        documentList.ngOnChanges({ rowFilter: new SimpleChange(null, <RowFilter> {}, true) });

        expect(documentListService.getFolder).toHaveBeenCalledWith(null, {
            maxItems: 25,
            skipCount: 0,
            rootFolderId: 'fake-id'
        }, ['test-include']);
    });
});
