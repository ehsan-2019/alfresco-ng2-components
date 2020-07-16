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

import { browser } from 'protractor';
import {
    ApiService,
    LoginPage,
    StringUtil,
    UploadActions,
    UserModel,
    UsersActions,
    ViewerPage
} from '@alfresco/adf-testing';
import { ContentServicesPage } from '../../../core/pages/content-services.page';
import { FolderModel } from '../../../models/ACS/folder.model';
import CONSTANTS = require('../../../util/constants');

describe('Viewer', () => {

    const viewerPage = new ViewerPage();
    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    let site;
    const acsUser = new UserModel();

    const excelFolderInfo = new FolderModel({
        'name': browser.params.resources.Files.ADF_DOCUMENTS.EXCEL_FOLDER.folder_name,
        'location': browser.params.resources.Files.ADF_DOCUMENTS.EXCEL_FOLDER.folder_path
    });

    const apiService = new ApiService();
    const uploadActions = new UploadActions(apiService);
    const usersActions = new UsersActions(apiService);

    beforeAll(async () => {
        await apiService.getInstance().login(browser.params.testConfig.admin.email, browser.params.testConfig.admin.password);
        await usersActions.createUser(acsUser);

        site = await apiService.getInstance().core.sitesApi.createSite({
            title: StringUtil.generateRandomString(8),
            visibility: 'PUBLIC'
        });

        await apiService.getInstance().core.sitesApi.addSiteMember(site.entry.id, {
            id: acsUser.email,
            role: CONSTANTS.CS_USER_ROLES.MANAGER
        });

        await apiService.getInstance().login(acsUser.email, acsUser.password);
    });

    afterAll(async () => {
        await apiService.getInstance().core.sitesApi.deleteSite(site.entry.id, { permanent: true });
    });

    describe('Excel Folder Uploaded', () => {
        let uploadedExcels;
        let excelFolderUploaded;

        beforeAll(async () => {
            excelFolderUploaded = await uploadActions.createFolder(excelFolderInfo.name, '-my-');

            uploadedExcels = await uploadActions.uploadFolder(excelFolderInfo.location, excelFolderUploaded.entry.id);

            await loginPage.login(acsUser.email, acsUser.password);
            await contentServicesPage.goToDocumentList();
        });

        it('[C280008] Should be possible to open any Excel file', async () => {
            await contentServicesPage.doubleClickRow('excel');
            for (const currentFile of uploadedExcels) {
                if (currentFile.entry.name !== '.DS_Store') {
                    await contentServicesPage.doubleClickRow(currentFile.entry.name);
                    await viewerPage.checkFileIsLoaded(currentFile.entry.name);
                    await viewerPage.clickCloseButton();
                }
            }
        });
    });
});
