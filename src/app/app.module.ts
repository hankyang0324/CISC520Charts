import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TschartComponent } from './tschart/tschart.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';

@NgModule({
	declarations: [AppComponent, TschartComponent, ScatterPlotComponent],
	imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgxSliderModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
