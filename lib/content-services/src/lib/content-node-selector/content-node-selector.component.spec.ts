/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
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

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentNodeSelectorComponent } from './content-node-selector.component';
import { Node, NodeEntry } from '@alfresco/js-api';
import { By } from '@angular/platform-browser';
import { SitesService, ContentService } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { ContentTestingModule } from '../testing/content.testing.module';
import { DocumentListService } from '../document-list/services/document-list.service';
import { DocumentListComponent } from '../document-list/components/document-list.component';
import { ShareDataRow } from '../document-list';
import { TranslateModule } from '@ngx-translate/core';
import { UploadModule } from '../upload';
import { ContentNodeSelectorPanelComponent } from './content-node-selector-panel.component';

describe('ContentNodeSelectorComponent', () => {
    let component: ContentNodeSelectorComponent;
    let fixture: ComponentFixture<ContentNodeSelectorComponent>;
    let data: any;

    beforeEach(() => {
        data = {
            title: 'Choose along citizen...',
            actionName: 'choose',
            select: new EventEmitter<Node>(),
            rowFilter: (shareDataRow) => shareDataRow.node.entry.name === 'impossible-name',
            imageResolver: () => 'piccolo',
            currentFolderId: 'cat-girl-nuku-nuku',
            selectionMode: 'multiple',
            showLocalUploadButton: true
        };

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ContentTestingModule,
                MatDialogModule,
                UploadModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                {
                    provide: MatDialogRef,
                    useValue: {
                        keydownEvents: () => of(null),
                        backdropClick: () => of(null),
                        close: jasmine.createSpy('close')
                    }
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        const documentListService = TestBed.inject(DocumentListService);
        const sitesService: SitesService = TestBed.inject(SitesService);

        spyOn(documentListService, 'getFolder').and.callThrough();
        spyOn(documentListService, 'getFolderNode').and.callThrough();
        spyOn(sitesService, 'getSites').and.returnValue(of({ list: { entries: [] } }));

        fixture = TestBed.createComponent(ContentNodeSelectorComponent);
        component = fixture.componentInstance;
        const contentService = TestBed.inject(ContentService);
        spyOn(contentService, 'hasAllowableOperations').and.returnValue(true);

        const fakeFolderNodeWithPermission = new NodeEntry({
            entry: {
                allowableOperations: [
                    'create',
                    'update'
                ],
                isFolder: true,
                name: 'Folder Fake Name',
                nodeType: 'cm:folder'
            }
        });

        spyOn(contentService, 'getNode').and.returnValue(of(fakeFolderNodeWithPermission));

        component.data.showLocalUploadButton = true;
        component.hasAllowableOperations = true;
        component.showingSearch = false;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    function enableLocalUpload() {
        component.data.showLocalUploadButton = true;
        component.hasAllowableOperations = true;
        component.showingSearch = false;
        component.isLoading = false;
    }

    function selectTabByIndex(tabIndex: number) {
        const uploadFromLocalTab = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[tabIndex];
        const attributes = uploadFromLocalTab.nativeNode.attributes as NamedNodeMap;
        const tabPositionInSet = Number(attributes.getNamedItem('aria-posinset').value) - 1;
        component.onTabSelectionChange(tabPositionInSet);
    }

    describe('Data injecting with the "Material dialog way"', () => {

        it('should show the INJECTED title', () => {
            const titleElement = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-title"]'));
            expect(titleElement).not.toBeNull();
            expect(titleElement.nativeElement.innerText).toBe('Choose along citizen...');
        });

        it('should have the INJECTED actionName on the name of the choose button', () => {
            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(component.buttonActionName).toBe('NODE_SELECTOR.CHOOSE');
            expect(actionButton).not.toBeNull();
            expect(actionButton.nativeElement.innerText).toBe('NODE_SELECTOR.CHOOSE');
        });

        it('should pass through the injected currentFolderId to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.currentFolderId).toBe('cat-girl-nuku-nuku');
        });

        it('should pass through the injected rowFilter to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.rowFilter({
                node: {
                    entry: new Node({
                        name: 'impossible-name',
                        id: 'name'
                    })
                }
            }))
                .toBe(data.rowFilter(<ShareDataRow> {
                    node: {
                        entry: new Node({
                            name: 'impossible-name',
                            id: 'name'
                        })
                    }
                }));
        });

        it('should pass through the injected imageResolver to the documentList', () => {
            const documentList = fixture.debugElement.query(By.directive(DocumentListComponent));
            expect(documentList).not.toBeNull('Document list should be shown');
            expect(documentList.componentInstance.imageResolver).toBe(data.imageResolver);
        });
   });

    describe('Cancel button', () => {

        it('should complete the data stream when user click "CANCEL"', () => {
            let cancelButton;
            data.select.subscribe(
                () => {
                },
                () => {
                },
                () => {
                    cancelButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-cancel"]'));
                    expect(cancelButton).not.toBeNull();
                });

            cancelButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-cancel"]'));
            cancelButton.triggerEventHandler('click', {});
        });

        it('should not be shown if dialogRef is NOT injected', () => {
            const closeButton = fixture.debugElement.query(By.css('[content-node-selector-actions-cancel]'));
            expect(closeButton).toBeNull();
        });
    });

    describe('Action button for the chosen node', () => {

        it('should be disabled by default', () => {
            fixture.detectChanges();

            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(actionButton.nativeElement.disabled).toBeTruthy();
        });

        it('should be enabled when a node is chosen', () => {
            component.onSelect([new Node({ id: 'fake' })]);
            fixture.detectChanges();

            const actionButton = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));
            expect(actionButton.nativeElement.disabled).toBeFalsy();
        });

        it('should be disabled when no node chosen', () => {
            component.onSelect([new Node({ id: 'fake' })]);
            fixture.detectChanges();

            const actionButtonWithNodeSelected = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));

            expect(actionButtonWithNodeSelected.nativeElement.disabled).toBe(false);

            component.onSelect([]);
            fixture.detectChanges();

            const actionButtonWithoutNodeSelected = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-actions-choose"]'));

            expect(actionButtonWithoutNodeSelected.nativeElement.disabled).toBe(true);
        });
    });

    describe('Title', () => {

        it('should be updated when a site is chosen', () => {
            const fakeSiteTitle = 'My fake site';
            const contentNodePanel = fixture.debugElement.query(By.directive(ContentNodeSelectorPanelComponent));
            contentNodePanel.componentInstance.siteChange.emit(fakeSiteTitle);
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('[data-automation-id="content-node-selector-title"]'));
            expect(titleElement).not.toBeNull();
            expect(titleElement.nativeElement.innerText).toBe('NODE_SELECTOR.CHOOSE_ITEM');
       });
   });

    describe('Upload button', () => {

        it('should be able to show upload button if showLocalUploadButton set to true', async () => {
            enableLocalUpload();
            selectTabByIndex(1);

            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.innerText).toEqual('file_uploadFORM.FIELD.UPLOAD');
        });

        it('should be able to disable UploadButton if showingSearch set to true', () => {
            selectTabByIndex(1);
            component.showingSearch = true;
            component.hasAllowableOperations = true;

            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.disabled).toBe(true);
        });

        it('should be able to enable UploadButton if showingSearch set to false', () => {
            selectTabByIndex(1);
            component.showingSearch = false;
            component.hasAllowableOperations = true;

            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.disabled).toBe(false);
        });

        it('should be able to show warning message while searching', () => {
            component.data.showLocalUploadButton = true;
            component.showingSearch = true;
            component.hasAllowableOperations = false;
            selectTabByIndex(1);

            fixture.detectChanges();
            const infoMatIcon = fixture.debugElement.query(By.css('[data-automation-id="adf-content-node-selector-disabled-tab-info-icon"]'));
            const iconTooltipMessage = infoMatIcon.attributes['ng-reflect-message'];

            const expectedMessage = 'NODE_SELECTOR.UPLOAD_BUTTON_SEARCH_WARNING_MESSAGE';

            expect(component.getWarningMessage()).toEqual(expectedMessage);
            expect(iconTooltipMessage).toEqual(expectedMessage.substring(0, 30));
        });

        it('should not be able to show warning message if it is not in search mode', () => {
            component.data.showLocalUploadButton = true;
            component.showingSearch = false;

            fixture.detectChanges();
            const warningMessage = fixture.debugElement.query(By.css('.adf-content-node-upload-button-warning-message span'));

            expect(warningMessage).toBeNull();
        });

        it('should be able to disable UploadButton if user does not have allowable operations', () => {
            component.hasAllowableOperations = false;
            selectTabByIndex(1);

            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.disabled).toBe(true);
        });

        it('should be able to enable UploadButton if user has allowable operations', () => {
            selectTabByIndex(1);
            component.hasAllowableOperations = true;

            fixture.detectChanges();
            const adfUploadButton = fixture.debugElement.query(By.css('adf-upload-button button'));

            expect(adfUploadButton).not.toBeNull();
            expect(adfUploadButton.nativeElement.disabled).toBe(false);
        });

        it('should not be able to show warning message if user has allowable operations', () => {
            enableLocalUpload();
            selectTabByIndex(1);
            fixture.detectChanges();
            const warningMessage = fixture.debugElement.query(By.css('.adf-content-node-upload-button-warning-message span'));

            expect(warningMessage).toBeNull();
        });

        it('should be able to show warning message if user does not have allowable operations', () => {
            component.data.showLocalUploadButton = true;
            component.hasAllowableOperations = false;
            component.showingSearch = false;
            component.isLoading = false;
            selectTabByIndex(1);

            fixture.detectChanges();
            const infoMatIcon = fixture.debugElement.query(By.css('[data-automation-id="adf-content-node-selector-disabled-tab-info-icon"]'));
            const iconTooltipMessage = infoMatIcon.attributes['ng-reflect-message'];
            const expectedMessage = 'NODE_SELECTOR.UPLOAD_BUTTON_PERMISSION_WARNING_MESSAGE';

            expect(component.getWarningMessage()).toEqual(expectedMessage);
            expect(iconTooltipMessage).toEqual(expectedMessage.substring(0, 30));
        });

        it('should not be able to show warning message while loading documents', () => {
            component.data.showLocalUploadButton = true;
            component.hasAllowableOperations = false;
            component.showingSearch = false;
            component.isLoading = true;

            fixture.detectChanges();
            const warningMessage = fixture.debugElement.query(By.css('.adf-content-node-upload-button-warning-message span'));

            expect(warningMessage).toBeNull();
        });
    });

    describe('Tabs', () => {
        it('should isFileServerTabSelected return true when tabIndex 0 is selected', () => {
            selectTabByIndex(0);

            expect(component.isFileServerTabSelected()).toEqual(true);
        });

        it('should isLocalUploadTabSelected return true when tabIndex 1 is selected', () => {
            enableLocalUpload();
            selectTabByIndex(1);

            expect(component.isLocalUploadTabSelected()).toEqual(true);
        });

        it('should tabs be headless when local upload is not enabled', () => {
           component.data.showLocalUploadButton = false;
           fixture.detectChanges();
           const tabGroup = fixture.debugElement.queryAll(By.css('.adf-content-node-selector-headless-tabs'))[0];

           expect(tabGroup).not.toBe(undefined);
        });

        it('should tabs show headers when local upload is enabled', () => {
            component.data.showLocalUploadButton = true;
            fixture.detectChanges();
            const tabGroup = fixture.debugElement.queryAll(By.css('.adf-content-node-selector-headless-tabs'))[0];

            expect(tabGroup).toBe(undefined);
        });
    });
});
