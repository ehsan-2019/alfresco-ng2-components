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

import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { split, gql, InMemoryCache } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Injectable } from '@angular/core';
import { StorageService, AppConfigService, AlfrescoApiService } from '@alfresco/adf-core';
import { BaseCloudService } from './base-cloud.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationCloudService extends BaseCloudService {

    appsListening = [];

    constructor(apiService: AlfrescoApiService,
                appConfigService: AppConfigService,
                public apollo: Apollo,
                private http: HttpLink,
                private storageService: StorageService) {
        super(apiService, appConfigService);
    }

    private get webSocketHost() {
        return this.contextRoot.split('://')[1];
    }

    private get protocol() {
        return this.contextRoot.split('://')[0] === 'https' ? 'wss' : 'ws';
    }

    initNotificationsForApp(appName: string) {
        if (!this.appsListening.includes(appName)) {
            this.appsListening.push(appName);
            const httpLink = this.http.create({
                uri: `${this.getBasePath(appName)}/notifications/graphql`
            });

            const webSocketLink = new WebSocketLink({
                uri: `${this.protocol}://${this.webSocketHost}/${appName}/notifications/ws/graphql`,
                options: {
                    reconnect: true,
                    lazy: true,
                    connectionParams: {
                        kaInterval: 2000,
                        'X-Authorization': 'Bearer ' + this.storageService.getItem('access_token')
                    }
                }
            });

            const link = split(
                ({ query }) => {
                    const definition = getMainDefinition(query);
                    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
                },
                webSocketLink,
                httpLink
            );

            this.apollo.createNamed(appName, {
                link,
                cache: new InMemoryCache()
            });
        }
    }

    makeGQLQuery(appName: string, gqlQuery: string) {
        this.initNotificationsForApp(appName);
        return this.apollo.use(appName).subscribe({ query: gql(gqlQuery) });
    }
}