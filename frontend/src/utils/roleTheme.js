export const roleThemes = {
  public: {
    accentBg: 'bg-[#b4f461]',
    accentHoverBg: 'hover:bg-[#9ae04d]',
    accentText: 'text-[#2d6a25]',
    accentBorder: 'border-[#b4f461]/30',
    accentSoftBg: 'bg-[#b4f461]/12',
    accentSoftText: 'text-[#1a1a2e]',
    accentRing: 'focus:ring-[#b4f461]/30 focus:border-[#b4f461]',
    hoverBorder: 'hover:border-[#b4f461]/40',
    shadow: 'shadow-[#b4f461]/20',
    pill: 'bg-[#b4f461]/20 text-[#1a1a2e]',
  },
  advocate: {
    accentBg: 'bg-orange-500',
    accentHoverBg: 'hover:bg-orange-600',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-500/30',
    accentSoftBg: 'bg-orange-500/10',
    accentSoftText: 'text-orange-700',
    accentRing: 'focus:ring-orange-500/30 focus:border-orange-500',
    hoverBorder: 'hover:border-orange-500/40',
    shadow: 'shadow-orange-500/20',
    pill: 'bg-orange-500/15 text-orange-700',
  },
  court: {
    accentBg: 'bg-red-500',
    accentHoverBg: 'hover:bg-red-600',
    accentText: 'text-red-600',
    accentBorder: 'border-red-500/30',
    accentSoftBg: 'bg-red-500/10',
    accentSoftText: 'text-red-700',
    accentRing: 'focus:ring-red-500/30 focus:border-red-500',
    hoverBorder: 'hover:border-red-500/40',
    shadow: 'shadow-red-500/20',
    pill: 'bg-red-500/15 text-red-700',
  },
};

export function getRoleTheme(role = 'public') {
  return roleThemes[role] || roleThemes.public;
}
