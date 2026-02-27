import type { LucideIcon } from 'lucide-react';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: string;
  onClick?: () => void;
};

export type AppRole = 'student' | 'teacher' | 'admin';
