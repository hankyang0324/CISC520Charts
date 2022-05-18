import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Options, LabelType } from '@angular-slider/ngx-slider';

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
	spyBand = [];
	spyBand19 = [];
	bands = [];
	percentData: any[];
	lenData: any[];
	lenPercentData: any[];
	percentLenData: any[];

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

	constructor(private http: HttpClient) {}

	ngOnInit(): void {
		forkJoin([
			this.http.get('assets/historicalPrices.json'),
			this.http.get('assets/dailyTreasuryRates.json'),
		]).subscribe((data: [any[], any[]]) => {
			this.preprocessData(data);
			this.processNegativeYieldBand(this.data[1]);
			this.mergeNegativeYieldBand();
			this.processBearMarketBand(this.data[0], this.sliderValue / 100);
			this.spyBand19 = [...this.spyBand];
			this.spyBand19.splice(4, 1);
			this.processScatterPlotData(this.mergedYieldBand, this.spyBand19);
		});
	}

	preprocessData([spy, yieldRate]) {
		this.data = [[], []];
		const len0 = spy.length;
		const len1 = yieldRate.length;
		for (let i = len0 - 1; i >= 0; i--) {
			if (spy[i].Close) {
				this.data[0].push([new Date(spy[i].Date).getTime(), spy[i].Close]);
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
		console.log(this.data);
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
		this.bands = this.yieldBand.concat(this.spyBand);
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

	processBearMarketBand(spyArr: any[], threshold: number) {
		this.spyBand = [];
		let max = { date: spyArr[0][0], price: spyArr[0][1] };
		let min = { date: spyArr[0][0], price: spyArr[0][1], len: 0 };
		let days = 0;
		for (const [date, price] of spyArr) {
			days++;
			if (price >= max.price) {
				if (max.price * (1 - threshold) >= min.price) {
					const drop = (((min.price - max.price) / max.price) * 100).toFixed(2);
					let band = {
						from: max.date,
						to: min.date,
						drop: drop,
						type: 'spy',
						len: min.len,
					};
					this.spyBand.push(band);
				}
				days = 1;
				max = { date: date, price: price };
				min = { date: date, price: price, len: 1 };
			} else if (price <= min.price) {
				min = { date: date, price: price, len: days };
			}
		}
		this.bands = this.yieldBand.concat(this.spyBand);
	}

	processScatterPlotData(yieldRate: any[], spy: any[]) {
		this.lenData = [];
		this.percentData = [];
		this.lenPercentData = [];
		this.percentLenData = [];
		for (let i = 0; i < spy.length; i++) {
			const point1 = {
				x: yieldRate[i].len,
				y: spy[i].len,
				time: new Date(spy[i].from).getFullYear(),
			};
			const point2 = {
				x: -yieldRate[i].min,
				y: -parseFloat(spy[i].drop),
				time: new Date(spy[i].from).getFullYear(),
			};
			const point3 = {
				x: yieldRate[i].len,
				y: -parseFloat(spy[i].drop),
				time: new Date(spy[i].from).getFullYear(),
			};
			const point4 = {
				x: -yieldRate[i].min,
				y: spy[i].len,
				time: new Date(spy[i].from).getFullYear(),
			};
			this.lenData.push(point1);
			this.percentData.push(point2);
			this.lenPercentData.push(point3);
			this.percentLenData.push(point4);
		}
	}

	onSliderChange(event) {
		this.sliderValue = event.value;
		this.processBearMarketBand(this.data[0], this.sliderValue / 100);
	}
}
