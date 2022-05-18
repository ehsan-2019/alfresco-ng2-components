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

import { FormFieldModel, FormFieldTypes, FormModel, IdentityUserService, setupTestBed } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeopleCloudWidgetComponent } from './people-cloud.widget';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProcessServiceCloudTestingModule } from '../../../../testing/process-service-cloud.testing.module';

describe('PeopleCloudWidgetComponent', () => {
    let fixture: ComponentFixture<PeopleCloudWidgetComponent>;
    let widget: PeopleCloudWidgetComponent;
    let element: HTMLElement;
    let identityUserService: IdentityUserService;
    const currentUser = { id: 'id', username: 'user' };
    const fakeUser = { id: 'fake-id', username: 'fake' };

    setupTestBed({
        imports: [
            TranslateModule.forRoot(),
            ProcessServiceCloudTestingModule
        ],
        declarations: [
            PeopleCloudWidgetComponent
        ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ]
    });

    beforeEach(() => {
        identityUserService = TestBed.inject(IdentityUserService);
        fixture = TestBed.createComponent(PeopleCloudWidgetComponent);
        widget = fixture.componentInstance;
        element = fixture.nativeElement;
        spyOn(identityUserService, 'getCurrentUserInfo').and.returnValue(fakeUser);
    });

    it('should preselect the current user', () => {
        widget.field = new FormFieldModel(new FormModel(), { value: null, selectLoggedUser: true });
        fixture.detectChanges();
        expect(widget.preSelectUsers).toEqual([fakeUser]);
        expect(identityUserService.getCurrentUserInfo).toHaveBeenCalled();
    });

    it('should not preselect the current user if value exist', () => {
        widget.field = new FormFieldModel(new FormModel(), { value: [currentUser], selectLoggedUser: true });
        fixture.detectChanges();
        expect(widget.preSelectUsers).toEqual([currentUser]);
        expect(identityUserService.getCurrentUserInfo).not.toHaveBeenCalled();
    });

    describe('when is required', () => {

        beforeEach(() => {
            widget.field = new FormFieldModel( new FormModel({ taskId: '<id>' }), {
                type: FormFieldTypes.PEOPLE,
                required: true
            });
        });

        it('should be able to display label with asterisk', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            const asterisk: HTMLElement = element.querySelector('.adf-asterisk');

            expect(asterisk).toBeTruthy();
            expect(asterisk.textContent).toEqual('*');
        });

        it('should be invalid if no default option after interaction', async () => {
            fixture.detectChanges();
            await fixture.whenStable();

            expect(element.querySelector('.adf-invalid')).toBeFalsy();

            const cloudPeopleInput = element.querySelector('adf-cloud-people');
            cloudPeopleInput.dispatchEvent(new Event('blur'));

            fixture.detectChanges();
            await fixture.whenStable();

            expect(element.querySelector('.adf-invalid')).toBeTruthy();
        });
    });

    describe('when form model has left labels', () => {

        it('should have left labels classes on leftLabels true', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id', leftLabels: true }), {
                id: 'people-id',
                name: 'people-name',
                value: '',
                type: FormFieldTypes.PEOPLE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).not.toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).not.toBeNull();
        });

        it('should not have left labels classes on leftLabels false', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id', leftLabels: false }), {
                id: 'people-id',
                name: 'people-name',
                value: '',
                type: FormFieldTypes.PEOPLE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).toBeNull();
        });

        it('should not have left labels classes on leftLabels not present', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id' }), {
                id: 'people-id',
                name: 'people-name',
                value: '',
                type: FormFieldTypes.PEOPLE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).toBeNull();
        });
    });
});
