import { useEffect, useState, useCallback } from 'react';
import {
    Edit2, Save, X, Check,
    User, Mail, Phone, AtSign, AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { StaffTopNav } from '../StaffDashboard/StaffTopNav.tsx';
import styles from './StaffProfile.module.css';

interface StaffProfileResponse {
    firstName: string | null;
    lastName: string | null;
    username: string;
    email: string;
    phoneNumber: string | null;
    profilePic: string | null;
}

function PasswordChangeForm() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!oldPassword || !newPassword) {
            setError('Both fields are required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await apiClient<void>('/staff/profile/password', {
                method: 'PATCH',
                data: { oldPassword, newPassword }
            });
            setOldPassword('');
            setNewPassword('');
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
        } catch (err) {
            const apiError = err as { response?: { data?: { message?: string } } };
            setError(apiError.response?.data?.message || 'Failed to update password.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.passwordCard}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Change Password</h2>
            </div>
            <div className={styles.passwordContent}>
                {error && (
                    <div className={styles.fieldError}>{error}</div>
                )}
                {saved && (
                    <div className={styles.successText}>Password updated successfully!</div>
                )}
                <div>
                    <p className={styles.fieldLabel}>Current Password</p>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`${styles.fieldInput} ${styles.fieldInputValid}`}
                    />
                </div>
                <div>
                    <p className={styles.fieldLabel}>New Password</p>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${styles.fieldInput} ${styles.fieldInputValid}`}
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={styles.btnUpdatePassword}
                >
                    {saving ? 'Saving...' : 'Update Password'}
                </button>
            </div>
        </div>
    );
}

export default function StaffProfile() {
    const [profile, setProfile] = useState<StaffProfileResponse | null>(null);
    const [draftPhone, setDraftPhone] = useState('');
    const [draftFirstName, setDraftFirstName] = useState('');
    const [draftLastName, setDraftLastName] = useState('');
    const [draftUsername, setDraftUsername] = useState('');
    const [draftEmail, setDraftEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            const profileData = await apiClient<StaffProfileResponse>('/staff/profile');
            setProfile(profileData);
            setDraftPhone(profileData.phoneNumber || '');
            setDraftFirstName(profileData.firstName || '');
            setDraftLastName(profileData.lastName || '');
            setDraftUsername(profileData.username || '');
            setDraftEmail(profileData.email || '');
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Unable to load your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile();
    }, [fetchProfile]);

    const isPhoneValid = draftPhone.length === 0 || draftPhone.length === 10;

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && profile) {
            const file = e.target.files[0];
            setAvatarPreview(URL.createObjectURL(file));
            setUploadingAvatar(true);
            setError(null);
            try {
                const formData = new FormData();
                formData.append('file', file);
                const result = await apiClient<{ url: string }>('/staff/profile/upload-avatar', {
                    method: 'POST',
                    data: formData
                });
                const updated = await apiClient<StaffProfileResponse>('/staff/profile', {
                    method: 'PATCH',
                    data: { profilePic: result.url }
                });
                setProfile(updated);
            } catch (err) {
                console.error('Failed to upload avatar:', err);
                setError('Unable to upload avatar. Please try again.');
                setAvatarPreview(null);
            } finally {
                setUploadingAvatar(false);
            }
        }
    };

    const handleSave = async () => {
        if (!profile) return;
        if (!isPhoneValid) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }
        setSaving(true);
        try {
            const updated = await apiClient<StaffProfileResponse>('/staff/profile', {
                method: 'PATCH',
                data: { 
                    firstName: draftFirstName.trim() || null,
                    lastName: draftLastName.trim() || null,
                    username: draftUsername.trim() || null,
                    email: draftEmail.trim() || null,
                    phoneNumber: draftPhone.trim() || null
                },
            });
            setProfile(updated);
            setDraftPhone(updated.phoneNumber || '');
            setDraftFirstName(updated.firstName || '');
            setDraftLastName(updated.lastName || '');
            setDraftUsername(updated.username || '');
            setDraftEmail(updated.email || '');
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2200);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Unable to save your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraftPhone(profile?.phoneNumber || '');
        setDraftFirstName(profile?.firstName || '');
        setDraftLastName(profile?.lastName || '');
        setDraftUsername(profile?.username || '');
        setDraftEmail(profile?.email || '');
        setAvatarPreview(null);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <StaffTopNav />
                <div className={styles.contentWrapper}>
                    <div className={styles.loadingText}>Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className={styles.pageContainer}>
                <StaffTopNav />
                <div className={styles.contentWrapper}>
                    <div className={styles.errorBox}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initials = (
        (profile.firstName?.[0] || profile.username[0] || '?') +
        (profile.lastName?.[0] || '')
    ).toUpperCase();

    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username;

    const PROFILE_FIELDS = [
        { key: 'firstName', label: 'First Name', icon: User, val: draftFirstName, setVal: setDraftFirstName, readVal: profile.firstName || '—' },
        { key: 'lastName', label: 'Last Name', icon: User, val: draftLastName, setVal: setDraftLastName, readVal: profile.lastName || '—' },
        { key: 'username', label: 'Username', icon: AtSign, val: draftUsername, setVal: setDraftUsername, readVal: profile.username },
        { key: 'email', label: 'Email', icon: Mail, val: draftEmail, setVal: setDraftEmail, readVal: profile.email, type: 'email' },
    ];

    return (
        <div className={styles.pageContainer}>
            <StaffTopNav />

            <div className={styles.contentWrapper}>

                <div className={styles.headerRow}>
                    <div 
                        className={styles.avatarContainer}
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                        {avatarPreview || profile.profilePic ? (
                            <img src={avatarPreview || profile.profilePic || ''} alt="Profile" className={`${styles.avatarImage} ${uploadingAvatar ? styles.avatarUploading : ''}`} />
                        ) : (
                            <span className={styles.avatarInitials}>{initials}</span>
                        )}
                        <div className={styles.avatarOverlay}>
                            <span className={styles.avatarOverlayText}>{uploadingAvatar ? '...' : 'Upload'}</span>
                        </div>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={uploadingAvatar} />
                    </div>
                    <div>
                        <h1 className={styles.nameTitle}>{fullName}</h1>
                        <p className={styles.usernameText}>@{profile.username}</p>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorBox}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Account Info</h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className={styles.btnEdit}
                            >
                                <Edit2 size={12} /> Edit
                            </button>
                        ) : (
                            <div className={styles.btnActionGroup}>
                                <button
                                    onClick={handleCancel}
                                    className={styles.btnCancel}
                                >
                                    <X size={12} /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !isPhoneValid}
                                    className={styles.btnSave}
                                >
                                    <Save size={12} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.fieldList}>
                        {PROFILE_FIELDS.map(({ key, label, icon: Icon, val, setVal, readVal, type = 'text' }) => (
                            <div key={key} className={styles.fieldRow}>
                                <div className={styles.fieldIconBox}>
                                    <Icon size={14} className={styles.fieldIcon} />
                                </div>
                                <div className={styles.fieldContent}>
                                    <p className={styles.fieldLabel}>{label}</p>
                                    {isEditing ? (
                                        <input
                                            type={type}
                                            value={val}
                                            onChange={(e) => setVal(e.target.value)}
                                            className={`${styles.fieldInput} ${styles.fieldInputValid}`}
                                        />
                                    ) : (
                                        <p className={styles.fieldValue}>{readVal}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className={styles.fieldRow}>
                            <div className={styles.fieldIconBox}>
                                <Phone size={14} className={styles.fieldIcon} />
                            </div>
                            <div className={styles.fieldContent}>
                                <p className={styles.fieldLabel}>Phone</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={draftPhone}
                                        onChange={(e) => {
                                            const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setDraftPhone(cleanValue);
                                        }}
                                        placeholder="e.g. 0812345678"
                                        maxLength={10}
                                        pattern="^[0-9]{10}$"
                                        title="Please enter a valid phone number containing exactly 10 digits."
                                        className={`${styles.fieldInput} ${isPhoneValid ? styles.fieldInputValid : styles.fieldInputInvalid}`}
                                    />
                                ) : null}
                                {isEditing && !isPhoneValid && (
                                    <p className={styles.fieldError}>
                                        Enter exactly 10 digits.
                                    </p>
                                )}
                                {!isEditing && (
                                    <p className={styles.fieldValue}>{profile.phoneNumber || '—'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <PasswordChangeForm />
            </div>

            {saved && (
                <div className={styles.toastMessage}>
                    <span className={styles.toastIcon}>
                        <Check size={10} strokeWidth={3} className="text-white" />
                    </span>
                    Profile saved
                </div>
            )}
        </div>
    );
}