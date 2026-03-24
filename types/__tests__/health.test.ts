import {
  METRIC_TYPES,
  type MetricType,
  type MetricReading,
  type BloodPressureReading,
  type MetricDefinition,
  type NormStatus,
  type DataSource,
} from '../health';

describe('METRIC_TYPES', () => {
  it('contains exactly 12 values', () => {
    expect(METRIC_TYPES.length).toBe(12);
  });

  it('contains all expected metric type strings', () => {
    const expected: MetricType[] = [
      'heartRate',
      'restingHeartRate',
      'bloodPressureSystolic',
      'bloodPressureDiastolic',
      'hrv',
      'bloodGlucose',
      'weight',
      'sleep',
      'steps',
      'workouts',
      'walkingHeartRateAverage',
      'vo2Max',
    ];
    expected.forEach((metric) => {
      expect(METRIC_TYPES).toContain(metric);
    });
  });

  it('has no duplicate values', () => {
    expect(new Set(METRIC_TYPES).size).toBe(METRIC_TYPES.length);
  });
});

describe('MetricReading', () => {
  it('accepts a valid heart rate reading', () => {
    const reading: MetricReading = {
      metricType: 'heartRate',
      value: 72,
      unit: 'bpm',
      date: new Date(),
      source: 'healthkit',
    };
    expect(reading.metricType).toBe('heartRate');
    expect(reading.value).toBe(72);
    expect(reading.unit).toBe('bpm');
    expect(reading.source).toBe('healthkit');
  });

  it('accepts a manual source reading', () => {
    const reading: MetricReading = {
      metricType: 'bloodPressureSystolic',
      value: 120,
      unit: 'mmHg',
      date: '2026-01-01T00:00:00Z',
      source: 'manual',
    };
    expect(reading.source).toBe('manual');
  });

  it('accepts date as a string', () => {
    const reading: MetricReading = {
      metricType: 'steps',
      value: 8000,
      unit: 'count',
      date: '2026-01-01',
      source: 'healthkit',
    };
    expect(typeof reading.date).toBe('string');
  });
});

describe('BloodPressureReading', () => {
  it('accepts a reading with all fields', () => {
    const reading: BloodPressureReading = {
      systolic: 120,
      diastolic: 80,
      date: new Date(),
      source: 'manual',
      pulse: 72,
    };
    expect(reading.systolic).toBe(120);
    expect(reading.diastolic).toBe(80);
    expect(reading.pulse).toBe(72);
  });

  it('accepts a reading without pulse (optional field)', () => {
    const reading: BloodPressureReading = {
      systolic: 118,
      diastolic: 76,
      date: new Date(),
      source: 'healthkit',
    };
    expect(reading.pulse).toBeUndefined();
  });
});

describe('MetricDefinition', () => {
  it('accepts a definition with all fields', () => {
    const def: MetricDefinition = {
      type: 'heartRate',
      displayName: 'Heart Rate',
      unit: 'bpm',
      healthKitIdentifier: 'HKQuantityTypeIdentifierHeartRate',
      hasNorm: true,
    };
    expect(def.type).toBe('heartRate');
    expect(def.healthKitIdentifier).toBeDefined();
  });

  it('accepts a definition without healthKitIdentifier (optional field)', () => {
    const def: MetricDefinition = {
      type: 'weight',
      displayName: 'Weight',
      unit: 'kg',
      hasNorm: false,
    };
    expect(def.healthKitIdentifier).toBeUndefined();
  });
});

describe('module exports', () => {
  it('exports METRIC_TYPES as a non-empty array', () => {
    expect(Array.isArray(METRIC_TYPES)).toBe(true);
    expect(METRIC_TYPES.length).toBeGreaterThan(0);
  });
});

describe('NormStatus', () => {
  it('accepts none as a valid value for trend-only metrics', () => {
    const status: NormStatus = 'none';
    expect(status).toBe('none');
  });

  it('accepts all norm status values', () => {
    const statuses: NormStatus[] = ['green', 'yellow', 'red', 'none'];
    expect(statuses).toHaveLength(4);
  });
});

describe('DataSource', () => {
  it('accepts healthkit', () => {
    const source: DataSource = 'healthkit';
    expect(source).toBe('healthkit');
  });

  it('accepts manual', () => {
    const source: DataSource = 'manual';
    expect(source).toBe('manual');
  });
});
