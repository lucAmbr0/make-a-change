'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'
import InputField from '@/app/components/ui/InputField/InputField';
import PasswordStrenghtBox from '@/app/components/ui/PasswordStrenghtBox/PasswordStrenghtBox';
import Title from "@/app/components/ui/Typography/Title/Title";
import Button from '@/app/components/ui/Button/Button';
import { Modal } from '@/app/components/ui/Modal/Modal';

function calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    // Minimum length requirement
    if (password.length < 8) return 1;

    // Check character variety
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z\d]/.test(password);

    const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

    // If only one type of character, return lowest strength
    if (varietyCount === 1) return 1;

    // Calculate strength based on variety and length
    let strength = 2; // Base strength for 8+ chars with 2+ variety
    if (varietyCount >= 3) strength = 3;
    if (varietyCount === 4 && password.length >= 12) strength = 4;

    return strength;
}

function getMaxBirthDate(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
}

function getMinBirthDate(): string {
    return "1900-01-01";
}

export default function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal, router]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newPassword = e.target.value;
        setFormData(prev => ({ ...prev, password: newPassword }));
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = "Il nome è obbligatorio";
        } else if (formData.firstName.length > 32) {
            newErrors.firstName = "Il nome non può superare 32 caratteri";
        } else if (formData.firstName.length < 1) {
            newErrors.firstName = "Il nome non può essere vuoto";
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Il cognome è obbligatorio";
        } else if (formData.lastName.length > 32) {
            newErrors.lastName = "Il cognome non può superare 32 caratteri";
        } else if (formData.lastName.length < 1) {
            newErrors.lastName = "Il cognome non può essere vuoto";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "L'email è obbligatoria";
        } else if (formData.email.length > 256) {
            newErrors.email = "L'email non può superare 256 caratteri";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Formato email non valido";
        }

        // Phone validation (optional but if provided must be valid)
        if (formData.phone) {
            if (formData.phone.length > 32) {
                newErrors.phone = "Il telefono non può superare 32 caratteri";
            }
        }

        // Birth date validation
        if (!formData.birthDate) {
            newErrors.birthDate = "La data di nascita è obbligatoria";
        } else {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();

            // Check if date is in the past
            if (birthDate >= today) {
                newErrors.birthDate = "La data di nascita deve essere nel passato";
            }

            // Check if year is between 1900 and current year
            const year = birthDate.getFullYear();
            if (year < 1900 || year > today.getFullYear()) {
                newErrors.birthDate = "La data di nascita deve essere tra il 1900 e l'anno corrente";
            }

            // Check if at least 18 years old
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                if (age < 18) {
                    newErrors.birthDate = "Devi avere almeno 18 anni";
                }
            } else if (age < 18) {
                newErrors.birthDate = "Devi avere almeno 18 anni";
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "La password è obbligatoria";
        } else if (formData.password.length < 8) {
            newErrors.password = "Minimo 8 caratteri";
        } else if (formData.password.length > 72) {
            newErrors.password = "Massimo 72 caratteri";
        } else if (passwordStrength < 2) {
            newErrors.password = "Password troppo debole (livello minimo 2/4)";
        } else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            newErrors.password = "Usa maiuscole, minuscole e numeri";
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "La conferma della password è obbligatoria";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Le password non corrispondono";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (validateForm()) {
            submitSignup();
        }
    };

    const submitSignup = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.firstName.trim(),
                    last_name: formData.lastName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone || null,
                    birth_date: formData.birthDate,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setApiError(data.message || 'Errore durante la creazione dell\'account');
                return;
            }

            // Account created successfully, show success modal
            setShowSuccessModal(true);
        } catch (error) {
            setApiError('Errore di connessione. Riprova più tardi');
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return <>
        <Title text="Crea il tuo account" alignment="center" hierarchy={1} />
        <form onSubmit={handleSubmit} className={styles.form}>
            <Title text="Inserisci i tuoi dati" alignment="left" hierarchy={2} />
            <div className={styles.userDataInputContainer}>
                <div>
                    <InputField
                        type='text'
                        label='Nome'
                        placeholder='Nome'
                        title='Nome'
                        maxLength={32}
                        required
                        minLength={1}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, firstName: e.target.value }));
                            if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                        }}
                    />
                    {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}
                </div>
                <div>
                    <InputField
                        type='text'
                        label='Cognome'
                        placeholder='Cognome'
                        title='Cognome'
                        maxLength={32}
                        required
                        minLength={1}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, lastName: e.target.value }));
                            if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                        }}
                    />
                    {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
                </div>
                <div>
                    <InputField
                        type='email'
                        label='Email'
                        placeholder='Email'
                        title='Email'
                        maxLength={256}
                        required
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}
                </div>
                <div>
                    <InputField
                        type='tel'
                        label='Telefono (opzionale)'
                        placeholder='Telefono'
                        title='Telefono'
                        maxLength={32}
                        onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                            setFormData(prev => ({ ...prev, phone: onlyNumbers }));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                        }}
                    />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                </div>
                <div>
                    <InputField
                        type='date'
                        label='Data di nascita'
                        placeholder='Data di nascita'
                        title='Data di nascita'
                        required
                        max={getMaxBirthDate()}
                        min={getMinBirthDate()}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, birthDate: e.target.value }));
                            if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: '' }));
                        }}
                    />
                    {errors.birthDate && <p className={styles.error}>{errors.birthDate}</p>}
                </div>
            </div>
            <Title text="Imposta la tua password" alignment="left" hierarchy={2} />
            <div className={styles.passwordCreationContainer}>
                <div className={styles.passwordInputsContainer}>
                    <div>
                        <InputField
                            type='password'
                            label='Nuova password'
                            placeholder='Nuova password'
                            title='Nuova password'
                            maxLength={72}
                            required
                            minLength={8}
                            onChange={handlePasswordChange}
                        />
                        {errors.password && <p className={styles.error}>{errors.password}</p>}
                    </div>
                    <div>
                        <InputField
                            type='password'
                            label='Ripeti nuova password'
                            placeholder='Ripeti nuova password'
                            title='Ripeti nuova password'
                            maxLength={72}
                            required
                            minLength={8}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }}
                        />
                        {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
                    </div>
                </div>
                <div className={styles.passwordStrenghtContainer}>
                    <PasswordStrenghtBox password={formData.password} />
                    {passwordStrength < 2 && formData.password && (
                        <p className={styles.strengthWarning}>
                            Raggiungere almeno livello 2 di sicurezza
                        </p>
                    )}
                </div>
            </div>
            {/* <InputField type='checkbox' required label='Accetto i termini e condizioni' title={''} /> */}
            {apiError && <p className={styles.apiError}>{apiError}</p>}
            <div className={styles.submitButtonContainer} style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
                <Button text={isLoading ? 'Creazione in corso...' : 'Crea account'} icon='material-symbols:add-circle-outline' />
            </div>
        </form>

        <Modal 
            open={showSuccessModal} 
            onClose={() => router.push('/')}
            overlayType="dark"
        >
            <div className={styles.successModalContent}>
                <div className={styles.successIcon}>✓</div>
                <Title text="Account creato" alignment="center" hierarchy={2} />
                <p className={styles.successMessage}>
                    Il tuo account è stato creato con successo. Verrai reindirizzato alla homepage fra 5 secondi.
                </p>
                <Button 
                    text="Vai alla homepage" 
                    icon="material-symbols:home-outline" 
                    onClick={() => router.push('/')}
                />
            </div>
        </Modal>
    </>;
}