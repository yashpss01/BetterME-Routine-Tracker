import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Clipboard, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import Button from '../../components/Button';

const SettingsScreen = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { signOut, user } = useAuth();
    const [dumping, setDumping] = useState(false);

    const exportData = async () => {
        setDumping(true);
        try {
            const [h, r, l] = await Promise.all([
                client.get('/habits'),
                client.get('/routines'),
                client.get('/stats/heatmap')
            ]);

            const obj = {
                user: user.username,
                date: new Date(),
                data: {
                    habits: h.data,
                    routines: r.data,
                    logs: l.data
                }
            };

            const str = JSON.stringify(obj, null, 2);
            Clipboard.setString(str);
            Alert.alert("Copied to clipboard!");

        } catch (e) {
            Alert.alert("Oops", "Could not export data");
        } finally {
            setDumping(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 20, color: theme.text }}>
                Settings
            </Text>

            <View style={{ marginBottom: 30 }}>
                <Text style={{ color: theme.textSecondary, marginBottom: 10, textTransform: 'uppercase' }}>App Settings</Text>

                <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={{ fontSize: 16, color: theme.text }}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                    />
                </View>
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={{ color: theme.textSecondary, marginBottom: 10, textTransform: 'uppercase' }}>Account</Text>

                <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={{ fontSize: 16, color: theme.text }}>User</Text>
                    <Text style={{ fontSize: 16, color: theme.textSecondary }}>{user?.username}</Text>
                </View>
            </View>

            <Button
                title={dumping ? "Exporting..." : "Export Data"}
                onPress={exportData}
                type="outline"
                style={{ marginBottom: 10 }}
            />

            <Button
                title="Log Out"
                onPress={signOut}
                style={{ backgroundColor: theme.error }}
            />

            <View style={{ marginTop: 30, alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary }}>BetterME v1.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
    }
});

export default SettingsScreen;
