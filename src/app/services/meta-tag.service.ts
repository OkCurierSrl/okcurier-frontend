import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {
  constructor(private meta: Meta) {}

  /**
   * Sets noindex meta tag for tracking pages
   */
  setNoIndexForTrackingPage(): void {
    // Remove any existing robots meta tag
    this.meta.removeTag('name="robots"');
    
    // Add noindex meta tag
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  /**
   * Resets meta tags to default (if needed)
   */
  resetMetaTags(): void {
    // Remove any existing robots meta tag
    this.meta.removeTag('name="robots"');
    
    // Add default meta tag if needed
    // Note: Since index.html already has a global noindex, this might not be necessary
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
