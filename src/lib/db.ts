export interface User {
  id: string;
  email: string;
  tier: 'starter' | 'enthusiast' | 'entrepreneur' | 'dealership';
  valuation_count: number;
  guide_count: number;
}

export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  description: string;
  status: 'available' | 'sold';
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
}

export interface Inspection {
  id: string;
  user_id: string;
  car_id: string | null;
  car_details: string | null;
  location: string;
  status: 'pending' | 'scheduled' | 'completed';
  created_at: string;
}

export async function teamDb(sql: string) {
  if (typeof window !== 'undefined') return [];
  const { execSync } = await import("node:child_process");
  try {
    const result = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`).toString();
    return JSON.parse(result);
  } catch (error) {
    console.error("team-db error:", error);
    return [];
  }
}

export async function getCars(): Promise<Car[]> {
  return teamDb("SELECT * FROM cars WHERE status = 'available'");
}

export async function getUserCars(userId: string): Promise<Car[]> {
  return teamDb(`SELECT * FROM cars WHERE owner_id = '${userId}'`);
}

export async function getUser(email: string): Promise<User | null> {
  const users = await teamDb(`SELECT * FROM users WHERE email = '${email}'`);
  return users.length > 0 ? users[0] : null;
}

export async function createUser(email: string): Promise<User> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO users (id, email) VALUES ('${id}', '${email}')`);
  return (await getUser(email))!;
}

export async function incrementValuation(userId: string): Promise<void> {
  await teamDb(`UPDATE users SET valuation_count = valuation_count + 1 WHERE id = '${userId}'`);
}

export async function incrementGuide(userId: string): Promise<void> {
  await teamDb(`UPDATE users SET guide_count = guide_count + 1 WHERE id = '${userId}'`);
}

export async function logTransaction(userId: string, type: string, itemId: string, amountCents: number): Promise<void> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO transactions (id, user_id, type, item_id, amount_cents) VALUES ('${id}', '${userId}', '${type}', '${itemId}', ${amountCents})`);
}

export async function getAssets(userId: string): Promise<Asset[]> {
  return teamDb(`SELECT * FROM assets WHERE user_id = '${userId}' ORDER BY created_at DESC`);
}

export async function addAsset(userId: string, name: string, type: string, url: string): Promise<void> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO assets (id, user_id, name, type, url) VALUES ('${id}', '${userId}', '${name}', '${type}', '${url}')`);
}

export async function createInspection(userId: string, location: string, carId?: string, carDetails?: string): Promise<void> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO inspections (id, user_id, car_id, car_details, location) VALUES ('${id}', '${userId}', ${carId ? `'${carId}'` : 'NULL'}, ${carDetails ? `'${carDetails}'` : 'NULL'}, '${location}')`);
}

export async function getInspections(userId: string): Promise<Inspection[]> {
  return teamDb(`SELECT * FROM inspections WHERE user_id = '${userId}' ORDER BY created_at DESC`);
}
