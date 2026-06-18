import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { REGIONAL_DATA, AVAILABLE_STATES } from '@/constants/regionalData';

interface StatePickerModalProps {
  visible: boolean;
  selectedStateId: string;
  onSelect: (stateId: string) => void;
  onClose: () => void;
}

export function StatePickerModal({ visible, selectedStateId, onSelect, onClose }: StatePickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.dragHandle} />
          <Text style={styles.title}>Select Location</Text>
          <Text style={styles.subtitle}>Choose a state to see localized gold prices</Text>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {AVAILABLE_STATES.map((state) => {
              const isSelected = state.id === selectedStateId;
              return (
                <Pressable
                  key={state.id}
                  style={[styles.stateItem, isSelected && styles.stateItemSelected]}
                  onPress={() => {
                    onSelect(state.id);
                    onClose();
                  }}
                >
                  <View>
                    <Text style={[styles.stateName, isSelected && styles.stateNameSelected]}>
                      {state.name}
                    </Text>
                    <Text style={styles.stateCities}>
                      Top markets: {state.cities.map(c => c.name).join(', ')}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stateItemSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  stateName: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stateNameSelected: {
    color: Colors.gold,
  },
  stateCities: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textSecondary,
  },
  checkIcon: {
    fontSize: 20,
    color: Colors.gold,
    fontFamily: Typography.fonts.bold,
  },
});
