import Dexie, { Table } from 'dexie';

export interface Item {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface StockEntry {
  id?: number;
  itemId: number;
  itemName: string;
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
  stockEntries!: Table<StockEntry>;

  constructor() {
    super('StockKeeperDB');
    this.version(1).stores({
      items: '++id, name, createdAt',
      stockEntries: '++id, itemId, itemName, invoice, createdAt',
    });
  }
}

export const db = new StockDatabase();
