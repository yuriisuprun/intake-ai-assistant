'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { adminApi } from '@/lib/api/admin';

interface Setting {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminApi.settings.getAll();
        if (response.data.success) {
          const settingsMap: Record<string, Setting> = {};
          response.data.data.forEach((setting: Setting) => {
            settingsMap[setting.setting_key] = setting;
          });
          setSettings(settingsMap);
        } else {
          setError('Failed to load settings');
        }
      } catch (err) {
        setError('Error loading settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const handleSave = async (key: string) => {
    try {
      setSaving(true);
      const response = await adminApi.settings.update(key, editValue);

      if (response.data.success) {
        setSettings((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            setting_value: editValue,
          },
        }));
        setEditingKey(null);
        setSuccess('Setting updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to update setting');
      }
    } catch (err) {
      setError('Error updating setting');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-4">
        {Object.entries(settings).map(([key, setting]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {setting.setting_type}
              </span>
            </div>

            <div className="mt-4">
              {editingKey === key ? (
                <div className="flex gap-2">
                  {setting.setting_type === 'boolean' ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      type={setting.setting_type === 'integer' ? 'number' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                  <button
                    onClick={() => handleSave(key)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingKey(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="px-4 py-2 bg-gray-50 rounded-lg flex-1">
                    <p className="text-gray-900 font-mono">
                      {setting.setting_type === 'boolean'
                        ? setting.setting_value === 'true'
                          ? 'Enabled'
                          : 'Disabled'
                        : setting.setting_value}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(key, setting.setting_value)}
                    className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Application Version</p>
            <p className="text-lg font-semibold text-gray-900">2.0.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Database Status</p>
            <p className="text-lg font-semibold text-green-600">Connected</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">API Status</p>
            <p className="text-lg font-semibold text-green-600">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
