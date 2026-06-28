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
  | "folder-code";

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
