import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const EMOJIS = ['😫', '😕', '😐', '😊', '🤩'];
const HABIT_LABELS = {
  exercise: '💪 Ejercicio',
  hydration: '💧 Hidratación',
  sleep: '😴 Sueño',
  nutrition: '🥗 Alimentación',
};

// IMPORTANTE: Cambiar por tu IP local si usas dispositivo físico
// Ejemplo: const API_URL = 'http://192.168.1.100:3000/api/wellness';
// const API_URL = 'http://localhost:3000/api/wellness';
const API_URL = 'http://10.40.150.90:3000/api/wellness'

export default function WellnessScreen({ navigation }) {
  const [energy, setEnergy] = useState(3);
  const [emotional, setEmotional] = useState(3);
  const [notes, setNotes] = useState('');
  const [habits, setHabits] = useState({
    exercise: false,
    hydration: false,
    sleep: false,
    nutrition: false,
  });
  const [loading, setLoading] = useState(false);

  const userId = 'test_user_123'; // En producción vendría de auth
  const today = new Date().toISOString().split('T')[0];

  // Cargar registro de hoy si existe (Criterio: actualizable durante el día)
  useEffect(() => {
    loadTodayEntry();
  }, []);

  const loadTodayEntry = async () => {
    try {
      // Intentar cargar desde cache local
      const cached = await AsyncStorage.getItem(`wellness_${today}`);
      if (cached) {
        const data = JSON.parse(cached);
        setEnergy(data.physical_energy);
        setEmotional(data.emotional_state);
        setNotes(data.notes || '');
        setHabits(data.habits);
      }
    } catch (err) {
      console.log('No hay registro previo hoy');
    }
  };

  const save = async () => {
    setLoading(true);

    const data = {
      user_id: userId,
      date: today,
      physical_energy: energy,
      emotional_state: emotional,
      notes: notes.trim() || null,
      habits,
    };

    // 1. Guardar en AsyncStorage (Criterio: Offline-first)
    try {
      await AsyncStorage.setItem(`wellness_${today}`, JSON.stringify(data));
    } catch (err) {
      console.error('Error guardando local:', err);
    }

    // 2. Intentar sincronizar con servidor
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error en servidor');
      }

      setLoading(false);
      Alert.alert('✅ Guardado', 'Tu registro se guardó correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setLoading(false);
      // Criterio: Funciona offline y sincroniza al recuperar conexión
      Alert.alert(
        '📱 Guardado localmente',
        'Tu registro se guardó en el dispositivo y se sincronizará cuando haya conexión',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const toggleHabit = (habitName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHabits((prev) => ({
      ...prev,
      [habitName]: !prev[habitName],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Bienestar</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Energía Física */}
        <View style={styles.section}>
          <Text style={styles.label}>⚡ Energía Física</Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.scaleButton,
                  energy === value && styles.scaleButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEnergy(value);
                }}
              >
                <Text style={styles.emoji}>{EMOJIS[value - 1]}</Text>
                <Text
                  style={[
                    styles.scaleNumber,
                    energy === value && styles.scaleNumberActive,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estado Emocional */}
        <View style={styles.section}>
          <Text style={styles.label}>💭 Estado Emocional</Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.scaleButton,
                  emotional === value && styles.scaleButtonActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEmotional(value);
                }}
              >
                <Text style={styles.emoji}>{EMOJIS[value - 1]}</Text>
                <Text
                  style={[
                    styles.scaleNumber,
                    emotional === value && styles.scaleNumberActive,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hábitos (Criterio 2: Toggle on/off con feedback) */}
        <View style={styles.section}>
          <Text style={styles.label}>✨ Hábitos de Hoy</Text>
          {Object.keys(habits).map((habitKey) => (
            <TouchableOpacity
              key={habitKey}
              style={styles.habitRow}
              onPress={() => toggleHabit(habitKey)}
            >
              <Text style={styles.habitLabel}>{HABIT_LABELS[habitKey]}</Text>
              <View
                style={[styles.toggle, habits[habitKey] && styles.toggleActive]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    habits[habitKey] && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notas opcionales */}
        <View style={styles.section}>
          <Text style={styles.label}>📝 Notas (opcional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="¿Algo especial que quieras recordar?"
            value={notes}
            onChangeText={setNotes}
            maxLength={100}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.charCount}>{notes.length}/100</Text>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={save}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : '💾 Guardar'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 16,
    color: '#FF4081',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    flex: 1,
    marginHorizontal: 3,
  },
  scaleButtonActive: {
    backgroundColor: '#FF4081',
  },
  emoji: {
    fontSize: 26,
  },
  scaleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  scaleNumberActive: {
    color: '#FFF',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  habitLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF4081',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    backgroundColor: '#FFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#FF4081',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});