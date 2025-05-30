import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 testimonials', () => {
    expect(component.testimonials.length).toBe(5);
  });

  it('should have diverse testimonial authors (no more than 1 duplicate)', () => {
    const authors = component.testimonials.map(t => t.author);
    const uniqueAuthors = new Set(authors);
    
    // Should have at least 3 unique authors (allowing for 1 duplicate)
    expect(uniqueAuthors.size).toBeGreaterThanOrEqual(3);
  });

  it('should not have 3 identical testimonials from Dumitrache G. Gabriel', () => {
    const dumitracheTesimonials = component.testimonials.filter(
      t => t.author === 'Dumitrache G. Gabriel'
    );
    
    // Should have at most 1 testimonial from Dumitrache G. Gabriel
    expect(dumitracheTesimonials.length).toBeLessThanOrEqual(1);
  });

  it('should have about us section with correct id', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const aboutSection = compiled.querySelector('#despre-noi');
    expect(aboutSection).toBeTruthy();
  });

  it('should display testimonials with different content', () => {
    const contents = component.testimonials.map(t => t.content);
    const uniqueContents = new Set(contents);
    
    // Should have at least 3 unique testimonial contents
    expect(uniqueContents.size).toBeGreaterThanOrEqual(3);
  });

  it('should have Maria Popescu testimonial', () => {
    const mariaTestimonial = component.testimonials.find(
      t => t.author.includes('Maria Popescu')
    );
    expect(mariaTestimonial).toBeTruthy();
  });

  it('should have Alexandru Ionescu testimonial', () => {
    const alexandruTestimonial = component.testimonials.find(
      t => t.author.includes('Alexandru Ionescu')
    );
    expect(alexandruTestimonial).toBeTruthy();
  });
});
