// product-configurator/product-configurator.ts
import { Component } from '@angular/core';
import { UldeViewer } from '../ulde-viewer/ulde-viewer';

@Component({
  selector: 'product-configurator',
  standalone: true,
  imports: [UldeViewer],
  templateUrl: './product-configurator.html'
})
export class ProductConfigurator {
  selectedModelId = 'ULDE-MODEL-01';
  selectedVariantId = 'default';
  zoom = 1;
  rotation = { x: 0, y: 0, z: 0 };

  onViewerStateChange(state: any) {
    // sync UI or analytics
  }
}
