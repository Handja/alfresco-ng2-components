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

import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NodePaging } from 'alfresco-js-api';
import { SearchComponent } from '@alfresco/adf-content-services';

@Component({
    selector: 'adf-search-result-component',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {

    @ViewChild('search')
    search: SearchComponent;

    fileNodeId: string;
    queryParamName = 'q';
    searchedWord: string = '';
    fileShowed: boolean = false;
    navigationMode: string = 'dblclick';
    resultNodePageList: NodePaging;

    constructor(public router: Router,
                @Optional() private route: ActivatedRoute) {
    }

    ngOnInit() {
        if (this.route) {
            this.route.params.forEach((params: Params) => {
                this.searchedWord = params.hasOwnProperty(this.queryParamName) ? params[this.queryParamName] : null;
            });
        }
    }

    showSearchResult(event: NodePaging) {
        this.resultNodePageList = event;
    }

    refreshResults(event: any) {
        this.search.reload();
    }
}