"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold text-xl">InterviewAI</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Home
        </Link>
        <Link
          href="/interviews"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/interviews" || pathname.startsWith("/interview/") ? "text-primary" : "text-muted-foreground",
          )}
        >
          Interviews
        </Link>
        <Link
          href="/interview/setup"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/interview/setup" ? "text-primary" : "text-muted-foreground",
          )}
        >
          New Interview
        </Link>
      </nav>
    </div>
  )
}
