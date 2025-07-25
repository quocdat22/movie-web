"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Import loader icon
import { Camera } from 'lucide-react';

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true); // For initial page load
    const [updating, setUpdating] = useState(false); // For update action
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false); // For avatar upload
    const [avatarFilePath, setAvatarFilePath] = useState<string | null>(null); // Đường dẫn file trong storage
    const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null); // Signed URL để hiển thị
    const [signedUrlLoading, setSignedUrlLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                } else if (data) {
                    setFullName(data.full_name);
                    setAvatarFilePath(data.avatar_url); // Lưu filePath
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, router]);

    // Lấy signed URL khi avatarFilePath thay đổi
    useEffect(() => {
        const getSignedUrl = async () => {
            if (!avatarFilePath) {
                setAvatarSignedUrl(null);
                return;
            }
            setSignedUrlLoading(true);
            const { data, error } = await supabase.storage.from('avatars').createSignedUrl(avatarFilePath, 60 * 60); // 1h
            if (error || !data?.signedUrl) {
                setAvatarSignedUrl(null);
            } else {
                setAvatarSignedUrl(data.signedUrl);
            }
            setSignedUrlLoading(false);
        };
        getSignedUrl();
    }, [avatarFilePath, supabase]);
    
    async function updateProfile() {
        if (!user) return;
        setUpdating(true);
        setMessage('');
        
        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
        });
        
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Profile updated successfully!');
        }
        setUpdating(false);
    }

    /**
     * Handle avatar file selection and upload to Supabase Storage
     * @param e React.ChangeEvent<HTMLInputElement>
     */
    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setAvatarUploading(true);
        setMessage('');
        try {
            if (!file.type.startsWith('image/')) {
                setMessage('Please select a valid image file.');
                setAvatarUploading(false);
                return;
            }
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
                upsert: true,
                contentType: file.type,
            });
            if (uploadError) {
                setMessage(`Upload error: ${uploadError.message}`);
                setAvatarUploading(false);
                return;
            }
            // Lưu filePath vào profiles.avatar_url
            const { error: updateError } = await supabase.from('profiles').update({
                avatar_url: fileName,
                updated_at: new Date().toISOString(),
            }).eq('id', user.id);
            if (updateError) {
                setMessage('Upload thành công nhưng cập nhật profile thất bại: ' + updateError.message);
            } else {
                setMessage('Avatar uploaded & profile updated!');
                setAvatarFilePath(fileName); // Cập nhật state để lấy signed url mới
            }
        } catch (err) {
            setMessage('Unexpected error uploading avatar.');
        }
        setAvatarUploading(false);
    }

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                    <img
                        src={signedUrlLoading ? '/no-avatar.png' : (avatarSignedUrl || '/no-avatar.png')}
                        alt="Avatar"
                        className="w-28 h-28 rounded-full object-cover border shadow"
                        onClick={() => document.getElementById('avatarFile')?.click()}
                        style={{ cursor: 'pointer' }}
                    />
                    <input
                        id="avatarFile"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                        className="hidden"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => document.getElementById('avatarFile')?.click()}
                    >
                        <Camera className="text-white w-8 h-8" />
                    </div>
                    {avatarUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        type="text"
                        value={fullName || ''}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>
                {/* Đã bỏ nút Choose file, chỉ còn avatar ở trên */}
                <div>
                    <Button onClick={updateProfile} disabled={updating}>
                        {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {updating ? 'Updating...' : 'Update Profile'}
                    </Button>
                </div>
                {message && <p className="text-sm mt-2">{message}</p>}
            </div>
        </div>
    );
} 