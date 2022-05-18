import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TschartComponent } from './tschart.component';

describe('TschartComponent', () => {
    let component: TschartComponent;
    let fixture: ComponentFixture<TschartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TschartComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TschartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
