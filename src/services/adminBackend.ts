import { backendService } from './backendService';
import { TableInsert, TableName, TableUpdate } from '../lib/database.types';

export const adminBackend = {
  listCategories: () => backendService.list('categories', 'sort_order'),
  saveCategory: (id: string | null, values: TableInsert<'categories'> | TableUpdate<'categories'>) =>
    id ? backendService.update('categories', id, values) : backendService.create('categories', values as TableInsert<'categories'>),
  deleteCategory: (id: string) => backendService.remove('categories', id),

  listCountries: () => backendService.list('countries', 'name_en'),
  saveCountry: (id: string | null, values: TableInsert<'countries'> | TableUpdate<'countries'>) =>
    id ? backendService.update('countries', id, values) : backendService.create('countries', values as TableInsert<'countries'>),

  listTranslations: () => backendService.list('translations', 'updated_at'),
  saveTranslation: (id: string | null, values: TableInsert<'translations'> | TableUpdate<'translations'>) =>
    id ? backendService.update('translations', id, values) : backendService.create('translations', values as TableInsert<'translations'>),

  listUsers: () => backendService.list('users', 'created_at'),
  updateUser: (id: string, values: TableUpdate<'users'>) => backendService.update('users', id, values),

  listOrders: () => backendService.list('orders', 'created_at'),
  updateOrder: (id: string, values: TableUpdate<'orders'>) => backendService.update('orders', id, values),

  list<T extends TableName>(table: T, orderBy?: string) {
    return backendService.list(table, orderBy);
  },
};
