import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it('accepts the local demo credentials', async () => {
    const result = await firstValueFrom(service.login({
      email: 'demo@bob.local',
      password: 'password'
    }));

    expect(result.success).toBeTrue();
  });

  it('rejects invalid local credentials', async () => {
    const result = await firstValueFrom(service.login({
      email: 'wrong@bob.local',
      password: 'incorrect'
    }));

    expect(result.success).toBeFalse();
  });

  it('simulates a local registration without persisting it', async () => {
    const result = await firstValueFrom(service.register({
      name: 'Ada Lovelace',
      email: 'ada@bob.local',
      password: 'password'
    }));

    expect(result.success).toBeTrue();
  });
});
