import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { PopupBlockerWorkaroundService } from '../service/popup-blocker-workaround.service';
import { download } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
})
export class HomePage {
  private readonly popupBlockerWorkaround = inject(PopupBlockerWorkaroundService);
  constructor() {
    addIcons({ download });
  }

  async openPdf() {
    try {
      await this.popupBlockerWorkaround.openPortal('https://tomato-cindie-43.tiiny.site');
    } catch(e) {
      console.log('error openPdf', e);
    }
  }
}
