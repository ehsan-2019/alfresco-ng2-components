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

import { ApiService, LoginPage, UserModel, UsersActions } from '@alfresco/adf-testing';
import { NavigationBarPage } from '../core/pages/navigation-bar.page';
import { AnalyticsPage } from '../process-services/pages/analytics.page';
import { ProcessServicesPage } from '../process-services/pages/process-services.page';
import { ProcessServiceTabBarPage } from '../process-services/pages/process-service-tab-bar.page';
import { browser } from 'protractor';

describe('Analytics Smoke Test', () => {

    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    const processServiceTabBarPage = new ProcessServiceTabBarPage();
    const analyticsPage = new AnalyticsPage();
    const processServicesPage = new ProcessServicesPage();

    const reportTitle = 'New Title';
    let procUserModel: UserModel;

    const apiService = new ApiService();
    const usersActions = new UsersActions(apiService);

    beforeAll(async () => {
        await apiService.getInstance().login(browser.params.testConfig.admin.email, browser.params.testConfig.admin.password);

        procUserModel = await usersActions.createUser();

        await loginPage.login(procUserModel.email, procUserModel.password);
    });

    afterAll(async () => {
        await apiService.getInstance().activiti.adminTenantsApi.deleteTenant(procUserModel.tenantId);
    });

    it('[C260346] Should be able to change title of a report', async () => {
        await navigationBarPage.navigateToProcessServicesPage();
        await processServicesPage.checkApsContainer();
        await processServicesPage.goToApp('Task App');
        await processServiceTabBarPage.clickReportsButton();
        await analyticsPage.checkNoReportMessage();
        await analyticsPage.getReport('Process definition heat map');
        await analyticsPage.changeReportTitle(reportTitle);
        await expect(await analyticsPage.getReportTitle()).toEqual(reportTitle);
    });
});
