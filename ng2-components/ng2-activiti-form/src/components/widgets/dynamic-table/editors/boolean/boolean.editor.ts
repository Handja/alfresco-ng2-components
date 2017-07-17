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

 /* tslint:disable:component-selector  */

import { Component, Input } from '@angular/core';
import { DynamicTableColumn, DynamicTableModel, DynamicTableRow } from './../../dynamic-table.widget.model';

@Component({
    selector: 'alf-boolean-editor',
    templateUrl: './boolean.editor.html',
    styleUrls: ['./boolean.editor.css']
})
export class BooleanEditorComponent {

    @Input()
    table: DynamicTableModel;

    @Input()
    row: DynamicTableRow;

    @Input()
    column: DynamicTableColumn;

    onValueChanged(row: DynamicTableRow, column: DynamicTableColumn, event: any) {
        let value: boolean = (<HTMLInputElement> event.target).checked;
        row.value[column.id] = value;
    }

}
