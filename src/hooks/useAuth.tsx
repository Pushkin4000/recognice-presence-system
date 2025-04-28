
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { descriptorToString, doFacesMatch, getFaceDescriptor } from '@/services/faceRecognition';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  faceEncoding?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithFace: (faceDescriptor: Float32Array) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerFace: (userId: string, faceDescriptor: Float32Array) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasFaceRegistered: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as const,
    avatar: '',
    faceEncoding: ''
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user' as const,
    avatar: '',
    faceEncoding: ''
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on component mount
    const storedUser = localStorage.getItem('attendance_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('attendance_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Check if current user has registered face data
  const hasFaceRegistered = Boolean(user?.faceEncoding);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user (in a real app, this would be an API call)
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      // Omit password from stored user data
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('attendance_user', JSON.stringify(userWithoutPassword));
      
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFace = async (faceDescriptor: Float32Array): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get all users from the database
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .not('face_encoding', 'is', null);

      if (error) {
        throw new Error(error.message);
      }

      let matchedUser = null;
      
      // Try to find a match among users with registered faces
      for (const profile of profiles) {
        if (profile.face_encoding && doFacesMatch(faceDescriptor, profile.face_encoding)) {
          matchedUser = profile;
          break;
        }
      }
      
      if (!matchedUser) {
        toast.error('Face not recognized');
        return false;
      }
      
      // Convert the Supabase profile to our User type
      const user: User = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: 'user', // Default role, you might want to store this in the database
        avatar: matchedUser.avatar_url,
        faceEncoding: matchedUser.face_encoding
      };
      
      // Store user in state and localStorage
      setUser(user);
      localStorage.setItem('attendance_user', JSON.stringify(user));
      
      toast.success('Face recognized! Logged in successfully');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Face login failed');
      console.error('Face login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // In a real app, you would send this data to your API
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        name,
        email,
        role: 'user' as const,
      };
      
      // Store user in state and localStorage
      setUser(newUser);
      localStorage.setItem('attendance_user', JSON.stringify(newUser));
      
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerFace = async (userId: string, faceDescriptor: Float32Array): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Convert the descriptor to a string for storage
      const faceEncoding = descriptorToString(faceDescriptor);
      
      // Update the profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ face_encoding: faceEncoding })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
      
      // Update local user
      if (user) {
        const updatedUser = { ...user, faceEncoding };
        setUser(updatedUser);
        localStorage.setItem('attendance_user', JSON.stringify(updatedUser));
      }
      
      toast.success('Face registered successfully');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register face');
      console.error('Face registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendance_user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithFace,
        register,
        registerFace,
        logout,
        isAuthenticated: !!user,
        hasFaceRegistered,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
