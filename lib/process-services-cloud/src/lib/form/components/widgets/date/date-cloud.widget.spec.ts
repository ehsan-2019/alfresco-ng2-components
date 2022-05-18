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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateCloudWidgetComponent, DATE_FORMAT_CLOUD } from './date-cloud.widget';
import { setupTestBed, FormFieldModel, FormModel, FormFieldTypes } from '@alfresco/adf-core';
import moment from 'moment-es6';
import { ProcessServiceCloudTestingModule } from '../../../../testing/process-service-cloud.testing.module';
import { TranslateModule } from '@ngx-translate/core';

describe('DateWidgetComponent', () => {

    let widget: DateCloudWidgetComponent;
    let fixture: ComponentFixture<DateCloudWidgetComponent>;
    let element: HTMLElement;

    setupTestBed({
        imports: [
            TranslateModule.forRoot(),
            ProcessServiceCloudTestingModule
        ]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DateCloudWidgetComponent);
        widget = fixture.componentInstance;
        element = fixture.nativeElement;
    });

    it('should setup min value for date picker', () => {
        const minValue = '1982-03-13';
        widget.field = new FormFieldModel(null, {
            id: 'date-id',
            name: 'date-name',
            minValue
        });

        widget.ngOnInit();

        const expected = moment(minValue, DATE_FORMAT_CLOUD);
        expect(widget.minDate.isSame(expected)).toBeTruthy();
    });

    it('should date field be present', () => {
        const minValue = '1982-03-13';
        widget.field = new FormFieldModel(null, {
            minValue
        });

        fixture.detectChanges();

        expect(element.querySelector('#data-widget')).toBeDefined();
        expect(element.querySelector('#data-widget')).not.toBeNull();
    });

    it('should setup max value for date picker', () => {
        const maxValue = '1982-03-13';
        widget.field = new FormFieldModel(null, {
            maxValue
        });
        widget.ngOnInit();

        const expected = moment(maxValue, DATE_FORMAT_CLOUD);
        expect(widget.maxDate.isSame(expected)).toBeTruthy();
    });

    it('should eval visibility on date changed', () => {
        spyOn(widget, 'onFieldChanged').and.callThrough();

        const field = new FormFieldModel(new FormModel(), {
            id: 'date-field-id',
            name: 'date-name',
            value: '9999-9-9',
            type: 'date',
            readOnly: 'false'
        });

        widget.field = field;

        widget.onDateChanged({ value: moment('12/12/2012') });
        expect(widget.onFieldChanged).toHaveBeenCalledWith(field);
    });

    describe('template check', () => {

        afterEach(() => {
            fixture.destroy();
            TestBed.resetTestingModule();
        });

        it('should show visible date widget', async () => {
            widget.field = new FormFieldModel(new FormModel(), {
                id: 'date-field-id',
                name: 'date-name',
                value: '9999-9-9',
                type: 'date',
                readOnly: 'false'
            });
            widget.field.isVisible = true;
            widget.ngOnInit();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(element.querySelector('#date-field-id')).toBeDefined();
            expect(element.querySelector('#date-field-id')).not.toBeNull();
            const dateElement = element.querySelector<HTMLInputElement>('#date-field-id');
            expect(dateElement.value).toContain('9-9-9999');
        });

        it('should show the correct format type', async () => {
            widget.field = new FormFieldModel(new FormModel(), {
                id: 'date-field-id',
                name: 'date-name',
                value: '9999-30-12',
                type: 'date',
                readOnly: 'false'
            });
            widget.field.isVisible = true;
            widget.field.dateDisplayFormat = 'YYYY-DD-MM';
            widget.ngOnInit();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(element.querySelector('#date-field-id')).toBeDefined();
            expect(element.querySelector('#date-field-id')).not.toBeNull();
            const dateElement = element.querySelector<HTMLInputElement>('#date-field-id');
            expect(dateElement.value).toContain('9999-30-12');
        });

        it('should disable date button when is readonly', async () => {
            widget.field = new FormFieldModel(new FormModel(), {
                id: 'date-field-id',
                name: 'date-name',
                value: '9999-9-9',
                type: 'date',
                readOnly: 'false'
            });
            widget.field.isVisible = true;
            widget.field.readOnly = false;
            fixture.detectChanges();
            await fixture.whenStable();

            let dateButton = element.querySelector<HTMLButtonElement>('button');
            expect(dateButton.disabled).toBeFalsy();

            widget.field.readOnly = true;
            fixture.detectChanges();
            await fixture.whenStable();

            dateButton = element.querySelector<HTMLButtonElement> ('button');
            expect(dateButton.disabled).toBeTruthy();
        });

        it('should set isValid to false when the value is not a correct date value', async () => {
            widget.field = new FormFieldModel(new FormModel(), {
                id: 'date-field-id',
                name: 'date-name',
                value: 'aa',
                type: 'date',
                readOnly: 'false'
            });
            widget.field.isVisible = true;
            widget.field.readOnly = false;

            fixture.detectChanges();
            await fixture.whenStable();

            expect(widget.field.isValid).toBeFalsy();
        });

        it('should display tooltip when tooltip is set', async () => {
            widget.field = new FormFieldModel(new FormModel(), {
                id: 'date-field-id',
                name: 'date-name',
                value: 'aa',
                type: 'date',
                readOnly: 'false',
                tooltip: 'date widget'
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const dateElement = element.querySelector('#date-field-id');
            const tooltip = dateElement.getAttribute('ng-reflect-message');

            expect(tooltip).toEqual(widget.field.tooltip);
        });
    });

    it('should display always the json value', () => {
        const field = new FormFieldModel(new FormModel(), {
            id: 'date-field-id',
            name: 'date-name',
            value: '12-30-9999',
            type: 'date',
            readOnly: 'false'
        });
        field.isVisible = true;
        field.dateDisplayFormat = 'MM-DD-YYYY';
        widget.field = field;
        widget.ngOnInit();
        fixture.detectChanges();
        fixture.whenStable()
            .then(() => {
                expect(element.querySelector('#date-field-id')).toBeDefined();
                expect(element.querySelector('#date-field-id')).not.toBeNull();
                const dateElement: any = element.querySelector('#date-field-id');
                expect(dateElement.value).toContain('12-30-9999');

                widget.field.value = '03-02-2020';

                fixture.detectChanges();
                fixture.whenStable()
                    .then(() => {
                        expect(dateElement.value).toContain('03-02-2020');
                    });
            });
    });

    describe('when form model has left labels', () => {

        it('should have left labels classes on leftLabels true', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id', leftLabels: true }), {
                id: 'date-id',
                name: 'date-name',
                value: '',
                type: FormFieldTypes.DATE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).not.toBeNull();

            const leftDatePicker = element.querySelector('.adf-left-label-input-datepicker');
            expect(leftDatePicker).not.toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).not.toBeNull();
        });

        it('should not have left labels classes on leftLabels false', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id', leftLabels: false }), {
                id: 'date-id',
                name: 'date-name',
                value: '',
                type: FormFieldTypes.DATE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).toBeNull();

            const leftDatePicker = element.querySelector('.adf-left-label-input-datepicker');
            expect(leftDatePicker).toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).toBeNull();
        });

        it('should not have left labels classes on leftLabels not present', async () => {
            widget.field = new FormFieldModel(new FormModel({ taskId: 'fake-task-id' }), {
                id: 'date-id',
                name: 'date-name',
                value: '',
                type: FormFieldTypes.DATE,
                readOnly: false,
                required: true
            });

            fixture.detectChanges();
            await fixture.whenStable();

            const widgetContainer = element.querySelector('.adf-left-label-input-container');
            expect(widgetContainer).toBeNull();

            const leftDatePicker = element.querySelector('.adf-left-label-input-datepicker');
            expect(leftDatePicker).toBeNull();

            const adfLeftLabel = element.querySelector('.adf-left-label');
            expect(adfLeftLabel).toBeNull();
        });
    });

});
