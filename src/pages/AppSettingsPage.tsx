/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createAppSettings, updateAppSettings } from "../api/appSettings";
import db from "../instant";
import type { Settings } from "../types";
import AdminLayout from '../components/layouts/AdminLayout';

const AppSettingsPage: React.FC<any> = ({ user, onLogout }) => {
  const { data, isLoading, error } = db.useQuery({
    AppSettings: {},
  });

  const [settings, setSettings] = useState<Settings>({ vatRate: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appSettings = data?.AppSettings?.[0];

  useEffect(() => {
    if (appSettings) {
      setSettings(appSettings.settings);
    }
  }, [appSettings]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (appSettings) {
        await updateAppSettings(appSettings.id, settings);
      } else {
        await createAppSettings(settings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: Number(value) }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <AdminLayout pageTitle="App Settings" user={user} onLogout={onLogout}>
      <div className="p-4">
        <div className="space-y-2">
          <label
            htmlFor="vatRate"
            className="block text-sm font-medium text-zinc-700"
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
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AppSettingsPage;
