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

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../components/login.component';
import { LoginFooterDirective } from './login-footer.directive';
import { setupTestBed } from '../../testing/setupTestBed';
import { CoreModule } from '../../core.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginFooterDirective', () => {
    let component: LoginComponent;
    let directive: LoginFooterDirective;

    setupTestBed({
        imports: [
            NoopAnimationsModule,
            RouterTestingModule,
            CoreModule.forRoot()
        ]
    });

    beforeEach(() => {
        let fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        directive = new LoginFooterDirective(component);
    });

    it('applies template to Login component', () => {
        const template: any = '';
        directive.template = template;
        directive.ngAfterContentInit();
        expect(component.footerTemplate).toBe(template);
    });
});
