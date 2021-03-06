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

import { async, inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AlfrescoApiService } from './alfresco-api.service';
import { AuthGuardEcm } from './auth-guard-ecm.service';
import { AuthenticationService } from './authentication.service';

class RouterProvider {
    navigate: Function = jasmine.createSpy('RouterProviderNavigate');
}

class AlfrescoApiServiceProvider {
    private settings: any = {
        validateTicket: true,
        isLoggedIn: true
    };

    constructor(settings: any = {}) {
        Object.assign(this.settings, settings);
    }

    getInstance() {
        return {
            ecmAuth: this.ecmAuth
        };
    }

    private get ecmAuth() {
        return {
            validateTicket: this.validateTicket.bind(this),
            isLoggedIn: this.isLoggedIn.bind(this)
        };
    }

    private validateTicket() {
        const { validateTicket } = this.settings;

        return validateTicket
            ? Promise.resolve('Valid!')
            : Promise.reject('Invalid');
    }

    private isLoggedIn() {
        return this.settings.isLoggedIn;
    }
}

class AuthenticationServiceProvider {
    setRedirectUrl: Function = jasmine.createSpy('setRedirectUrl');
}

class TestConfig {
    router: any;
    guard: any;
    auth: any;

    private settings: any = {
        validateTicket: true,
        isLoggedIn: true
    };

    constructor(settings: any = {}) {
        Object.assign(this.settings, settings);

        TestBed.configureTestingModule({
            providers: [
                this.routerProvider,
                this.alfrescoApiServiceProvider,
                this.authenticationProvider,
                AuthGuardEcm
            ]
        });

        inject([ AuthGuardEcm, Router, AuthenticationService ], (guard: AuthGuardEcm, router: Router, auth: AuthenticationService) => {
            this.guard = guard;
            this.router = router;
            this.auth = auth;
        })();
    }

    private get routerProvider() {
        return {
            provide: Router,
            useValue: new RouterProvider()
        };
    }

    private get authenticationProvider() {
        return {
            provide: AuthenticationService,
            useValue: new AuthenticationServiceProvider()
        };
    }

    private get alfrescoApiServiceProvider () {
        const { validateTicket, isLoggedIn } = this.settings;

        return {
            provide: AlfrescoApiService,
            useValue: new AlfrescoApiServiceProvider({
                validateTicket,
                isLoggedIn
            })
        };
    }

    get navigateSpy() {
        return this.router.navigate;
    }
}

describe('AuthGuardService ECM', () => {
    describe('user is not logged in', () => {
        beforeEach(async(() => {
            this.test = new TestConfig({
                isLoggedIn: false
            });

            const { guard, router } = this.test;

            guard.canActivate(null, { url: '' }).then((activate) => {
                this.activate = activate;
                this.navigateSpy = router.navigate;
            });
        }));

        it('does not allow route to activate', () => {
            expect(this.activate).toBe(false);
        });

        it('redirects to /login', () => {
            expect(this.navigateSpy).toHaveBeenCalledWith([ '/login' ]);
        });
    });

    describe('user is logged in but ticket is invalid', () => {
        beforeEach(async(() => {
            this.test = new TestConfig({
                isLoggedIn: true,
                validateTicket: false
            });

            const { guard, router } = this.test;

            guard.canActivate(null, { url: '' }).then((activate) => {
                this.activate = activate;
                this.navigateSpy = router.navigate;
            });
        }));

        it('does not allow route to activate', () => {
            expect(this.activate).toBe(false);
        });

        it('redirects to /login', () => {
            expect(this.navigateSpy).toHaveBeenCalledWith([ '/login' ]);
        });
    });

    describe('user is logged in and ticket is valid', () => {
        beforeEach(async(() => {
            this.test = new TestConfig({
                isLoggedIn: true,
                validateTicket: true
            });

            const { guard, router } = this.test;

            guard.canActivate(null, { url: '' }).then((activate) => {
                this.activate = activate;
                this.navigateSpy = router.navigate;
            });
        }));

        it('allows route to activate', () => {
            expect(this.activate).toBe(true);
        });

        it('does not redirect', () => {
            expect(this.navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe('redirect url', () => {
        beforeEach(async(() => {
            this.test = new TestConfig({
                isLoggedIn: false
            });

            const { guard, auth } = this.test;

            guard.canActivate(null, { url: 'some-url' }).then((activate) => {
                this.auth = auth;
            });
        }));

        it('should set redirect url', () => {
            expect(this.auth.setRedirectUrl).toHaveBeenCalledWith({ provider: 'ECM', url: 'some-url' });
        });
    });

    describe('canActivateChild', () => {
        describe('user is not logged in', () => {
            beforeEach(async(() => {
                this.test = new TestConfig({
                    isLoggedIn: false
                });

                const { guard } = this.test;

                guard.canActivateChild(null, { url: '' }).then((activate) => {
                    this.activate = activate;
                });
            }));

            it('should not allow route to activate', () => {
                expect(this.activate).toBe(false);
            });
        });

        describe('user is logged in but ticket is invalid', () => {
            beforeEach(async(() => {
                this.test = new TestConfig({
                    isLoggedIn: true,
                    validateTicket: false
                });

                const { guard } = this.test;

                guard.canActivateChild(null, { url: '' }).then((activate) => {
                    this.activate = activate;
                });
            }));

            it('should not allow route to activate', () => {
                expect(this.activate).toBe(false);
            });
        });

        describe('user is logged in and ticket is valid', () => {
            beforeEach(async(() => {
                this.test = new TestConfig({
                    isLoggedIn: true,
                    validateTicket: true
                });

                const { guard } = this.test;

                guard.canActivateChild(null, { url: '' }).then((activate) => {
                    this.activate = activate;
                });
            }));

            it('should allow route to activate', () => {
                expect(this.activate).toBe(true);
            });
        });
    });
});
