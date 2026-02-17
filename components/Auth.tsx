import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthProps {
    onLogin: () => void;
}

const InputField = ({ 
    icon: Icon, 
    type, 
    placeholder, 
    value, 
    onChange,
    isPassword = false,
    showPassword = false,
    setShowPassword
}: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">
            {placeholder}
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-blue-400 transition-colors">
                <Icon size={18} />
            </div>
            <input
                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 focus:border-primary dark:focus:border-blue-500 transition-all placeholder-slate-400"
                placeholder={`Enter your ${placeholder.toLowerCase()}`}
                required
            />
            {isPassword && setShowPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    </div>
);

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            toast.success(isLogin ? "Welcome back, Admin!" : "Account created successfully!", {
                description: "You have successfully signed in to Wynxsmapp Admin.",
                duration: 3000,
            });
            onLogin();
        }, 1500);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b1121] transition-colors duration-300">
            {/* Left Side - Visuals (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#153385]">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-white blur-[100px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[#f6ac24] blur-[100px]" />
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                            <span className="font-bold text-xl text-white">W</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Wynxsmapp</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold leading-tight">
                            Manage your charging network with <span className="text-[#f6ac24]">intelligence.</span>
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Monitor stations, track revenue, and manage bookings in real-time. 
                            The all-in-one dashboard for modern EV infrastructure.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-blue-200">
                        <span>© 2024 Wynxsmapp Inc.</span>
                        <span>•</span>
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[420px] space-y-8">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#153385] flex items-center justify-center shadow-lg">
                            <span className="font-bold text-lg text-white">W</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Wynxsmapp</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {isLogin ? 'Enter your details to access your admin panel.' : 'Get started with a 14-day free trial.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {!isLogin && (
                                <InputField 
                                    icon={User} 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={name}
                                    onChange={(e: any) => setName(e.target.value)}
                                />
                            )}
                            
                            <InputField 
                                icon={Mail} 
                                type="text" 
                                placeholder="Email Address" 
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                            
                            <div className="space-y-2">
                                <InputField 
                                    icon={Lock} 
                                    isPassword={true} 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={(e: any) => setPassword(e.target.value)}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                />
                                {isLogin && (
                                    <div className="flex justify-end">
                                        <button type="button" className="text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#153385] dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="text-center pt-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={toggleMode}
                                className="ml-1.5 font-bold text-primary dark:text-blue-400 hover:underline focus:outline-none"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};