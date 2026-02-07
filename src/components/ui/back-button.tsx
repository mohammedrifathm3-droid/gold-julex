'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    className?: string
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    label?: string
}

export function BackButton({
    className,
    variant = 'ghost',
    size = 'sm',
    label = 'Back'
}: BackButtonProps) {
    const router = useRouter()

    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => router.back()}
            className={cn("flex items-center gap-1 hover:bg-gray-100", className)}
        >
            <ArrowLeft className="w-4 h-4" />
            {label && <span>{label}</span>}
        </Button>
    )
}
