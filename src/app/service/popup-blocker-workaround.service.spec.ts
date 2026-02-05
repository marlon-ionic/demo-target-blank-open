import { TestBed } from '@angular/core/testing';
import { PopupBlockerWorkaroundService } from './popup-blocker-workaround.service';

/**
 * Basic unit tests for PopupBlockerWorkaroundService
 *
 * NOTE: These tests verify basic service functionality only.
 * Real platform-specific behavior (iOS InAppBrowser, Android Browser)
 * requires device/emulator testing and cannot be fully validated in
 * browser-based Karma tests.
 */
describe('PopupBlockerWorkaroundService', () => {
  let service: PopupBlockerWorkaroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupBlockerWorkaroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have openPortal method', () => {
    expect(service.openPortal).toBeDefined();
    expect(typeof service.openPortal).toBe('function');
  });

  it('should accept a URL parameter', () => {
    // Verify the method signature accepts a string
    expect(service.openPortal.length).toBe(1);
  });
});

