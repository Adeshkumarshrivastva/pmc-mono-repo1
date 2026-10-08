import { promises as fs } from "fs";
import path from "path";
import type { PackageId } from "./catalog";
import type { EnquiryTypeId } from "./customer";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "records.json");

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
}

export interface OrderItem {
  packageId: PackageId;
  name: string;
  price: number;
}

export interface CheckInRecord {
  answers: string;
  overallPercent: number;
  createdAt: string;
}

export type OrderStatus = "paid" | "created" | "failed";

export interface OrderRecord {
  id: string;
  receipt: string;
  status: OrderStatus;
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  createdAt: string;
  contacted: boolean;
  checkIns: CheckInRecord[];
  paymentId?: string;
  method?: string;
  failureReason?: string;
  couponCode?: string;
  source?: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  city: string;
  phone: string;
  email?: string;
  type: EnquiryTypeId;
  organisation?: string;
  reference?: string;
  band?: string;
  message?: string;
  contacted: boolean;
  createdAt: string;
}

export interface Store {
  orders: OrderRecord[];
  enquiries: EnquiryRecord[];
}

const EMPTY_STORE: Store = { orders: [], enquiries: [] };

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY_STORE, null, 2), "utf-8");
  }
}

export async function readStore(): Promise<Store> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Partial<Store>;
  return { orders: parsed.orders ?? [], enquiries: parsed.enquiries ?? [] };
}

async function writeStore(store: Store): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function createOrder(order: OrderRecord): Promise<void> {
  const store = await readStore();
  store.orders.push(order);
  await writeStore(store);
}

export async function updateOrder(id: string, updates: Partial<OrderRecord>): Promise<OrderRecord | null> {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) return null;
  Object.assign(order, updates);
  await writeStore(store);
  return order;
}

export async function addEnquiry(enquiry: EnquiryRecord): Promise<void> {
  const store = await readStore();
  store.enquiries.push(enquiry);
  await writeStore(store);
}

export async function toggleContacted(kind: "order" | "enquiry", id: string, contacted: boolean): Promise<void> {
  const store = await readStore();
  if (kind === "order") {
    const order = store.orders.find((item) => item.id === id);
    if (order) order.contacted = contacted;
  } else {
    const enquiry = store.enquiries.find((item) => item.id === id);
    if (enquiry) enquiry.contacted = contacted;
  }
  await writeStore(store);
}
