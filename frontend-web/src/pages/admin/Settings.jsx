import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    latePenaltyPercent: 5,
    longLunchPenaltyPercent: 2,
    bonusThreshold100: 100,
    bonusThreshold50: 95,
    bonusMultiplier100: 100,
    bonusMultiplier50: 50,
    businessHoursStart: '07:00',
    lunchMaxMinutes: 60,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure calculation rules and system settings</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Penalty Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Penalty Rules</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late Clock-In Penalty (%)
            </label>
            <input
              type="number"
              value={settings.latePenaltyPercent}
              onChange={(e) => setSettings({ ...settings, latePenaltyPercent: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied when employee clocks in after {settings.businessHoursStart}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Long Lunch Penalty (%)
            </label>
            <input
              type="number"
              value={settings.longLunchPenaltyPercent}
              onChange={(e) => setSettings({ ...settings, longLunchPenaltyPercent: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Applied when lunch break exceeds {settings.lunchMaxMinutes} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Bonus Rules</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                100% Bonus Threshold (%)
              </label>
              <input
                type="number"
                value={settings.bonusThreshold100}
                onChange={(e) => setSettings({ ...settings, bonusThreshold100: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Efficiency threshold for 100% bonus</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                100% Bonus Multiplier (%)
              </label>
              <input
                type="number"
                value={settings.bonusMultiplier100}
                onChange={(e) => setSettings({ ...settings, bonusMultiplier100: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Bonus as % of base pay</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                50% Bonus Threshold (%)
              </label>
              <input
                type="number"
                value={settings.bonusThreshold50}
                onChange={(e) => setSettings({ ...settings, bonusThreshold50: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Efficiency threshold for 50% bonus</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                50% Bonus Multiplier (%)
              </label>
              <input
                type="number"
                value={settings.bonusMultiplier50}
                onChange={(e) => setSettings({ ...settings, bonusMultiplier50: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Bonus as % of base pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standard Start Time
            </label>
            <input
              type="time"
              value={settings.businessHoursStart}
              onChange={(e) => setSettings({ ...settings, businessHoursStart: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Clock-ins after this time are considered late</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Lunch Duration (minutes)
            </label>
            <input
              type="number"
              value={settings.lunchMaxMinutes}
              onChange={(e) => setSettings({ ...settings, lunchMaxMinutes: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lunch breaks exceeding this duration incur penalties</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Notify on Payroll Processing</p>
              <p className="text-xs text-gray-500">Send notifications when payroll is processed</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Notify on Anomalies</p>
              <p className="text-xs text-gray-500">Alert admins when anomalies are detected</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Daily Summary Emails</p>
              <p className="text-xs text-gray-500">Send daily summary to managers</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;

