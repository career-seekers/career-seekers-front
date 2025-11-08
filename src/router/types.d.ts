import type { RouteRecordRaw } from 'vue-router';

export const setPrefix = (routes: RouteRecordRaw[], prefix: string): RouteRecordRaw[] => {
  return routes.map(item => ({
    ...item,
    name: item.name ? `${prefix}-${String(item.name)}` : `${prefix}-layout`,
    children: item.children?.map(child => ({
      ...child,
      name: child.name ? `${prefix}-${String(child.name)}` : `${prefix}-${child.path}`,
    }))
  }));
};