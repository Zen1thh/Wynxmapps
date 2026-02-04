
import React, { useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(contentRef.current, 
                { opacity: 0, scale: 0.95, y: 10 }, 
                { opacity: 1, scale: 1, y: 0, duration: 0.3, delay: 0.05, ease: "power2.out" }
            );
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
             document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                ref={overlayRef} 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" 
                onClick={onClose}
            />
            <div 
                ref={contentRef} 
                className={`relative bg-[#0f172a] border border-white/10 rounded-2xl w-full shadow-2xl flex flex-col max-h-[95vh] overflow-hidden ${className || 'max-w-lg'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
        </div>
    );
};
