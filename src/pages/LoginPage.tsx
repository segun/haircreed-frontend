import React, { useState } from "react";

type InputFieldProps = {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};
// A simple, reusable Input component
const InputField = ({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}: InputFieldProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
            {label}
        </label>
        <div className="mt-1">
            <input
                id={id}
                name={id}
                type={type}
                required
                // Added text-zinc-900 to ensure typed text is dark and readable
                className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 text-zinc-900 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    </div>
);

type ButtonProps = {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    loading?: boolean;
};
// A simple, reusable Button component
const Button = ({ children, type = "submit", loading = false }: ButtonProps) => (
    <button
        type={type}
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 disabled:bg-zinc-500"
    >
        {loading ? "Signing in..." : children}
    </button>
);

// The main Login Page component
export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // --- REAL API CALL using fetch ---
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            // fetch doesn't throw an error for bad HTTP status, so we check the 'ok' status
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Login successful!", data);
            // TODO: Handle successful login:
            // 1. Save the user data/token (e.g., in context or state management)
            // 2. Redirect to the admin dashboard.

        } catch (err) {
            // Handle network errors or errors thrown from the response check
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Changed background to a light zinc color
        <div className="min-h-screen bg-zinc-100 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* You can replace this with your business logo */}
                <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <InputField
                            id="username"
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />

                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button loading={loading}>Sign in</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

