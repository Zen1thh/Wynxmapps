import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    const overlayRef = useRef(null);
    const contentRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        let ctx: gsap.Context;
        if (isOpen && overlayRef.current && contentRef.current) {
            ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
                gsap.fromTo(contentRef.current, 
                    { opacity: 0, scale: 0.95, y: 10 }, 
                    { opacity: 1, scale: 1, y: 0, duration: 0.3, delay: 0.05, ease: "power2.out" }
                );
            });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             if (ctx) ctx.revert();
             document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                ref={overlayRef} 
                className="absolute inset-0 bg-slate-200/60 dark:bg-slate-900/80 backdrop-blur-md" 
                onClick={onClose}
            />
            <div 
                ref={contentRef} 
                className={`relative bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl w-full shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transition-colors duration-300 ${className || 'max-w-lg'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};