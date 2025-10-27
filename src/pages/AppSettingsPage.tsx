/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { createAppSettings, updateAppSettings } from "../api/appSettings";
import db from "../instant";
import type { Settings } from "../types";
import AdminLayout from '../components/layouts/AdminLayout';

const AppSettingsPage: React.FC<any> = ({ user, onLogout }) => {
  const { data, isLoading, error } = db.useQuery({
    AppSettings: {},
  });

  const [settings, setSettings] = useState<Settings>({ vatRate: 0, businessName: '', businessLogo: '' });

  const appSettings = data?.AppSettings?.[0];

  useEffect(() => {
    if (appSettings) {
      setSettings(appSettings.settings);
    }
  }, [appSettings]);

  const handleSave = async () => {
    const promise = appSettings
      ? updateAppSettings(appSettings.id, settings)
      : createAppSettings(settings);

    try {
      await toast.promise(promise, {
        loading: 'Saving settings...',
        success: 'Settings saved successfully!',
        error: (err: Error) => `Failed to save settings: ${err.message}`,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({ ...prev, businessLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <AdminLayout pageTitle="App Settings" user={user} onLogout={onLogout}>
      <Toaster position="top-right" />
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-zinc-700"
            >
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={settings.businessName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="businessLogo"
              className="block text-sm font-medium text-zinc-700"
            >
              Business Logo
            </label>
            <input
              type="file"
              id="businessLogo"
              name="businessLogo"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
            />
            {settings.businessLogo && <img src={settings.businessLogo} alt="Business Logo" className="mt-2 h-20" />}
          </div>
          <div>
            <label
              htmlFor="vatRate"
              className="block text-sm font--medium text-zinc-700"
            >
              VAT Rate (%)
            </label>
            <input
              type="number"
              id="vatRate"
              name="vatRate"
              value={settings.vatRate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900"
        >
          Save
        </button>
      </div>
    </AdminLayout>
  );
};

export default AppSettingsPage;
