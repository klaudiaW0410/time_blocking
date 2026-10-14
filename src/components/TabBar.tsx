import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';

export type TabKey = 'plan' | 'notes' | 'study' | 'movement' | 'profile';

interface TabBarProps {
  activeTab: TabKey;
  theme: ColorTheme;
  onTabChange: (tab: TabKey) => void;
  onPressAdd: () => void;
}

interface TabItemConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItemConfig[] = [
  { key: 'plan', label: 'Plan', icon: 'pie-chart-outline' },
  { key: 'notes', label: 'Notatki', icon: 'document-text-outline' },
  { key: 'study', label: 'Nauka', icon: 'school-outline' },
  { key: 'movement', label: 'Ruch', icon: 'fitness-outline' },
  { key: 'profile', label: 'Ja', icon: 'person-outline' },
];

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  theme,
  onTabChange,
  onPressAdd,
}) => {
  return (
    <View style={styles.wrapper}>
      {/* Floating Action Button "+" over the tab bar on the right */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: theme.accent }]}
          onPress={onPressAdd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Dodaj nowe zadanie lub blok"
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Navigation Bar */}
      <View
        style={[
          styles.barContainer,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Zakładka ${tab.label}`}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={21}
                color={isActive ? theme.accent : theme.gray}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.accent : theme.gray },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  fabWrapper: {
    position: 'absolute',
    top: -24,
    right: 20,
    zIndex: 10,
  },
  fabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
