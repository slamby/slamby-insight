require('!style!css!bootstrap/dist/css/bootstrap.min.css');
require('!style!css!font-awesome/css/font-awesome.min.css');
require('!style!css!animate.css/animate.min.css');
require('!style!css!./../../bower_components/bootstrap-side-navbar/source/assets/stylesheets/navbar-fixed-side.css');
require('!style!css!ng2-toastr/bundles/ng2-toastr.min.css');
require('!style!css!ng2-toasty/style.css');
require('!style!css!ng2-slim-loading-bar/style.css');
require('!style!css!@angular/material/core/theming/prebuilt/deeppurple-amber.css');
require('!style!css!ag-grid/dist/styles/ag-grid.css');
require('!style!css!ag-grid/dist/styles/theme-fresh.css');

require('!style!css!sass!../assets/site.scss');

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app.module';

import { IpcHelper } from './common/helpers/ipc.helper';

if (!IpcHelper.getGlobals().developmentMode) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
