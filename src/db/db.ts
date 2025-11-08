import Dexie, { Table } from 'dexie';

export interface Item {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Vendor {
  id?: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface StockEntry {
  id?: number;
  itemId: number;
  itemName: string;
  vendorId: number;
  vendorName: string;
  purchasePrice: number;
  invoice: string;
  invoiceFile?: {
    name: string;
    type: string;
    data: string; // base64 encoded file
  };
  quantity: number;
  createdAt: Date;
}

export class StockDatabase extends Dexie {
  items!: Table<Item>;
  vendors!: Table<Vendor>;
  stockEntries!: Table<StockEntry>;

  constructor() {
    super('StockKeeperDB');
    this.version(1).stores({
      items: '++id, name, createdAt',
      stockEntries: '++id, itemId, itemName, invoice, createdAt',
    });
    this.version(2).stores({
      items: '++id, name, createdAt',
      vendors: '++id, name, createdAt',
      stockEntries: '++id, itemId, itemName, vendorId, vendorName, invoice, createdAt',
    });
  }
}

export const db = new StockDatabase();
