import { TestBed } from '@angular/core/testing';

import { DeviceColoursService } from './device-colours.service';

describe('DeviceColoursService', () => {
  let service: DeviceColoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceColoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
