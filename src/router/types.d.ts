import type { RouteRecordRaw } from 'vue-router';

export const setPrefix = (routes: RouteRecordRaw[], prefix: string): RouteRecordRaw[] => {
  return routes.map(item => ({
    ...item,
    children: item.children?.map(child => ({
      ...child,
      name: child.name ? `${prefix}-${String(child.name)}` : '',
    }))
  }));
};