'use server';

import { auth } from '@/auth';
import pool from '../db';

export interface Invoice {
  id: number;
  shop_name: string;
  invoice_number: string | null;
  total_amount: number;
  total_tax_amount: number | null;
  item_count: number;
  invoice_date: string | null;
  file_path: string;
  bucket_name: string;
  original_filename: string;
  created_at?: Date;
}

export async function getInvoices(): Promise<Invoice[]> {
  const session = await auth();
  const userEmail = session?.user?.email;

  // If no user, return empty list (or redirect)
  if (!userEmail) return [];
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM invoices WHERE user_email = $1 ORDER BY id DESC', [userEmail]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  } finally {
    client.release();
  }
}
