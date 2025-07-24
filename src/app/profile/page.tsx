"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Import loader icon

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true); // For initial page load
    const [updating, setUpdating] = useState(false); // For update action
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');

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
                    setAvatarUrl(data.avatar_url);
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, router]);
    
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

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
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
                <div>
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                        id="avatarUrl"
                        type="text"
                        value={avatarUrl || ''}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                </div>
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