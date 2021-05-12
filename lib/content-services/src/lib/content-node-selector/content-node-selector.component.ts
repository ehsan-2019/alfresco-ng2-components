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

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslationService, NotificationService, AllowableOperationsEnum, ContentService, UploadService } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';

import { ContentNodeSelectorComponentData } from './content-node-selector.component-data.interface';
import { NodeEntryEvent } from '../document-list/components/node.event';

@Component({
    selector: 'adf-content-node-selector',
    templateUrl: './content-node-selector.component.html',
    styleUrls: ['./content-node-selector.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContentNodeSelectorComponent implements OnInit {
    title: string;
    action: string;
    buttonActionName: string;
    chosenNode: Node[];
    currentDirectoryId: string;
    showingSearch = false;
    hasAllowableOperations = false;
    isLoading = true;
    selectedTabIndex: number = 0;
    uploadStarted: boolean = false;

    emptyFolderImageUrl: string = './assets/images/empty_doc_lib.svg';
    breadcrumbFolderNode: Node;

    constructor(private translation: TranslationService,
                private contentService: ContentService,
                private notificationService: NotificationService,
                private uploadService: UploadService,
                private dialog: MatDialogRef<ContentNodeSelectorComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ContentNodeSelectorComponentData) {
        this.action = data.actionName ? data.actionName.toUpperCase() : 'CHOOSE';
        this.buttonActionName = `NODE_SELECTOR.${this.action}`;
        this.title = data.title;
        this.currentDirectoryId = data.currentFolderId;
    }

    ngOnInit() {
        this.dialog.keydownEvents().subscribe(event => {
            // Esc
            if (event.keyCode === 27) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.close();
            }
        });

        this.dialog.backdropClick().subscribe(() => {
           this.close();
        });

        this.uploadService.fileUploadStarting.subscribe(() => {
            this.uploadStarted = true;
        });
    }

    close() {
        this.data.select.complete();
    }

    onSelect(nodeList: Node[]) {
        this.chosenNode = nodeList;
    }

    onSiteChange(siteTitle: string) {
        this.updateTitle(siteTitle);
    }

    onNavigationChange(pathElement: NodeEntryEvent) {
        this.currentDirectoryId = pathElement.value.id;
        this.isLoading = true;
    }

    onClick(): void {
        this.data.select.next(this.chosenNode);
        this.data.select.complete();
    }

    updateTitle(siteTitle: string) {
        if (this.action === 'CHOOSE' && siteTitle) {
            this.title = this.getTitleTranslation(this.action, siteTitle);
        }
    }

    getTitleTranslation(action: string, name: string): string {
        return this.translation.instant(`NODE_SELECTOR.${action}_ITEM`, { name: this.translation.instant(name) });
    }

    getSelectedCount(): number {
        return this.chosenNode?.length || 0;
    }

    isCounterVisible(): boolean {
        return this.action === 'ATTACH' || this.action === 'CHOOSE';
    }

    isMultipleSelection(): boolean {
        return this.data.selectionMode === 'multiple';
    }

    onError(error) {
        this.notificationService.showError(error);
    }

    isChooseButtonDisabled(): boolean {
        return this.uploadService.isUploading() || !this.hasNodeSelected();
    }

    hasNodeSelected(): boolean {
        return this.chosenNode?.length > 0;
    }

    onShowingSearch(value: boolean) {
        this.showingSearch = value;
    }

    onCurrentFolder(currentFolder: Node) {
        this.hasAllowableOperations = this.contentService.hasAllowableOperations(currentFolder, AllowableOperationsEnum.CREATE);
        this.breadcrumbFolderNode = currentFolder;
    }

    isNotAllowedToUpload() {
        return this.showingSearch || !this.hasAllowableOperations;
    }

    onFolderLoaded() {
        this.isLoading = false;
    }

    onTabSelectionChange(tabIndex: number) {
        this.selectedTabIndex = tabIndex;
    }

    isFileServerTabSelected (): boolean {
        return this.selectedTabIndex === 0;
    }

    isLocalUploadTabSelected (): boolean {
        return this.selectedTabIndex === 1;
    }

    isUploadEnabled(): boolean {
        return this.canPerformLocalUpload() && this.isLocalUploadTabSelected();
    }

    canPerformLocalUpload(): boolean {
        return this.data?.showLocalUploadButton;
    }

    getWarningMessage(): string {
        return this.showingSearch ? 'NODE_SELECTOR.UPLOAD_BUTTON_SEARCH_WARNING_MESSAGE' :
            (this.hasNoPermissionToUpload() ? 'NODE_SELECTOR.UPLOAD_BUTTON_PERMISSION_WARNING_MESSAGE' : '');
    }

    hasNoPermissionToUpload(): boolean {
        return (!this.hasAllowableOperations && !this.showingSearch) && !this.isLoading;
    }

    hasUploadError(): boolean {
        return this.showingSearch || this.hasNoPermissionToUpload();
    }

}
