import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

type SettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

type Section = 'general' | 'updates' | 'about';

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState<Section>('general');
    const [appName, setAppName] = useState<string>('ProjexNexa'); // Default fallback
    const [appVersion, setAppVersion] = useState<string>('0.1.0'); // Default fallback
    const [theme, setTheme] = useState<string>(
        localStorage.getItem("theme") || "system"
    );


    useEffect(() => {
        applyTheme(theme);
    }, [theme]);
    
    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = event.target.value;
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    };
    
    const applyTheme = (selectedTheme: string) => {
        const root = document.documentElement;
        if (selectedTheme === "dark") {
            root.classList.add("dark");
        } else if (selectedTheme === "light") {
            root.classList.remove("dark");
        } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    };


    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (localStorage.getItem("theme") === "system") {
                applyTheme("system");
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);
    
    useEffect(() => {
        // Fetch app info from the backend
        invoke<[string, string]>('get_app_info')
            .then(([name, version]) => {
                setAppName(name);
                setAppVersion(version);
            })
            .catch((err) => {
                console.error('Failed to fetch app info:', err);
            });
    }, []);

    if (!isOpen) return null;

    const renderContent = () => {
        switch (activeSection) {
            case 'general':
                // return <div>General settings content goes here.</div>;
                return(
                    <div className="space-y-4">
                    <h2 className="text-xl font-bold">Appearance</h2>
                    <div className="flex items-center gap-4">
                        <span>Theme:</span>
                        <select
                            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white appearance-none"
                            value={theme}
                            onChange={handleThemeChange}
                        >
                            <option value="system">System Default</option>
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                        </select>
                    </div>
                </div>
                );
            case 'updates':
                return <div>Updates settings content goes here.</div>;
            case 'about':
                return (
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-4 dark:text-white">
                        <h2 className="text-2xl font-bold ">About {appName}</h2>
                        <div className="space-y-2">
                            <p className="text-lg">
                                <strong>App Name:</strong> {appName}
                            </p>
                            <p className="text-lg">
                                <strong>Version:</strong> {appVersion}
                            </p>
                            <p className="text-lg">
                                <strong>Description:</strong> {appName} is an open-source project management tool designed to
                                help teams collaborate, track progress, and achieve their goals efficiently.
                            </p>
                            <p className="text-lg">
                                <strong>License:</strong> MIT License
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Developers</h3>
                            <ul className="list-disc list-inside">
                                <li>EasyCanadianGamer (Lead Developer)</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Contribute</h3>
                            <p>
                                {appName} is open-source, and we welcome contributions from the community!
                            </p>
                            <p>
                                Visit our GitHub repository to get started:
                            </p>
                            <a
                                href="https://github.com/EasyCanadianGamer/ProjexNexa"
                                className="text-blue-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                github.com/EasyCanadianGamer/ProjexNexa
                            </a>
                            <p>
                                Check out the <strong>Contributing Guidelines</strong> and <strong>README</strong> for more details.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Contact Us</h3>
                            <p>
                                Email: <a href="mailto:easygamer2019@gmail.com.com" className="text-blue-500 hover:underline">easygamer2019@gmail.com</a>
                            </p>
                        </div>
                        {/* <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Legal</h3>
                            <p>
                                <a href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</a>
                            </p>
                            <p>
                                <a href="/terms-of-service" className="text-blue-500 hover:underline">Terms of Service</a>
                            </p>
                        </div> */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
                    <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] h-[400px] flex  dark:bg-gray-900">
                {/* Sidebar */}
                <div className="w-1/4 border-r border-gray-200 pr-4 dark:border-gray-50">
                    <h2 className="text-lg font-semibold mb-4">Settings</h2>
                    <ul className="space-y-2">
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded  cursor-pointer ${
                                    activeSection === 'general'
                                        ? 'bg-gray-200 text-black'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                                }`}
                                onClick={() => setActiveSection('general')}
                            >    
                                General
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded cursor-pointer ${
                                    activeSection === 'updates'
                                        ? 'bg-gray-200 text-black'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                                }`}
                                onClick={() => setActiveSection('updates')}
                            >
                                Updates
                            </button>
                        </li>
                        <li>
                            <button
                                className={`w-full text-left px-4 py-2 rounded cursor-pointer ${
                                    activeSection === 'about'
                                        ? 'bg-gray-200 text-black'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                                }`}
                                onClick={() => setActiveSection('about')}
                            >
                                About
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Content Area */}
                <div className="w-3/4 pl-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold capitalize">
                            {activeSection}
                        </h1>
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                    <div className="overflow-y-auto max-h-[320px] pr-4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;