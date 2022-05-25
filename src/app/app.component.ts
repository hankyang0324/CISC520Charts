import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { SLR } from 'ml-regression';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
	title = 'CISC520Charts';
	data: any[];
	yieldBand = [];
	mergedYieldBand = [];
	snpBand = [];
	snpBand19 = [];
	bands = [];
	percentData: any[];
	lenData: any[];
	lenPercentData: any[];
	percentLenData: any[];
	regression = [];
	regressionData = [];
	regressionFnc = ['', '', '', ''];
	showRegression = true;
	sliderValue: number = 19;
	sliderOptions: Options = {
		floor: 1,
		ceil: 100,
		translate: (value: number, label: LabelType): string => {
			switch (label) {
				case LabelType.Low:
					return value + '%';
				case LabelType.High:
					return value + '%';
				default:
					return value + '%';
			}
		},
	};
	checked = true;

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		forkJoin([
			this.http.get('assets/historicalPrices.json'),
			this.http.get('assets/dailyTreasuryRates.json'),
		]).subscribe((data: [any[], any[]]) => {
			this.preprocessData(data);
			this.processNegativeYieldBand(this.data[1]);
			this.mergeNegativeYieldBand();
			this.processBearMarketBand(this.data[0], 0.19);
			this.snpBand19 = [...this.snpBand];
			this.snpBand19.splice(4, 1);
			this.processScatterPlotData(this.mergedYieldBand, this.snpBand19);
			this.processLinerRegression(this.lenData, 0, 250);
			this.processLinerRegression(this.percentData, 1, 0.6);
			this.processLinerRegression(this.lenPercentData, 2, 250);
			this.processLinerRegression(this.percentLenData, 3, 0.6);
		});
	}

	preprocessData([snp, yieldRate]) {
		this.data = [[], []];
		const len0 = snp.length;
		const len1 = yieldRate.length;
		for (let i = len0 - 1; i >= 0; i--) {
			if (snp[i].Close) {
				this.data[0].push([new Date(snp[i].Date).getTime(), snp[i].Close]);
			}
		}
		for (let i = len1 - 1; i >= 0; i--) {
			if (yieldRate[i]['10Yr'] && yieldRate[i]['2Yr']) {
				this.data[1].push([
					new Date(yieldRate[i].Date).getTime(),
					parseFloat((yieldRate[i]['10Yr'] - yieldRate[i]['2Yr']).toFixed(2)),
				]);
			}
		}
	}

	processNegativeYieldBand(yieldArr: any[]) {
		this.yieldBand = [];
		const len = yieldArr.length;
		let band = {
			from: null,
			to: null,
			type: 'yield',
			len: 0,
			min: 0,
		};
		for (let i = 1; i < len - 1; i++) {
			if (yieldArr[i - 1][1] >= 0 && yieldArr[i][1] < 0) {
				band = {
					from: yieldArr[i][0],
					to: null,
					type: 'yield',
					len: 1,
					min: yieldArr[i][1],
				};
			}
			if (yieldArr[i - 1][1] < 0 && yieldArr[i][1] < 0) {
				band.len++;
				band.min = Math.min(band.min, yieldArr[i][1]);
			}
			if (yieldArr[i][1] < 0 && yieldArr[i + 1][1] >= 0) {
				band.to = yieldArr[i][0];
				this.yieldBand.push({ ...band });
			}
		}
		this.bands = this.yieldBand.concat(this.snpBand);
	}

	mergeNegativeYieldBand() {
		this.mergeRange(0, 0, 0);
		this.mergeRange(1, 4, 3);
		this.mergeRange(5, 7, 6);
		this.mergeRange(8, 19, 17);
		this.mergeRange(20, 20, 20);
		this.mergeRange(21, 21, 21);
	}

	mergeRange(from: number, to: number, change: number) {
		let min = 0;
		let len = 0;
		for (let i = from; i <= to; i++) {
			min = Math.min(this.yieldBand[i].min, min);
			len += this.yieldBand[i].len;
		}
		this.mergedYieldBand.push({
			from: this.yieldBand[from].from,
			to: this.yieldBand[to].to,
			type: 'yield',
			len: len,
			min: min,
		});
		this.yieldBand[change].len = len;
		this.yieldBand[change].min = min;
		this.yieldBand[change].label = true;
	}

	processBearMarketBand(snpArr: any[], threshold: number) {
		this.snpBand = [];
		let max = { date: snpArr[0][0], price: snpArr[0][1] };
		let min = { date: snpArr[0][0], price: snpArr[0][1], len: 0 };
		let days = 0;
		for (const [date, price] of snpArr) {
			days++;
			if (price >= max.price) {
				if (max.price * (1 - threshold) >= min.price) {
					const drop = (((min.price - max.price) / max.price) * 100).toFixed(2);
					let band = {
						from: max.date,
						to: min.date,
						drop: drop,
						type: 'snp',
						len: min.len,
					};
					this.snpBand.push(band);
				}
				days = 1;
				max = { date: date, price: price };
				min = { date: date, price: price, len: 1 };
			} else if (price <= min.price) {
				min = { date: date, price: price, len: days };
			}
		}
		this.bands = this.yieldBand.concat(this.snpBand);
	}

	processScatterPlotData(yieldRate: any[], snp: any[]) {
		this.lenData = [];
		this.percentData = [];
		this.lenPercentData = [];
		this.percentLenData = [];
		for (let i = 0; i < snp.length; i++) {
			const point1 = {
				x: yieldRate[i].len,
				y: snp[i].len,
				time: new Date(snp[i].from).getFullYear(),
			};
			const point2 = {
				x: -yieldRate[i].min,
				y: -parseFloat(snp[i].drop),
				time: new Date(snp[i].from).getFullYear(),
			};
			const point3 = {
				x: yieldRate[i].len,
				y: -parseFloat(snp[i].drop),
				time: new Date(snp[i].from).getFullYear(),
			};
			const point4 = {
				x: -yieldRate[i].min,
				y: snp[i].len,
				time: new Date(snp[i].from).getFullYear(),
			};
			this.lenData.push(point1);
			this.percentData.push(point2);
			this.lenPercentData.push(point3);
			this.percentLenData.push(point4);
		}
	}

	linearRegression(data: { x: number; y: number }[]) {
		const inputs = [];
		const outputs = [];
		for (const point of data) {
			inputs.push(point.x);
			outputs.push(point.y);
		}
		const regression = new SLR(inputs, outputs);
		return regression;
	}

	processLinerRegression(data, index, to) {
		this.regression[index] = this.linearRegression(data);
		this.regressionFnc[index] = this.regression[index].toString(3);
		this.regressionData[index] = [
			{ x: 0, y: this.regression[index].predict(0) },
			{ x: to, y: this.regression[index].predict(to) },
		];
	}

	onSliderChange(event) {
		this.sliderValue = event.value;
		this.processBearMarketBand(this.data[0], this.sliderValue / 100);
	}

	onToggleBands() {
		this.checked = !this.checked;
		if (this.checked) {
			this.bands = this.yieldBand.concat(this.snpBand);
		} else {
			this.bands = [];
		}
	}
}
