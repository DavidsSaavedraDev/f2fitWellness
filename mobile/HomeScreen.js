import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
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

      {/* CRITERIO 1: Acceso con 1 tap desde Home */}
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

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Tus entrenamientos aparecerán aquí
        </Text>
      </View>
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
  placeholder: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 15,
    color: '#2196F3',
    textAlign: 'center',
  },
});