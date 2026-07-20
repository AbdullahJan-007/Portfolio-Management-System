import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: Pick<
  IconProps,
  "viewBox" | "fill" | "stroke" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin"
> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconLogo(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 9l-3 3 3 3" />
      <path d="M16 9l3 3-3 3" />
      <path d="M13.5 5.5l-3 13" />
    </svg>
  );
}

export function IconProfile(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
      <path d="M6 21v-1a6 6 0 0112 0v1" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  );
}

export function IconSkills(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 9l-3 3 3 3" />
      <path d="M16 9l3 3-3 3" />
      <path d="M14 5.5l-4 13" />
    </svg>
  );
}

export function IconProjects(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7.5V18a2 2 0 002 2h14a2 2 0 002-2V7.5" />
      <path d="M3 7.5L12 3l9 4.5" />
      <path d="M12 12v7" />
      <path d="M9 14.5l3 3 3-3" />
    </svg>
  );
}

export function IconCategories(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

export function IconPreview(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M2 8h20" />
      <path d="M6 4V2M18 4V2" />
      <circle cx="12" cy="13" r="2.5" />
    </svg>
  );
}

export function IconDashboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconTerminal(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8h18" />
      <path d="M7 12l2 2 4-4" />
      <path d="M13 16h4" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5" />
      <path d="M9.5 17a2.5 2.5 0 005 0" />
    </svg>
  );
}

export function IconSuccess(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3L2.5 19h19L12 3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconInfo(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle cx="12" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconFolderCode(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7.5V18a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6.5L11 5H5a2 2 0 00-2 2v.5" />
      <path d="M10 13l-2 2 2 2" />
      <path d="M14 17h4" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconGithub(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M12 2C6.477 2 2 6.484 2 12.02c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.34-.012 2.421-.012 2.751 0 .268.18.58.688.481A10.02 10.02 0 0022 12.02C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function IconLinkedin(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M6.94 8.5a1.94 1.94 0 100-3.88 1.94 1.94 0 000 3.88zM5.25 10.25h3.38V19H5.25v-8.75zM11.25 10.25h3.24v1.196h.046c.452-.83 1.556-1.705 3.202-1.705 3.424 0 4.057 2.13 4.057 4.9V19h-3.38v-4.487c0-1.07-.02-2.447-1.49-2.447-1.49 0-1.719 1.163-1.719 2.366V19h-3.38v-8.75z" />
    </svg>
  );
}

export function IconTwitter(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
      <path d="M19 15l.8 2.4L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.6L19 15z" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconZap(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M13 2L4.5 13.5H11l-1.5 8.5L20 10h-6.5L13 2z" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17.5l9 5 9-5" />
    </svg>
  );
}

export function IconExternalLink(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4L10 14" />
      <path d="M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5" />
    </svg>
  );
}

export type IconName =
  | "logo"
  | "profile"
  | "skills"
  | "projects"
  | "categories"
  | "preview"
  | "dashboard"
  | "terminal"
  | "search"
  | "bell"
  | "success"
  | "warning"
  | "info"
  | "folder-code"
  | "arrow-right"
  | "github"
  | "linkedin"
  | "twitter"
  | "mail"
  | "phone"
  | "map-pin"
  | "globe"
  | "sparkle"
  | "check"
  | "shield"
  | "zap"
  | "layers"
  | "external-link";

const iconMap = {
  logo: IconLogo,
  profile: IconProfile,
  skills: IconSkills,
  projects: IconProjects,
  categories: IconCategories,
  preview: IconPreview,
  dashboard: IconDashboard,
  terminal: IconTerminal,
  search: IconSearch,
  bell: IconBell,
  success: IconSuccess,
  warning: IconWarning,
  info: IconInfo,
  "folder-code": IconFolderCode,
  "arrow-right": IconArrowRight,
  github: IconGithub,
  linkedin: IconLinkedin,
  twitter: IconTwitter,
  mail: IconMail,
  phone: IconPhone,
  "map-pin": IconMapPin,
  globe: IconGlobe,
  sparkle: IconSparkle,
  check: IconCheck,
  shield: IconShield,
  zap: IconZap,
  layers: IconLayers,
  "external-link": IconExternalLink,
} as const;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Component = iconMap[name];
  return <Component className={className} aria-hidden="true" />;
}

const boxStyles: Record<
  string,
  { box: string; icon: string }
> = {
  brand: {
    box: "bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm shadow-brand-500/25",
    icon: "text-white",
  },
  blue: {
    box: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/20",
    icon: "text-white",
  },
  violet: {
    box: "bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/20",
    icon: "text-white",
  },
  emerald: {
    box: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/20",
    icon: "text-white",
  },
  amber: {
    box: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm shadow-amber-500/20",
    icon: "text-white",
  },
  slate: {
    box: "bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200/80",
    icon: "text-slate-600",
  },
  soft: {
    box: "bg-brand-50 ring-1 ring-brand-100",
    icon: "text-brand-600",
  },
  cyan: {
    box: "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm shadow-cyan-500/20",
    icon: "text-white",
  },
  rose: {
    box: "bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm shadow-rose-500/20",
    icon: "text-white",
  },
};

const boxSizes = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
  "2xl": { box: "h-20 w-20 rounded-2xl", icon: "h-10 w-10" },
};

export function IconBox({
  name,
  size = "md",
  variant = "brand",
  className = "",
}: {
  name: IconName;
  size?: keyof typeof boxSizes;
  variant?: keyof typeof boxStyles;
  className?: string;
}) {
  const styles = boxStyles[variant];
  const sizes = boxSizes[size];

  return (
    <div
      className={`grid shrink-0 place-items-center ${sizes.box} ${styles.box} ${className}`}
    >
      <Icon name={name} className={`${sizes.icon} ${styles.icon}`} />
    </div>
  );
}

export function BrandLogo({
  showText = true,
  className = "",
}: {
  showText?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-bold text-slate-900 ${className}`}>
      <IconBox name="logo" size="md" variant="brand" />
      {showText && <span>Portfolio Manager</span>}
    </span>
  );
}

export function ActivityIcon({
  type,
}: {
  type: "project" | "skill" | "profile";
}) {
  const map = {
    project: "projects" as const,
    skill: "skills" as const,
    profile: "profile" as const,
  };
  const variant = {
    project: "violet",
    skill: "blue",
    profile: "emerald",
  } as const;

  return <IconBox name={map[type]} size="sm" variant={variant[type]} />;
}

export function NotificationIcon({
  type,
}: {
  type: "info" | "warning" | "success";
}) {
  const map = {
    info: { name: "info" as const, variant: "blue" as const },
    warning: { name: "warning" as const, variant: "amber" as const },
    success: { name: "success" as const, variant: "emerald" as const },
  };
  const config = map[type];
  return <IconBox name={config.name} size="sm" variant={config.variant} />;
}
