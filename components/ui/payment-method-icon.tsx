import Image from "next/image"
import { CreditCard, Building2 } from "lucide-react"
import { useTheme } from "next-themes"

interface PaymentMethodIconProps {
  type: string
  className?: string
  style?: {}
}

export function PaymentMethodIcon({ type, className = "h-5 w-5", style= {} }: PaymentMethodIconProps) {
  const { theme } = useTheme()
  const normalizedType = type?.toLowerCase() || ""

  // VISA
  if (normalizedType.includes("visa")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
        alt="Visa"
        width={32}
        height={32}
        className={className}
        style={style}
      />
    )
  }

  // Mastercard
  if (normalizedType.includes("mastercard") || normalizedType.includes("master card")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
        alt="Mastercard"
        width={32}
        height={32}
        className={className}
        style={style}
      />
    )
  }

  // AMEX
  if (normalizedType.includes("amex") || normalizedType.includes("american express")) {
    return (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg"
        alt="American Express"
        width={32}
        height={32}
        className={className}
        style={style}
      />
    )
  }

  // PayTo
  if (normalizedType.includes("payto")) {
    const payToSrc = theme === "dark" 
      ? "/PayTo_symbol-White-WEB.png" 
      : "/PayTo_symbol-Black-WEB.png"
    return (
      <Image
        src={payToSrc}
        alt="PayTo"
        width={48}
        height={32}
        className={className}
        style={style}
      />
    )
  }

  // Generic bank icon for bank transfers or other bank-related methods
  if (normalizedType.includes("bank") || normalizedType.includes("transfer") || normalizedType.includes("bpay")) {
    return <Building2 className={className} />
  }

  // Default credit card icon
  return <CreditCard className={className} />
}
