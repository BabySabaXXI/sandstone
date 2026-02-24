/**
 * Language Switcher Component
 * 
 * Provides a dropdown menu for switching between supported languages.
 * Updates the URL and sets the locale cookie.
 */

'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, localeLabels, localeFlags, type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Check, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost' | 'minimal';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  align?: 'start' | 'center' | 'end';
}

export function LanguageSwitcher({
  variant = 'ghost',
  size = 'sm',
  className,
  showLabel = true,
  align = 'end',
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      setOpen(false);
    });
  };

  // Minimal variant just shows the flag button
  if (variant === 'minimal') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9', className)}
            disabled={isPending}
            aria-label={`Current language: ${localeLabels[locale]}. Click to change language.`}
          >
            <span className="text-lg" role="img" aria-hidden="true">
              {localeFlags[locale]}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="min-w-[160px]">
          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                loc === locale && 'bg-accent'
              )}
            >
              <span className="text-lg" role="img" aria-hidden="true">
                {localeFlags[loc]}
              </span>
              <span className="flex-1">{localeLabels[loc]}</span>
              {loc === locale && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'flex items-center gap-2',
            size === 'icon' && 'h-9 w-9',
            className
          )}
          disabled={isPending}
          aria-label={`Current language: ${localeLabels[locale]}. Click to change language.`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          {showLabel && size !== 'icon' && (
            <>
              <span className="hidden sm:inline">{localeLabels[locale]}</span>
              <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[200px]">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'flex items-center gap-3 cursor-pointer',
              loc === locale && 'bg-accent'
            )}
            disabled={isPending}
          >
            <span className="text-lg" role="img" aria-hidden="true">
              {localeFlags[loc]}
            </span>
            <span className="flex-1">{localeLabels[loc]}</span>
            {loc === locale && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/navigation
export function LanguageSwitcherCompact({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={loc === locale ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleLocaleChange(loc)}
          disabled={isPending}
          aria-label={`Switch to ${localeLabels[loc]}`}
          aria-pressed={loc === locale}
        >
          <span className="text-sm" role="img" aria-hidden="true">
            {localeFlags[loc]}
          </span>
        </Button>
      ))}
    </div>
  );
}

// Inline version for settings pages
export function LanguageSwitcherInline({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className={cn('grid grid-cols-1 gap-2', className)}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          disabled={isPending}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
            loc === locale
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-accent',
            isPending && 'opacity-50 cursor-not-allowed'
          )}
          aria-pressed={loc === locale}
        >
          <span className="text-2xl" role="img" aria-hidden="true">
            {localeFlags[loc]}
          </span>
          <div className="flex-1">
            <p className="font-medium">{localeLabels[loc]}</p>
            <p className="text-sm text-muted-foreground">
              {loc === locale ? 'Currently selected' : 'Click to select'}
            </p>
          </div>
          {loc === locale && <Check className="h-5 w-5 text-primary" />}
        </button>
      ))}
    </div>
  );
}
