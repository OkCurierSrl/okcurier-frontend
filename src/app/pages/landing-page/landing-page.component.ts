
import {Component, ElementRef, ViewChild} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HeroComponent} from "../../components/public/hero/hero.component";
import {Testimonials} from "../../model/testimonials";


@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, HeroComponent, NgOptimizedImage],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  testimonials: Testimonials[] = [
    {
      content: 'Am ales okcurier.ro pentru trimiterile noastre pe eMAG și nu am putut fi mai mulțumit! Costurile sunt foarte competitive, iar pungile de curierat gratuite sunt un bonus excelent. Recomand cu încredere serviciile lor pentru eficiență și economie!',
      author: 'Marcu Ciprian, CEO la Marcu Business Solutions SRL'
    },
    {
      content: 'De când colaborăm cu okcurier.ro, totul este mult mai simplu! Procesul de creare a AWB-urilor este acum un joc de copii, și am observat o reducere semnificativă a retururilor. Este exact ceea ce avea nevoie afacerea mea pentru a crește fără griji.',
      author: 'Adrian Mitrache, owner ietraditionala.com'
    },
    {
      content: 'Folosesc okcurier.ro pentru a trimite ocazional plicuri cu documente și sunt impresionat de cât de ușor este procesul. Fără contract, plătesc cu cardul, iar curierul vine și ridică plicul rapid. Excelent pentru nevoile mele sporadice!',
      author: 'Dumitrache G. Gabriel'
    },
    {
      content: 'Serviciul OKCurier m-a ajutat enorm în dezvoltarea magazinului online. Livrările sunt întotdeauna la timp, iar clienții mei sunt foarte mulțumiți. Recomand cu încredere pentru orice business care vrea să crească!',
      author: 'Maria Popescu, proprietar magazin online'
    },
    {
      content: 'Am încercat mai multe servicii de curierat, dar OKCurier se remarcă prin profesionalism și prețuri competitive. Echipa lor este mereu disponibilă să răspundă la întrebări și să ofere soluții personalizate.',
      author: 'Alexandru Ionescu, manager logistică'
    }
  ];

  currentTestimonialIndex = 0;

  @ViewChild('testimonialsCarousel', { static: false })
  testimonialsCarousel: ElementRef;

  selectTestimonial(index: number) {
    this.currentTestimonialIndex = index;
    this.scrollToCurrentTestimonial();
  }

  scrollToCurrentTestimonial() {
    const carousel = this.testimonialsCarousel.nativeElement;
    const testimonialWidth = carousel.children[0].offsetWidth;
    const scrollPosition = testimonialWidth * this.currentTestimonialIndex;
    carousel.scrollTo({ left: scrollPosition - (carousel.offsetWidth / 2) + (testimonialWidth / 2), behavior: 'smooth' });
  }

  readonly imageDimensions = {
    creareAwb: {
      width: 800,
      height: 533  // assuming this is the actual aspect ratio of your image
    },
    // Add other image dimensions as needed
  };
}
