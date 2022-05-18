import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import * as Highcharts from 'highcharts/highstock';

@Component({
	selector: 'app-tschart',
	templateUrl: './tschart.component.html',
	styleUrls: ['./tschart.component.less'],
})
export class TschartComponent implements OnInit, AfterViewInit, OnChanges {
	@ViewChild('tsChartContainer') chartContainer: ElementRef;
	@Input() data: any[];
	@Input() title = 'S&P & 10-2Year Treasury Yield';
	@Input() yLabels = ['S&P', '10-2Y'];
	@Input() threshold = 0.19;
	@Input() bands: any[];
	chart: any;
	snpColor = '#0066CC';
	yieldColor = '#EE0000';
	option: any = {
		chart: {
			height: 600,
		},
		title: {
			text: this.title,
		},
		yAxis: [
			{
				labels: {
					formatter: function () {
						return this.value + '$';
					},
					style: {
						color: this.snpColor,
					},
				},
				title: {
					text: this.yLabels[0],
					style: {
						color: this.snpColor,
					},
				},
				opposite: false,
				plotLines: [
					{
						value: 0,
						width: 2,
						color: 'silver',
					},
				],
				showLastLabel: true,
			},
			{
				labels: {
					formatter: function () {
						return this.value + '%';
					},
					style: {
						color: this.yieldColor,
					},
				},
				title: {
					text: this.yLabels[1],
					style: {
						color: this.yieldColor,
					},
				},
				opposite: true,
				plotLines: [
					{
						value: 0,
						width: 2,
						color: 'black',
					},
				],
				showLastLabel: true,
			},
		],
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				day: '%b %e',
				week: '%b %e',
				month: '%b %Y',
			},
			plotBands: [],
		},
		plotOptions: {
			series: {
				lineWidth: 1,
				showInNavigator: true,
				dataGrouping: {
					enabled: false,
				},
			},
		},
		tooltip: {
			shared: true,
			split: false,
			xDateFormat: '%Y/%m/%d',
		},
		legend: {
			enabled: true,
			verticalAlign: 'bottom',
		},
		credits: {
			enabled: false,
		},
		series: [
			{
				name: this.yLabels[0],
				yAxis: 0,
				tooltip: {
					valueSuffix: '$',
				},
				// type: 'spline',
				color: '#0066CC',
				data: [],
			},
			{
				name: this.yLabels[1],
				yAxis: 1,
				tooltip: {
					valueSuffix: '%',
				},
				// type: 'spline',
				color: '#EE0000',
				data: [],
			},
		],
	};

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && this.data && this.data.length) {
			this.data.forEach((datum, idx) => (this.option.series[idx].data = datum));
			this.option.title.text = this.title;
			this.processBands();
			this.draw();
		}
		if (changes.bands && this.bands) {
			this.processBands();
		}
	}

	ngOnInit(): void {
		Highcharts.setOptions({
			lang: {
				thousandsSep: '',
			},
		});
	}

	ngAfterViewInit(): void {
		this.option.chart.renderTo = this.chartContainer.nativeElement;
		if (this.data && this.data.length) {
			this.data.forEach((datum, idx) => (this.option.series[idx].data = datum));
			this.option.title.text = this.title;
			this.processBands();
			this.draw();
		}
	}

	draw() {
		if (this.chart) {
			this.chart.destroy();
		}
		this.chart = new Highcharts.StockChart(this.option);
	}

	processBands() {
		if (this.bands) {
			const oldBands = [...this.option.xAxis.plotBands];
			this.option.xAxis.plotBands = [];
			for (const band of this.bands) {
				if (band.type === 'yield') {
					const yieldBand: any = {
						from: band.from,
						to: band.to,
						color: this.yieldColor + '50',
						borderWidth: 1,
						id: band.type + band.from,
					};
					if (band.label) {
						yieldBand.label = {
							useHTML: true,
							formatter() {
								return `<div style="color: #EE0000">${band.min}%</div><div style="color: #EE0000">${band.len} days</div>`;
							},
							y: 50,
						};
					}
					this.option.xAxis.plotBands.push(yieldBand);
				} else if ((band.type = 'S&P')) {
					this.option.xAxis.plotBands.push({
						from: band.from,
						to: band.to,
						color: this.snpColor + '50',
						borderWidth: 1,
						label: {
							useHTML: true,
							formatter() {
								return `<div style="color: #0066CC">${band.drop}%</div><div style="color: #0066CC">${band.len} days</div>`;
							},
						},
						id: band.type + band.from,
					});
				}
			}
			if (this.chart) {
				for (const band of oldBands) {
					// if (band.id.indexOf('S&P') !== -1) {
					this.chart.xAxis[0].removePlotBand(band.id);
					// }
				}
				for (const band of this.option.xAxis.plotBands) {
					// if (band.id.indexOf('S&P') !== -1) {
					this.chart.xAxis[0].addPlotBand(band);
					// }
				}
			}
		}
	}
}
