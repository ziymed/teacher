import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Check, Lock, ShieldCheck, X, BookOpen, Calendar, HelpCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { dashboard } from '@/routes';

interface PricingProps {
    userPlan: string;
    subscriptionStatus: string;
    subscriptionEndsAt: string | null;
}

export default function Pricing({ userPlan, subscriptionStatus, subscriptionEndsAt }: PricingProps) {
    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Form data for mock checkout
    const checkoutForm = useForm({
        plan: '',
        card_number: '',
        card_name: '',
        card_expiry: '',
        card_cvv: '',
    });

    const handleSelectPlan = (plan: 'pro' | 'premium') => {
        setSelectedPlan(plan);
        checkoutForm.setData('plan', plan);
        setIsCheckingOut(true);
    };

    // Live Credit Card spacing formatter
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) {
            value = value.substring(0, 16);
        }
        // Add spaces every 4 digits
        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        checkoutForm.setData('card_number', formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) {
            value = value.substring(0, 4);
        }
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        checkoutForm.setData('card_expiry', value);
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.substring(0, 3);
        }
        checkoutForm.setData('card_cvv', value);
    };

    const handleConfirmCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanCardNumber = checkoutForm.data.card_number.replace(/\s/g, '');
        if (cleanCardNumber.length < 16) {
            toast.error('Please enter a valid 16-digit credit card number.');
            return;
        }

        if (checkoutForm.data.card_name.length < 3) {
            toast.error('Please enter the cardholder\'s full name.');
            return;
        }

        if (checkoutForm.data.card_expiry.length < 5) {
            toast.error('Please enter a valid card expiry date (MM/YY).');
            return;
        }

        if (checkoutForm.data.card_cvv.length < 3) {
            toast.error('Please enter a valid 3-digit CVV.');
            return;
        }

        checkoutForm.transform((data) => ({
            ...data,
            card_number: cleanCardNumber,
        }));

        checkoutForm.post('/subscription/checkout', {
            onSuccess: () => {
                setIsCheckingOut(false);
                checkoutForm.reset();
                toast.success('Alhamdulillah! Your learning subscription has been activated successfully.');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Checkout transaction failed. Please try again.');
            },
        });
    };

    const plans = [
        {
            id: 'free',
            name: 'Free Trial',
            price: '$0',
            frequency: 'forever',
            description: 'Experience the Moroccan Quran platform basics.',
            features: [
                '1 Private 1-to-1 Quran booking session',
                'Access to all introductory learning materials',
                'Introductory Talqin Quran program',
                'Standard Zoom or Meet video rooms',
            ],
            limit: '1 session limit',
            bg: 'bg-white',
            borderColor: 'border-arabic-cream',
            buttonText: 'Current Plan',
            isCurrent: userPlan === 'free',
            action: null,
        },
        {
            id: 'pro',
            name: 'Monthly Pro Plan',
            price: '$29',
            frequency: 'month',
            description: 'Consistency & focus under direct Moroccan Ustaz bimbingan.',
            features: [
                'Up to 8 Private 1-to-1 Quran booking sessions (2 per week)',
                'Full access to Talqin, Tahseen & Tajweed programs',
                'Detailed progress feedback after every session',
                'Direct teacher Zoom and Meet video rooms',
                'Eligibility for official certificate of completion',
            ],
            limit: '8 sessions per month limit',
            bg: 'bg-white border-2 border-arabic-cream/80 relative shadow-md scale-[1.01]',
            badge: 'RECOMMENDED',
            borderColor: 'border-arabic-gold/50',
            buttonText: userPlan === 'pro' ? 'Current Plan' : 'Select Pro Plan',
            isCurrent: userPlan === 'pro',
            action: () => handleSelectPlan('pro'),
        },
        {
            id: 'premium',
            name: 'Premium Tajweed Unlimited',
            price: '$59',
            frequency: 'month',
            description: 'Master Al-Quran recitation with zero restrictions.',
            features: [
                'Unlimited Private 1-to-1 Quran booking sessions',
                'Priority slots access (Book any slot before anyone else)',
                'Priority issuance of verified learning certificates',
                'Teacher chat & direct WhatsApp support',
                'Direct custom class schedule templates',
            ],
            limit: 'No session limits',
            bg: 'bg-arabic-bronze text-arabic-sand border border-arabic-gold shadow-lg scale-[1.01]',
            borderColor: 'border-arabic-gold',
            buttonText: userPlan === 'premium' ? 'Current Plan' : 'Select Premium Plan',
            isCurrent: userPlan === 'premium',
            action: () => handleSelectPlan('premium'),
        },
    ];

    return (
        <>
            <Head title="Choose Subscription Plan" />

            <div className="min-h-screen bg-arabic-sand text-arabic-bronze font-sans p-6 flex flex-col justify-between items-center selection:bg-arabic-gold/30 antialiased relative overflow-hidden">
                
                {/* Visual Backdrop Mosque Silhouette */}
                <div className="absolute bottom-0 left-0 right-0 h-96 opacity-10 pointer-events-none -z-10 bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' fill='%234A3E3D'%3E%3Cpath d='M0,320 L0,220 C60,200 120,200 180,220 C240,240 300,240 360,220 C420,200 480,140 540,160 C600,180 660,260 720,270 C780,280 840,220 900,190 C960,160 1020,160 1080,180 C1140,200 1200,240 1260,220 C1320,200 1380,140 1440,160 L1440,320 Z'/%3E%3C/svg%3E")` }} />

                {/* Top Header bar */}
                <div className="w-full max-w-7xl flex justify-between items-center py-4 select-none shrink-0 border-b border-arabic-cream/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-arabic-bronze flex items-center justify-center text-arabic-gold">
                            <BookOpen className="h-4.5 w-4.5" />
                        </div>
                        <span className="font-serif text-sm font-black tracking-wide text-arabic-bronze">AL-QURAN ACADEMY</span>
                    </div>
                    <Link href={dashboard()}>
                        <Button variant="ghost" className="text-xs font-bold gap-1 rounded-xl hover:bg-arabic-cream/65 text-arabic-bronze h-9">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* Main Content Area */}
                <main className="w-full max-w-6xl py-12 flex flex-col justify-center items-center grow space-y-12">
                    
                    {/* Header Title block */}
                    <div className="text-center max-w-2xl mx-auto space-y-3 select-none">
                        <span className="text-[10px] tracking-[0.2em] uppercase font-black text-arabic-gold block">✦ Academy Subscription ✦</span>
                        <h1 className="text-3xl md:text-5xl font-serif font-black text-arabic-bronze leading-tight">
                            Select Your Quranic Plan
                        </h1>
                        <p className="text-xs md:text-sm font-medium text-arabic-bronze/70 leading-relaxed max-w-lg mx-auto">
                            Support our direct Maroko teacher platform and get structured private 1-to-1 Quranic recitation classes with active limit counts.
                        </p>
                    </div>

                    {/* Pricing 3-Grid */}
                    <div className="grid md:grid-cols-3 gap-8 w-full">
                        {plans.map((plan) => (
                            <div 
                                key={plan.id} 
                                className={`border rounded-[2.2rem] p-8 flex flex-col justify-between transition-all duration-300 group
                                    ${plan.bg} ${plan.borderColor}
                                    ${plan.isCurrent ? 'ring-2 ring-arabic-gold shadow-md' : 'hover:border-arabic-gold/60 hover:-translate-y-1 hover:shadow-xl'}`}
                            >
                                <div className="space-y-6">
                                    
                                    {/* Header Tier Plan */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-serif text-lg font-black">{plan.name}</h3>
                                            <span className="text-[9px] uppercase font-bold text-arabic-gold block tracking-wider">{plan.limit}</span>
                                        </div>
                                        {plan.badge && (
                                            <span className="bg-[#d4af37] text-[#343a40] text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                                {plan.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Pricing numeric */}
                                    <div className="flex items-baseline gap-1.5 border-b border-arabic-cream/60 pb-5">
                                        <span className="text-4xl font-extrabold font-serif">{plan.price}</span>
                                        <span className="text-[10px] text-arabic-bronze/60 font-bold uppercase tracking-wider">/ {plan.frequency}</span>
                                    </div>

                                    {/* Description text */}
                                    <p className="text-xs font-semibold leading-relaxed text-arabic-bronze/70">{plan.description}</p>

                                    {/* Features Checklist */}
                                    <ul className="space-y-3.5 pt-2 text-xs font-semibold select-none">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                                                    ${plan.id === 'premium' ? 'bg-arabic-gold/25 text-arabic-gold' : 'bg-arabic-cream text-arabic-bronze'}`}>
                                                    <Check className="h-3 w-3" />
                                                </div>
                                                <span className="leading-tight text-arabic-bronze/85">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                </div>

                                {/* Call to action button */}
                                <div className="pt-8">
                                    {plan.isCurrent ? (
                                        <Button 
                                            disabled 
                                            className="w-full rounded-full border border-arabic-gold/30 bg-arabic-gold/10 text-arabic-bronze text-xs font-bold shadow-inner h-11"
                                        >
                                            <ShieldCheck className="h-4.5 w-4.5 mr-1 text-[#28a745]" /> Your Active Plan
                                        </Button>
                                    ) : plan.action ? (
                                        <Button
                                            onClick={plan.action}
                                            className={`w-full rounded-full text-xs font-bold h-11 transition shadow-md hover:shadow-lg
                                                ${plan.id === 'premium' 
                                                    ? 'bg-arabic-gold hover:bg-arabic-gold/90 text-arabic-bronze' 
                                                    : 'bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand'}`}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    ) : (
                                        <Button 
                                            disabled
                                            className="w-full rounded-full bg-arabic-cream text-arabic-bronze/40 text-xs font-bold h-11"
                                        >
                                            Trial Account
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quality Guarantees footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 bg-arabic-cream/50 border border-arabic-cream/90 rounded-3xl p-5 w-full max-w-4xl text-xs font-bold text-arabic-bronze/70 select-none">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-arabic-gold shrink-0" />
                            <span>100% Mock Checkout Security</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4.5 w-4.5 text-arabic-gold shrink-0" />
                            <span>Verified Morocco Certification</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-4.5 w-4.5 text-arabic-gold shrink-0" />
                            <span>Flexible Upgrades Anytime</span>
                        </div>
                    </div>

                </main>

                {/* Footer Section */}
                <footer className="text-[10px] text-arabic-bronze/45 font-bold uppercase tracking-wider py-4 select-none shrink-0 border-t border-arabic-cream/60 w-full text-center">
                    © 2026 Al-Quran Arabic Academy. All billing checkout features are simulated in sandbox.
                </footer>

                {/* Mock Credit Card slide-up checkout modal */}
                {isCheckingOut && selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arabic-bronze/45 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
                        <div className="bg-white border-2 border-arabic-cream w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            
                            {/* Modal Header */}
                            <div className="bg-[#FCF9F2] px-6 py-4.5 border-b border-arabic-cream flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase font-black text-arabic-gold block tracking-wider">Secure Payment Desk</span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Checkout Plan Upgrade
                                    </h4>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsCheckingOut(false);
                                        checkoutForm.reset();
                                    }}
                                    className="p-2 hover:bg-arabic-cream rounded-full text-arabic-bronze/60 hover:text-arabic-bronze transition"
                                >
                                    <X className="h-4.5 w-4.5" />
                                </button>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handleConfirmCheckout}>
                                <div className="p-6 space-y-4">
                                    
                                    {/* Order Billing Summary Banner */}
                                    <div className="bg-arabic-cream/45 border border-arabic-cream/80 rounded-2xl p-4 flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] font-black text-arabic-bronze/60 block uppercase">Selected Plan</span>
                                            <span className="text-xs font-black text-arabic-bronze block">
                                                {selectedPlan === 'pro' ? 'Monthly Pro Plan' : 'Premium Tajweed Unlimited'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-extrabold text-[#28a745] block leading-none">
                                                {selectedPlan === 'pro' ? '$29.00' : '$59.00'}
                                            </span>
                                            <span className="text-[8px] font-bold text-arabic-bronze/50 uppercase block mt-1">/ month</span>
                                        </div>
                                    </div>

                                    {/* Credit Card Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase font-black text-arabic-bronze/60 block">Cardholder Full Name</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="AHMAD SYARIF"
                                            value={checkoutForm.data.card_name}
                                            onChange={(e) => checkoutForm.setData('card_name', e.target.value.toUpperCase())}
                                            className="w-full p-3 text-xs rounded-xl border border-arabic-cream bg-white text-arabic-bronze font-bold focus:border-arabic-gold outline-none shadow-sm"
                                        />
                                    </div>

                                    {/* Credit Card Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] uppercase font-black text-arabic-bronze/60 block flex items-center gap-1">
                                            <CreditCard className="h-3.5 w-3.5 text-arabic-gold" /> Credit Card Number
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="4111 2222 3333 4444"
                                            value={checkoutForm.data.card_number}
                                            onChange={handleCardNumberChange}
                                            className="w-full p-3 text-xs rounded-xl border border-arabic-cream bg-white text-arabic-bronze font-mono font-bold focus:border-arabic-gold outline-none shadow-sm"
                                        />
                                    </div>

                                    {/* CVV & Expiry grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] uppercase font-black text-arabic-bronze/60 block">Expiration Date</label>
                                            <input 
                                                type="text"
                                                required
                                                placeholder="MM/YY"
                                                value={checkoutForm.data.card_expiry}
                                                onChange={handleExpiryChange}
                                                className="w-full p-3 text-xs rounded-xl border border-arabic-cream bg-white text-arabic-bronze font-mono font-bold text-center focus:border-arabic-gold outline-none shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] uppercase font-black text-arabic-bronze/60 block">Secure CVV Code</label>
                                            <input 
                                                type="password"
                                                required
                                                placeholder="***"
                                                value={checkoutForm.data.card_cvv}
                                                onChange={handleCvvChange}
                                                className="w-full p-3 text-xs rounded-xl border border-arabic-cream bg-white text-arabic-bronze font-mono font-bold text-center focus:border-arabic-gold outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Form Action buttons */}
                                <div className="bg-[#FCF9F2] px-6 py-4.5 flex justify-end gap-2.5 border-t border-arabic-cream">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCheckingOut(false);
                                            checkoutForm.reset();
                                        }}
                                        className="rounded-full border-arabic-bronze/25 hover:bg-arabic-cream text-arabic-bronze text-xs font-bold h-9"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={checkoutForm.processing}
                                        className="rounded-full bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand text-xs font-bold px-6 shadow-md h-9 flex items-center gap-1.5"
                                    >
                                        {checkoutForm.processing ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-arabic-gold" />
                                                Processing Checkout...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-3.5 w-3.5 text-arabic-gold" />
                                                Confirm Billing Subscription
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>

                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
