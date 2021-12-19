import { compareDates } from '../compare-dates';

describe('Compare dates test', () => {
  test('a > b', (done) => {
    const a = '2020-09-30T16:50:54.479402';
    const b = '2020-09-30T16:46:55.363772';

    const result = compareDates(a, b);
    expect(result).toBeGreaterThan(0);
    done();
  });

  test('a < b', (done) => {
    const a = '2020-09-30T16:46:55.363772';
    const b = '2020-09-30T16:50:54.479402';

    const result = compareDates(a, b);
    expect(result).toBeLessThan(0);
    done();
  });

  test('a = b', (done) => {
    const a = '2020-09-30T16:46:55.363772';
    const b = '2020-09-30T16:46:55.363772';

    const result = compareDates(a, b);
    expect(result).toEqual(0);
    done();
  });
});
