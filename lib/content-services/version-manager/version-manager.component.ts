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

import { Component, Input, ViewEncapsulation, ViewChild, Output, EventEmitter } from '@angular/core';
import { MinimalNodeEntryEntity } from 'alfresco-js-api';
import { VersionListComponent } from './version-list.component';
import { AppConfigService, ContentService } from '@alfresco/adf-core';

@Component({
    selector: 'adf-version-manager',
    templateUrl: './version-manager.component.html',
    styleUrls: ['./version-manager.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VersionManagerComponent {

    @Input()
    node: MinimalNodeEntryEntity;

    @Input()
    showComments = true;

    @Input()
    allowDownload = true;

    @Output()
    uploadSuccess = new EventEmitter();

    @Output()
    uploadError = new EventEmitter();

    @ViewChild('versionList')
    versionListComponent: VersionListComponent;

    constructor(
        config: AppConfigService,
        private contentService: ContentService) {
        this.showComments = config.get('adf-version-manager.allowComments', true);
        this.allowDownload = config.get('adf-version-manager.allowDownload', true);
    }

    onUploadSuccess(event): void {
        this.versionListComponent.loadVersionHistory();
        this.uploadSuccess.emit(event);
    }

    canUpdate(): boolean {
        return this.contentService.hasPermission(this.node, 'update');
    }
}
