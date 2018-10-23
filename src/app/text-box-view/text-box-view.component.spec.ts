import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextBoxViewComponent } from './text-box-view.component';

describe('TextBoxViewComponent', () => {
  let component: TextBoxViewComponent;
  let fixture: ComponentFixture<TextBoxViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextBoxViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextBoxViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
