import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentEntries();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecentEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRecentEntries = async () => {
    try {
      setLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      const wellnessKeys = keys.filter(k => k.startsWith('wellness_'));
      
      if (wellnessKeys.length === 0) {
        setRecentEntries([]);
        setLoading(false);
        return;
      }

      const entries = await AsyncStorage.multiGet(wellnessKeys);
      
      const parsed = entries
        .map(([key, value]) => JSON.parse(value))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      setRecentEntries(parsed);
    } catch (err) {
      console.error('Error cargando registros:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiForValue = (value) => {
    const emojis = ['😫', '😕', '😐', '😊', '🤩'];
    return emojis[value - 1] || '😐';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const countActiveHabits = (habits) => {
    return Object.values(habits).filter(Boolean).length;
  };

  const HABIT_ICONS = {
    exercise: '💪',
    hydration: '💧',
    sleep: '😴',
    nutrition: '🥗',
  };

  const HABIT_LABELS = {
    exercise: 'Ejercicio',
    hydration: 'Hidratación',
    sleep: 'Sueño',
    nutrition: 'Alimentación',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>F2Fit Wellness</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.quickButton}
        onPress={() => navigation.navigate('Wellness')}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <View>
            <Text style={styles.buttonTitle}>Registrar Mi Día</Text>
            <Text style={styles.buttonSubtitle}>¿Cómo te sientes hoy?</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Tus Registros</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4081" />
          </View>
        ) : recentEntries.length > 0 ? (
          recentEntries.map((entry, index) => (
            <View key={index} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <View style={styles.habitBadge}>
                  <Text style={styles.habitBadgeText}>
                    {countActiveHabits(entry.habits)}/4 hábitos
                  </Text>
                </View>
              </View>
              
              <View style={styles.entryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>
                    {getEmojiForValue(entry.physical_energy)}
                  </Text>
                  <Text style={styles.statLabel}>Energía</Text>
                  <Text style={styles.statValue}>{entry.physical_energy}/5</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>
                    {getEmojiForValue(entry.emotional_state)}
                  </Text>
                  <Text style={styles.statLabel}>Emocional</Text>
                  <Text style={styles.statValue}>{entry.emotional_state}/5</Text>
                </View>
              </View>

              {/* Hábitos completados */}
              <View style={styles.habitsSection}>
                {Object.entries(entry.habits).map(([key, value]) => (
                  <View
                    key={key}
                    style={[
                      styles.habitChip,
                      value ? styles.habitChipActive : styles.habitChipInactive,
                    ]}
                  >
                    <Text style={styles.habitIcon}>{HABIT_ICONS[key]}</Text>
                    <Text
                      style={[
                        styles.habitChipText,
                        value ? styles.habitChipTextActive : styles.habitChipTextInactive,
                      ]}
                    >
                      {HABIT_LABELS[key]}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Notas con identificador */}
              {entry.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>📝 Nota:</Text>
                  <Text style={styles.notesText}>"{entry.notes}"</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Aún no tienes registros</Text>
            <Text style={styles.emptySubtitle}>
              Toca el botón rosa para empezar a registrar tu bienestar
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  quickButton: {
    backgroundColor: '#FF4081',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#FFE5EF',
    marginTop: 4,
  },
  arrow: {
    fontSize: 32,
    color: '#FFF',
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  entryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  habitBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  habitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  entryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4081',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  habitsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  habitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  habitChipActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  habitChipInactive: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  habitIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  habitChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  habitChipTextActive: {
    color: '#4CAF50',
  },
  habitChipTextInactive: {
    color: '#999',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});