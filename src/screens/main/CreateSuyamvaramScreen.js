// src/screens/main/CreateSuyamvaramScreen.js
const React = require('react');
const {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} = require('react-native');
const { Ionicons } = require('@expo/vector-icons');
const { LinearGradient } = require('expo-linear-gradient');
const Colors = require('../../theme/Colors');
const { supabase } = require('../../../supabase');

const CreateSuyamvaramScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    challenge_type: 'Skill Demonstration',
    max_participants: '50',
    deadlineDays: '7',
    reward: 'Direct connection + Verified Badge'
  });

  const challengeTypes = [
    'Skill Demonstration',
    'Fitness Achievement',
    'Creative Expression',
    'Adventure Proof',
    'Cooking Challenge',
    'Knowledge Challenge',
    'Community Good',
  ];

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.reward || !formData.max_participants || !formData.deadlineDays) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a challenge');
        setLoading(false);
        return;
      }

      // Calculate deadline timestamp
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + parseInt(formData.deadlineDays, 10));

      const { data, error } = await supabase
        .from('suyamvaram_challenges')
        .insert([
          {
            creator_id: user.id,
            title: formData.title,
            description: formData.description,
            challenge_type: formData.challenge_type,
            max_participants: parseInt(formData.max_participants, 10),
            deadline: deadlineDate.toISOString(),
            reward: formData.reward,
            status: 'active'
          }
        ])
        .select();

      if (error) throw error;

      Alert.alert('Success', 'Suyamvaram Challenge created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating challenge:', error);
      Alert.alert('Error', error.message || 'Failed to create challenge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Suyamvaram</Text>
        <TouchableOpacity onPress={handleCreate} disabled={loading} style={styles.postBtn}>
          {loading ? (
             <ActivityIndicator size="small" color="#D97706" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#D97706" />
          <Text style={styles.infoText}>
            Create a unique challenge to find a partner who shares your values and lifestyle.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Challenge Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. The Melodic Match"
            placeholderTextColor="#9CA3AF"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={60}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Task Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe exactly what they need to do..."
            placeholderTextColor="#9CA3AF"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Challenge Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {challengeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  formData.challenge_type === type && styles.typePillActive
                ]}
                onPress={() => setFormData({ ...formData, challenge_type: type })}
              >
                <Text
                  style={[
                    styles.typePillText,
                    formData.challenge_type === type && styles.typePillTextActive
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={formData.max_participants}
              onChangeText={(text) => setFormData({ ...formData, max_participants: text })}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Days Active</Text>
            <TextInput
              style={styles.input}
              placeholder="7"
              keyboardType="numeric"
              value={formData.deadlineDays}
              onChangeText={(text) => setFormData({ ...formData, deadlineDays: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reward for Completion</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Direct connection + Verified Badge"
            placeholderTextColor="#9CA3AF"
            value={formData.reward}
            onChangeText={(text) => setFormData({ ...formData, reward: text })}
          />
        </View>

        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumHeaderRow}>
               <Ionicons name="information-circle" size={20} color="#1D4ED8" />
               <Text style={[styles.premiumTitle, { color: '#1D4ED8' }]}>Admin-Reviewed Feature</Text>
            </View>
            <Text style={[styles.premiumDesc, { color: '#1E40AF' }]}>
              Your Suyamvaram will be visible to all Matrimony Mode users after admin approval. You can review all applicants before connecting.
            </Text>
          </LinearGradient>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#ffffff',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFFBEB', borderRadius: 20 },
  postBtnText: { color: '#D97706', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  infoText: { flex: 1, marginLeft: 12, color: '#4B5563', fontSize: 14, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  textArea: {
    height: 120,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  typePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typePillActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  typePillText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  typePillTextActive: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  premiumBanner: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 20,
  },
  premiumHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#D97706',
    fontSize: 16,
  },
  premiumDesc: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 20,
  }
});

module.exports = CreateSuyamvaramScreen;
