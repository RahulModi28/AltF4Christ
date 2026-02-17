import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        // Listen for changes on auth state (sing in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setUser(authUser); // Fallback to just auth user
            } else {
                setUser({ ...authUser, ...data }); // Merge profile data
            }
        } catch (err) {
            console.error(err);
            setUser(authUser);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, metadata) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
    };

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
