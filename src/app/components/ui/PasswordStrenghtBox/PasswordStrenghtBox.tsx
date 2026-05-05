import styles from "./PasswordStrenghtBox.module.css"

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

export default function PasswordStrenghtBox({password}: {password: string}) {
    
    const messages = ["", "non sicura", "poco sicura", "sicura", "molto sicura"]
    const strength = calculatePasswordStrength(password)
    
    return <>
        <div className={styles.container}>
            <p className={styles.message}>{strength > 0 ? `Password ${messages[strength]}` : "Sicurezza Password"}</p>
            <div className={styles.barsContainer}>
                {[1, 2, 3, 4].map((index) => (
                    <div 
                        key={index}
                        className={`${styles.bar} ${index <= strength ? styles.filled : ""}`}
                    ></div>
                ))}
            </div>
        </div>
    </>
}