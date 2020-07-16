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

import {
    ApiService,
    BrowserActions,
    LoginPage,
    UploadActions,
    UserModel,
    UsersActions
} from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../core/pages/content-services.page';
import { UploadDialogPage } from '../../core/pages/dialog/upload-dialog.page';
import { UploadTogglesPage } from '../../core/pages/dialog/upload-toggles.page';
import { FileModel } from '../../models/ACS/file.model';
import { browser } from 'protractor';
import { VersionManagePage } from '../../core/pages/version-manager.page';
import { FolderModel } from '../../models/ACS/folder.model';

describe('Upload component', () => {

    const contentServicesPage = new ContentServicesPage();
    const uploadDialog = new UploadDialogPage();
    const uploadToggles = new UploadTogglesPage();
    const loginPage = new LoginPage();
    const versionManagePage = new VersionManagePage();
    const apiService = new ApiService();

    const uploadActions = new UploadActions(apiService);
    const usersActions = new UsersActions(apiService);

    let acsUser: UserModel;

    const firstPdfFileModel = new FileModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.PDF_B.file_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.PDF_B.file_location
    });
    const docxFileModel = new FileModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.DOCX.file_location
    });
    const pdfFileModel = new FileModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.PDF.file_location
    });
    const pngFileModelTwo = new FileModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.PNG_B.file_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.PNG_B.file_location
    });
    const pngFileModel = new FileModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.PNG.file_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.PNG.file_location
    });
    const filesLocation = [pdfFileModel.location, docxFileModel.location, pngFileModel.location, firstPdfFileModel.location];
    const filesName = [pdfFileModel.name, docxFileModel.name, pngFileModel.name, firstPdfFileModel.name];

    const parentFolder = new FolderModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.FOLDER_ONE.folder_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.FOLDER_ONE.folder_location
    });

    const fileInsideParentFolder = new FolderModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.FILE_INSIDE_FOLDER_ONE.file_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.FILE_INSIDE_FOLDER_ONE.file_location
    });
    const subFolder = new FolderModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.FOLDER_TWO.folder_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.FOLDER_TWO.folder_location
    });

    const fileInsideSubFolder = new FolderModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.FILE_INSIDE_FOLDER_TWO.file_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.FILE_INSIDE_FOLDER_TWO.file_location
    });

    const adfBigFolder = new FolderModel({
        name: browser.params.resources.Files.ADF_DOCUMENTS.ADF_FOLDER.folder_name,
        location: browser.params.resources.Files.ADF_DOCUMENTS.ADF_FOLDER.folder_location
    });

    beforeAll(async () => {
        await apiService.getInstance().login(browser.params.testConfig.admin.email, browser.params.testConfig.admin.password);
        acsUser = await usersActions.createUser();
        await apiService.getInstance().login(acsUser.email, acsUser.password);
        await loginPage.login(acsUser.email, acsUser.password);
        await contentServicesPage.goToDocumentList();
   });

    beforeEach(async () => {
        await contentServicesPage.goToDocumentList();
    });

    afterEach(async () => {
        const nbResults = await contentServicesPage.numberOfResultsDisplayed();
        if (nbResults > 1) {
            const nodeIds = await contentServicesPage.getElementsDisplayedId();
            for (const nodeId of nodeIds) {
                await uploadActions.deleteFileOrFolder(nodeId);
            }
        }
    });

    it('[C260143] Should be possible to maximize/minimize the upload dialog', async () => {
        await contentServicesPage
            .uploadFile(docxFileModel.location);
        await contentServicesPage.checkContentIsDisplayed(docxFileModel.name);

        await uploadDialog.fileIsUploaded(docxFileModel.name);
        await uploadDialog.checkCloseButtonIsDisplayed();
        await expect(await uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        await expect(await uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        await uploadDialog.minimizeUploadDialog();
        await uploadDialog.dialogIsMinimized();
        await expect(await uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        await expect(await uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        await uploadDialog.maximizeUploadDialog();
        await uploadDialog.dialogIsDisplayed();
        await uploadDialog.fileIsUploaded(docxFileModel.name);
        await expect(await uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        await expect(await uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        await uploadDialog.checkCloseButtonIsDisplayed();
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
    });

    it('[C291902] Should be shown upload counter display in dialog box', async () => {
        await contentServicesPage
            .uploadFile(docxFileModel.location);
        await contentServicesPage.checkContentIsDisplayed(docxFileModel.name);

        await uploadDialog.fileIsUploaded(docxFileModel.name);
        await uploadDialog.checkCloseButtonIsDisplayed();
        await expect(await uploadDialog.getTitleText()).toEqual('Uploaded 1 / 1');
        await uploadDialog.checkCloseButtonIsDisplayed();
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
    });

    it('[C260168] Should be possible to cancel upload using dialog icon', async () => {
        await contentServicesPage.uploadFile(pdfFileModel.location);
        await contentServicesPage.checkContentIsDisplayed(pdfFileModel.name);
        await uploadDialog.removeUploadedFile(pdfFileModel.name);
        await uploadDialog.fileIsCancelled(pdfFileModel.name);
        await expect(await uploadDialog.getTitleText()).toEqual('Upload canceled');
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
        await contentServicesPage.checkContentIsNotDisplayed(pdfFileModel.name);
    });

    it('[C260176] Should remove files from upload dialog box when closed', async () => {
        await contentServicesPage.uploadFile(pngFileModelTwo.location);
        await contentServicesPage.checkContentIsDisplayed(pngFileModelTwo.name);

        await uploadDialog.fileIsUploaded(pngFileModelTwo.name);
        await contentServicesPage.uploadFile(pngFileModel.location);
        await contentServicesPage.checkContentIsDisplayed(pngFileModel.name);
        await uploadDialog.fileIsUploaded(pngFileModel.name);
        await uploadDialog.fileIsUploaded(pngFileModelTwo.name);
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
        await contentServicesPage.uploadFile(pdfFileModel.location);
        await contentServicesPage .checkContentIsDisplayed(pdfFileModel.name);
        await uploadDialog.fileIsUploaded(pdfFileModel.name);
        await uploadDialog.fileIsNotDisplayedInDialog(pngFileModel.name);
        await uploadDialog.fileIsNotDisplayedInDialog(pngFileModelTwo.name);
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
    });

    it('[C260170] Should be possible to upload multiple files', async () => {
        await contentServicesPage.checkAcsContainer();
        await uploadToggles.enableMultipleFileUpload();
        await contentServicesPage.uploadMultipleFile(filesLocation);
        await contentServicesPage.checkContentsAreDisplayed(filesName);
        await uploadDialog.filesAreUploaded(filesName);
        await expect(await uploadDialog.getTitleText()).toEqual('Uploaded 4 / 4');
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
        await uploadToggles.disableMultipleFileUpload();
    });

    it('[C311305] Should NOT be able to remove uploaded version', async () => {
        await contentServicesPage.uploadFile(docxFileModel.location);
        await uploadDialog.fileIsUploaded(docxFileModel.name);
        await contentServicesPage.checkContentIsDisplayed(docxFileModel.name);

        await contentServicesPage.versionManagerContent(docxFileModel.name);
        await BrowserActions.click(versionManagePage.showNewVersionButton);
        await versionManagePage.uploadNewVersionFile(pngFileModel.location);
        await versionManagePage.closeVersionDialog();
        await uploadDialog.removeUploadedFile(pngFileModel.name);
        await contentServicesPage.checkContentIsDisplayed(pngFileModel.name);
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
    });

    it('[C291893] Should enable folder upload in selected node', async () => {
        await contentServicesPage.checkUploadButton();
        await expect(await uploadToggles.checkFolderUploadToggleIsNotEnabled()).toBe(true);

        await uploadToggles.enableFolderUpload();
        await expect(await uploadToggles.checkFolderUploadToggleIsEnabled()).toBe(true);
        await contentServicesPage.uploadFolder(parentFolder.location);
        await uploadDialog.fileIsUploaded(fileInsideParentFolder.name);
        await expect(await uploadDialog.numberOfCurrentFilesUploaded()).toEqual('1');
        await expect(await uploadDialog.numberOfInitialFilesUploaded()).toEqual('1');
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();

        await contentServicesPage.openFolder(parentFolder.name);
        await expect(await uploadToggles.checkFolderUploadToggleIsNotEnabled()).toBe(true);
        await uploadToggles.enableFolderUpload();
        await expect(await uploadToggles.checkFolderUploadToggleIsEnabled()).toBe(true);
        await contentServicesPage.uploadFolder(subFolder.location);
        await uploadDialog.fileIsUploaded(fileInsideSubFolder.name);
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();

        await uploadToggles.enableFolderUpload();
        await browser.executeScript(` setInterval(() => {
               if(document.querySelector('[data-automation-id="adf"]')){
                    document.querySelector("#adf-upload-dialog-cancel-all").click();
                    document.querySelector("#adf-upload-dialog-cancel").click();
                }
              }, 500)`);
        await contentServicesPage.uploadFolder(adfBigFolder.location);

        await expect(await uploadDialog.getTitleText()).toEqual('Upload canceled');
        await uploadDialog.clickOnCloseButton();
        await uploadDialog.dialogIsNotDisplayed();
        await contentServicesPage.openFolder(adfBigFolder.name);
        await expect(contentServicesPage.numberOfResultsDisplayed()).toBe(0);
    });
});
