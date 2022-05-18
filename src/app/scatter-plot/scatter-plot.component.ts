import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
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
	@Input() title = 'S&P & 10-2 Year Treasury Yield';
	@Input() yLabel = 'S&P';
	@Input() xLabel = '10-2 Year';
	@Input() unit = 'day';
	chart: any;
	snpColor = '#0066CC';
	yieldColor = '#EE0000';
	option: any = {
		chart: {
			type: 'scatter',
			height: 500,
			width: 500,
		},
		title: {
			text: this.title,
		},
		xAxis: {
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
			},
		],
	};

	constructor() {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.data && this.data && this.data.length) {
			this.option.series[0].data = [...this.data];
			this.option.title.text = this.title;
			this.option.yAxis.title.text = this.yLabel;
			this.option.xAxis.title.text = this.xLabel;
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
						<div style="color: #0066CC">S&P Biggest Drop: ${this.y}%</div>
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
						<div style="color: #0066CC">S&P Biggest Drop: ${this.y}%</div>
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
			this.draw();
		}
	}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		this.option.chart.renderTo = this.chartContainer.nativeElement;
		if (this.data && this.data.length) {
			this.option.series[0].data = [...this.data];
			this.option.title.text = this.title;
			this.option.yAxis.title.text = this.yLabel;
			this.option.xAxis.title.text = this.xLabel;
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
						<div style="color: #EE0000">Max 10-2 Year Rate (Negative): ${this.x}%</div>
						<div style="color: #0066CC">S&P Biggest Drop: ${this.y}%</div>
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
						<div style="color: #0066CC">S&P Biggest Drop: ${this.y}%</div>
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
			this.draw();
		}
	}

	draw() {
		if (this.chart) {
			this.chart.destroy();
		}
		this.chart = Highcharts.chart(this.option);
	}
}
