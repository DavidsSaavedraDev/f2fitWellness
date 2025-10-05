// backend/wellness.test.js
// Test unitario de función crítica (validación)

const { wellnessSchema } = require('./server');

describe('Validación de datos wellness (Función Crítica)', () => {
  test('debe validar datos correctos', () => {
    const validData = {
      user_id: 'test_user_123',
      date: '2024-03-15',
      physical_energy: 4,
      emotional_state: 3,
      notes: 'Día productivo',
      habits: {
        exercise: true,
        hydration: true,
        sleep: false,
        nutrition: true,
      },
    };

    const result = wellnessSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('debe rechazar physical_energy fuera de rango', () => {
    const invalidData = {
      user_id: 'test_user_123',
      date: '2024-03-15',
      physical_energy: 9, // Fuera de rango 1-5
      emotional_state: 3,
      habits: {
        exercise: true,
        hydration: true,
        sleep: false,
        nutrition: true,
      },
    };

    const result = wellnessSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('debe rechazar notas mayores a 100 caracteres', () => {
    const invalidData = {
      user_id: 'test_user_123',
      date: '2024-03-15',
      physical_energy: 4,
      emotional_state: 3,
      notes: 'a'.repeat(101), // 101 caracteres
      habits: {
        exercise: true,
        hydration: true,
        sleep: false,
        nutrition: true,
      },
    };

    const result = wellnessSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test('debe aceptar datos sin notas (opcional)', () => {
    const validData = {
      user_id: 'test_user_123',
      date: '2024-03-15',
      physical_energy: 4,
      emotional_state: 3,
      // notas omitidas
      habits: {
        exercise: true,
        hydration: true,
        sleep: false,
        nutrition: true,
      },
    };

    const result = wellnessSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});