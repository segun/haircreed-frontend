
import React, { useState, useMemo } from 'react';

type PasswordResetPageProps = {
  onPasswordReset: (newPassword: string) => void;
};

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(password),
  };

  const Requirement = ({ label, met }: { label: string; met: boolean }) => (
    <li className={`text-sm ${met ? 'text-green-600' : 'text-red-600'}`}>
      {met ? '✓' : '✗'} {label}
    </li>
  );

  return (
    <ul className="mt-2 space-y-1">
      <Requirement label="At least 8 characters" met={criteria.length} />
      <Requirement label="At least one uppercase letter" met={criteria.uppercase} />
      <Requirement label="At least one lowercase letter" met={criteria.lowercase} />
      <Requirement label="At least one number" met={criteria.number} />
      <Requirement label="At least one special character" met={criteria.special} />
    </ul>
  );
};


const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ onPasswordReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isPasswordStrong = useMemo(() => {
    return (
      newPassword.length >= 8
    );
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setIsUpdating(true);
    try {
      await onPasswordReset(newPassword);
    } catch (err) {
      setError('An error occurred. Please try again.' + err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col justify-center items-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600">
          This is your first time logging in. Please set a new password.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-zinc-700"
              >
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
              <PasswordStrengthIndicator password={newPassword} />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isPasswordStrong || newPassword !== confirmPassword || isUpdating}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 disabled:bg-zinc-400"
              >
                {isUpdating ? '...Updating Password' : 'Set New Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
