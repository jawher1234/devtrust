import { TestBed } from '@angular/core/testing';

import { MouvementServiceService } from './mouvement-service.service';

describe('MouvementServiceService', () => {
  let service: MouvementServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouvementServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
