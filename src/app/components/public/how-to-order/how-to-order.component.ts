import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-to-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-to-order.component.html',
  styleUrl: './how-to-order.component.css'
})
export class HowToOrderComponent {

  toggleAnswer(event: any): void {
    const faqItem = event.currentTarget as HTMLElement;
    const isActive = faqItem.classList.contains('active');

    // Hide all paragraphs
    document.querySelectorAll('.faq-item p').forEach(p => {
      const paragraph = p as HTMLElement; // Cast Element to HTMLElement
      paragraph.style.maxHeight = '0';
      paragraph.style.opacity = '0';
      paragraph.style.display = 'none';
    });

    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
    });

    if (!isActive) {
      const answer = faqItem.querySelector('p') as HTMLElement;
      faqItem.classList.add('active');
      answer.style.display = 'block';
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.opacity = '1';
    }
  }


}
