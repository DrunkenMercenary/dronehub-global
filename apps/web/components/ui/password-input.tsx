"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Password field with a show/hide toggle. People mistype passwords constantly,
// especially on phones, and not being able to check what you typed is a common
// reason sign-up fails. The toggle is a real button so it is keyboard accessible.
//
// Written as a plain function component to match components/ui/input.tsx. React 19
// passes `ref` through as an ordinary prop, so forwardRef is not needed.
function PasswordInput({
    className,
    ...props
}: React.ComponentProps<"input">) {
    const [visible, setVisible] = React.useState(false)

    return (
        <div className="relative">
            <Input
                {...props}
                type={visible ? "text" : "password"}
                className={cn("pr-12", className)}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                title={visible ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5BC2E7] transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#5BC2E7]/50"
            >
                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    )
}

export { PasswordInput }
