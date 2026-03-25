"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
    User,
    Mail,
    Clock,
    Globe,
    Award,
    ShieldCheck,
    Save,
    Loader2,
    Briefcase,
    Layers,
    Star,
    CheckCircle2,
    Calendar,
    AlertCircle
} from "lucide-react";

interface UserProfile {
    name: string;
    email: string;
    bio?: string;
    skills?: string[];
    chronotype?: string;
    workingHours?: { start: string; end: string };
    timezone?: string;
    reputationScore?: number;
    completedSwaps?: number;
    level?: number;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: "",
        email: "",
        bio: "",
        skills: [],
        chronotype: "bear",
        workingHours: { start: "09:00", end: "17:00" },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reputationScore: 100,
        completedSwaps: 0,
        level: 1,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/auth/me");
            if (response.success && response.user) {
                const user = response.user;
                setProfile({
                    name: user.name || "",
                    email: user.email || "",
                    bio: user.profile?.bio || "",
                    skills: user.profile?.skills || [],
                    chronotype: user.profile?.chronotype || "bear",
                    workingHours: user.availability?.workingHours || { start: "09:00", end: "17:00" },
                    timezone: user.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    reputationScore: user.availability?.reputationScore || 100,
                    completedSwaps: user.completedSwaps || 0,
                    level: user.level || 1,
                });
            }
        } catch (err) {
            console.error("Failed to load profile", err);
            setMessage({ type: "error", text: "Failed to load profile. Please refresh." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleWorkingHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({
            ...profile,
            workingHours: { ...profile.workingHours!, [e.target.name]: e.target.value },
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.patch("/auth/me", profile);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error("Update failed", err);
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const autoDetectTimezone = () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setProfile({ ...profile, timezone: tz });
        setMessage({ type: "success", text: `Timezone detected: ${tz}` });
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-gray-500">Manage your profile and preferences.</p>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                        {message.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        )}
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-900 pb-4 border-b border-gray-100">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2>Personal Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profile.email} // Read-only usually
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    rows={3}
                                    value={profile.bio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            <div className="flex items-center gap-2 mb-6 mt-8 text-lg font-semibold text-gray-900 pb-4 border-b border-gray-100">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h2>Scheduling Preferences</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronotype</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <select
                                            name="chronotype"
                                            value={profile.chronotype}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <option value="bear">Bear (Day Person)</option>
                                            <option value="wolf">Wolf (Night Owl)</option>
                                            <option value="lion">Lion (Early Bird)</option>
                                            <option value="dolphin">Dolphin (Irregular)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                name="timezone"
                                                value={profile.timezone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={autoDetectTimezone}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                                        >
                                            Detect
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            name="start"
                                            value={profile.workingHours?.start}
                                            onChange={handleWorkingHoursChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            name="end"
                                            value={profile.workingHours?.end}
                                            onChange={handleWorkingHoursChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 font-medium transition-all shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column - Stats Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-900 pb-4 border-b border-gray-100">
                                <Award className="w-5 h-5 text-yellow-500" />
                                <h2>Achievements</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                            <Star className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Reputation</p>
                                            <p className="text-xl font-bold text-gray-900">{profile.reputationScore}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Level</p>
                                            <p className="text-xl font-bold text-gray-900">{profile.level}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                                            <p className="text-xl font-bold text-gray-900">{profile.completedSwaps}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 pb-4 border-b border-gray-100">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <h2>Account Status</h2>
                            </div>
                            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">Your account is verified and active.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
