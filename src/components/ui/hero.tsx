"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Link compatibility for standard React / Vite environments
const Link = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ href, children, ...props }, ref) => {
    return (
      <a href={href} ref={ref} {...props}>
        {children}
      </a>
    )
  }
)
Link.displayName = "Link"

export interface HeroAction {
  label: string
  href: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  onClick?: (e: React.MouseEvent) => void
}

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  gradient?: boolean
  blur?: boolean
  badge?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: HeroAction[]
  titleClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      gradient = false,
      blur = false,
      badge,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative z-0 flex w-full flex-col items-center justify-center bg-transparent py-12 sm:py-16 px-4 sm:px-8 text-center",
          className,
        )}
        {...props}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          viewport={{ once: true }}
          transition={{ ease: "easeInOut", delay: 0.1, duration: 0.6 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="relative z-10 flex w-full flex-col items-center justify-center text-center"
        >
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-zinc-300 font-medium tracking-wide shadow-sm">
                {badge}
              </div>
            )}

            <h1
              className={cn(
                "text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]",
                titleClassName,
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={cn(
                  "text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mx-auto",
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}

            {actions && actions.length > 0 && (
              <div className={cn("flex items-center justify-center pt-3", actionsClassName)}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size="lg"
                    className="h-11 px-7 text-sm sm:text-base font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
                    asChild
                  >
                    <Link href={action.href} onClick={action.onClick}>
                      <span>{action.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </section>
    )
  },
)
Hero.displayName = "Hero"

export { Hero }
