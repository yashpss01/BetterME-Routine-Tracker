import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import SignInScreen from '../screens/Auth/SignInScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import HabitsScreen from '../screens/Habits/HabitsScreen';
import AddHabitScreen from '../screens/Habits/AddHabitScreen';
import RoutinesScreen from '../screens/Routines/RoutinesScreen';
import AddRoutineScreen from '../screens/Routines/AddRoutineScreen';
import StatsScreen from '../screens/Stats/StatsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// just a placeholder for now
const IS_BETA = false;

function BottomTabs() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                    // hack for iphone x
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: '#999',
                tabBarLabelStyle: {
                    fontSize: 11,
                    marginBottom: 4
                },
                // messy inline logic, sorry
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Habits') {
                        iconName = focused ? 'checkbox' : 'checkbox-outline';
                    } else if (route.name === 'Routines') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Stats') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    // fallback
                    if (!iconName) iconName = 'help';

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Habits" component={HabitsScreen} />
            <Tab.Screen name="Routines" component={RoutinesScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

const AppNavigator = () => {
    const { user, loading } = useAuth();
    const { theme } = useTheme();
    const [isReady, setIsReady] = useState(false);

    // fake init
    useEffect(() => {
        setTimeout(() => {
            setIsReady(true);
        }, 100);
    }, []);

    if (loading || !isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.background }
                }}
            >
                {!user ? (
                    <Stack.Group>
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </Stack.Group>
                ) : (
                    <Stack.Group>
                        <Stack.Screen name="Main" component={BottomTabs} />

                        {/* Modals */}
                        <Stack.Screen
                            name="AddHabit"
                            component={AddHabitScreen}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen
                            name="AddRoutine"
                            component={AddRoutineScreen}
                            options={{ presentation: 'modal' }}
                        />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
