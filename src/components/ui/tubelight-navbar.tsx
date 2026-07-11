"use client"

import React, { useState } from "react"
import { m } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab?: string
  onTabChange?: (name: string) => void
  cta?: React.ReactNode
}

export function NavBar({ items, className, activeTab: controlledActiveTab, onTabChange, cta }: NavBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0].name)

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab
  const setActiveTab = (name: string) => {
    if (onTabChange) {
      onTabChange(name)
    } else {
      setInternalActiveTab(name)
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-3 bg-[--background]/60 border border-[--border] backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        <div className="flex items-center gap-1 sm:gap-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={(e) => {
                  setActiveTab(item.name)
                  if (item.onClick) {
                    item.onClick(e)
                  }
                }}
                className={cn(
                  "relative cursor-pointer text-xs font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors",
                  "text-[--foreground-muted] hover:text-[--primary]",
                  isActive && "text-[--primary]",
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={16} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <m.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-[--primary]/5 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring" as const,
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[--primary] rounded-t-full">
                      <div className="absolute w-12 h-6 bg-[--primary]/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-[--primary]/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-[--primary]/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </m.div>
                )}
              </Link>
            )
          })}
        </div>
        {cta && (
          <div className="pl-1 sm:pl-2 pr-1 sm:pr-1.5 border-l border-[--border]/40 flex items-center">
            {cta}
          </div>
        )}
      </div>
    </div>
  )
}
