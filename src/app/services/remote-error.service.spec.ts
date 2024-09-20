import { TestBed } from '@angular/core/testing';

import { RemoteErrorService } from './remote-error.service';

describe('RemoteErrorService', () => {
  let service: RemoteErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
