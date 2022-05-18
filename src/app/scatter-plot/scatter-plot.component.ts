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
import * as Highcharts from 'highcharts';

@Component({
	selector: 'app-scatter-plot',
	templateUrl: './scatter-plot.component.html',
	styleUrls: ['./scatter-plot.component.less'],
})
export class ScatterPlotComponent implements OnInit, AfterViewInit, OnChanges {
	@ViewChild('scatterPlotContainer') chartContainer: ElementRef;
	@Input() data: any[];
	@Input() regression: any[];
	@Input() title = 'S&P & 10-2 Year Treasury Yield';
	@Input() yLabel = 'S&P';
	@Input() xLabel = '10-2 Year';
	@Input() unit = 'day';
	@Input() showRegression = true;
	chart: any;
	snpColor = '#0066CC';
	yieldColor = '#EE0000';
	option: any = {
		chart: {
			height: 500,
			width: 500,
		},
		title: {
			text: this.title,
		},
		xAxis: {
			min: 0,
			title: {
				text: this.xLabel,
				style: {
					color: this.yieldColor,
				},
			},
			labels: {
				formatter: function () {
					return this.value;
				},
				style: {
					color: this.yieldColor,
				},
			},
			startOnTick: true,
			endOnTick: true,
			showLastLabel: true,
		},
		yAxis: {
			min: 0,
			title: {
				text: this.yLabel,
				style: {
					color: this.snpColor,
				},
			},
			labels: {
				formatter: function () {
					return this.value;
				},
				style: {
					color: this.snpColor,
				},
			},
		},
		legend: {
			enabled: false,
		},
		credits: {
			enabled: false,
		},
		tooltip: {
			useHTML: true,
			formatter() {
				return `<div>${this.point.time}</div>
					<div>${this.y}</div>
					<div>${this.x}</div>`;
			},
		},
		plotOptions: {
			scatter: {
				marker: {
					radius: 6,
				},
			},
			states: {
				hover: {
					marker: {
						enabled: false,
					},
				},
			},
		},
		series: [
			{
				data: [],
				type: 'scatter',
			},
			{
				data: [],
				type: 'spline',
				color: 'orange',
				enableMouseTracking: false,
				marker: {
					enabled: false,
				},
			},
		],
	};

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && this.data && this.data.length) {
			this.prepare();
			this.draw();
		}
		if (changes.showRegression && this.chart) {
			if (this.chart.series[1]) {
				this.chart.series[1].remove();
			}
			if (this.showRegression) {
				this.chart.addSeries(this.option.series[1]);
			}
		}
	}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		this.option.chart.renderTo = this.chartContainer.nativeElement;
		if (this.data && this.data.length) {
			this.prepare();
			this.draw();
		}
	}

	prepare() {
		this.option.series[0].data = [...this.data];
		this.option.title.text = this.title;
		this.option.yAxis.title.text = this.yLabel;
		this.option.xAxis.title.text = this.xLabel;
		if (this.regression) {
			this.option.series[1].data = [...this.regression];
			const len = this.regression.length;
			this.option.xAxis.max = this.regression[len - 1].x;
		}
		if (this.unit === 'day') {
			this.option.tooltip.formatter = function () {
				return `
					<div>Bear Market Start Time: ${this.point.time}</div>
					<div style="color: #EE0000">Negative 10-2 Year: ${this.x} days</div>
					<div style="color: #0066CC">S&P Bear Market: ${this.y} days</div>
				`;
			};
			this.option.xAxis.labels.formatter = function () {
				return this.value;
			};
			this.option.yAxis.labels.formatter = function () {
				return this.value;
			};
		} else if (this.unit === 'percentage') {
			this.option.tooltip.formatter = function () {
				return `
					<div>Bear Market Start Time: ${this.point.time}</div>
					<div style="color: #EE0000">Max 10-2 Year Yield (Negative): ${this.x}%</div>
					<div style="color: #0066CC">S&P Drop: ${this.y}%</div>
				`;
			};
			this.option.xAxis.labels.formatter = function () {
				return this.value + '%';
			};
			this.option.yAxis.labels.formatter = function () {
				return this.value + '%';
			};
		} else if (this.unit === 'day-percentage') {
			this.option.tooltip.formatter = function () {
				return `
					<div>Bear Market Start Time: ${this.point.time}</div>
					<div style="color: #EE0000">Negative 10-2 Year: ${this.x} days</div>
					<div style="color: #0066CC">S&P Drop: ${this.y}%</div>
				`;
			};
			this.option.xAxis.labels.formatter = function () {
				return this.value;
			};
			this.option.yAxis.labels.formatter = function () {
				return this.value + '%';
			};
		} else if (this.unit === 'percentage-day') {
			this.option.tooltip.formatter = function () {
				return `
					<div>Bear Market Start Time: ${this.point.time}</div>
					<div style="color: #EE0000">Max 10-2 Year Rate (Negative): ${this.x}%</div>
					<div style="color: #0066CC">S&P Bear Market: ${this.y} days</div>
				`;
			};
			this.option.xAxis.labels.formatter = function () {
				return this.value + '%';
			};
			this.option.yAxis.labels.formatter = function () {
				return this.value;
			};
		}
	}

	draw() {
		if (this.chart) {
			this.chart.destroy();
		}
		this.chart = Highcharts.chart(this.option);
	}
}
