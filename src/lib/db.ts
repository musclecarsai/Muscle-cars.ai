export interface User {
  id: string;
  email: string;
  tier: 'starter' | 'enthusiast' | 'entrepreneur' | 'professional' | 'dealership';
  valuation_count: number;
  guide_count: number;
  listing_count: number;
  referral_code: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referred_email: string;
  status: 'pending' | 'completed';
  reward_type: string | null;
  created_at: string;
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

export interface Meet {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  location: string;
  date: string;
  is_featured: number;
  created_at: string;
  organizer_email?: string;
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

export async function incrementGuide(userId: string, guideTitle: string): Promise<void> {
  await teamDb(`UPDATE users SET guide_count = guide_count + 1 WHERE id = '${userId}'`);
  const filename = guideTitle.toLowerCase().replace(/ /g, '-').replace(/[^a-z-]/g, '') + '.pdf';
  await addAsset(userId, guideTitle, 'ebook', `/downloads/${filename}`);
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

export async function getMeets(): Promise<Meet[]> {
  return teamDb("SELECT m.*, u.email as organizer_email FROM meets m JOIN users u ON m.organizer_id = u.id ORDER BY m.is_featured DESC, m.date ASC");
}

export async function createMeet(organizerId: string, title: string, description: string, location: string, date: string): Promise<void> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO meets (id, organizer_id, title, description, location, date) VALUES ('${id}', '${organizerId}', '${title.replace(/'/g, "''")}', '${description.replace(/'/g, "''")}', '${location.replace(/'/g, "''")}', '${date}')`);
}

export async function featureMeet(userId: string, meetId: string): Promise<void> {
  // First log the transaction
  await logTransaction(userId, 'micro-transaction', `featured-meet-${meetId}`, 4900);
  // Then feature the meet
  await teamDb(`UPDATE meets SET is_featured = 1 WHERE id = '${meetId}'`);
}

export async function getReferrals(userId: string): Promise<Referral[]> {
  return teamDb(`SELECT * FROM referrals WHERE referrer_id = '${userId}' ORDER BY created_at DESC`);
}

export async function createReferral(referrerId: string, email: string): Promise<void> {
  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO referrals (id, referrer_id, referred_email) VALUES ('${id}', '${referrerId}', '${email}')`);
}

export async function getUserByReferralCode(code: string): Promise<User | null> {
  const users = await teamDb(`SELECT * FROM users WHERE referral_code = '${code}'`);
  return users.length > 0 ? users[0] : null;
}

export async function completeReferral(referralId: string, referredUserId: string, rewardType: string): Promise<void> {
  await teamDb(`UPDATE referrals SET referred_user_id = '${referredUserId}', status = 'completed', reward_type = '${rewardType}' WHERE id = '${referralId}'`);
}

export async function generateReferralCode(userId: string, email: string): Promise<string> {
  const base = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
  const code = `${base}2026`;
  await teamDb(`UPDATE users SET referral_code = '${code}' WHERE id = '${userId}'`);
  return code;
}

/** Listing cap per tier — Starter=1, Enthusiast=5, Entrepreneur=25, Professional=unlimited */
export function getListingCap(tier: string): number {
  switch (tier) {
    case 'starter': return 1;
    case 'enthusiast': return 5;
    case 'entrepreneur': return 25;
    case 'professional': return Infinity;
    case 'dealership': return Infinity;
    default: return 1;
  }
}

/** Returns remaining listings allowed for a user */
export function getRemainingListings(user: User): number {
  const cap = getListingCap(user.tier);
  const used = user.listing_count || 0;
  return cap === Infinity ? Infinity : Math.max(0, cap - used);
}

/**
 * Calculate transaction fee for non-subscribers.
 * - Under $25k: 7.5%
 * - $25k-$75k: 5.5%
 * - $75k+: 4.5%
 * Subscribers (any paid tier) pay 0%.
 */
export function calcTransactionFee(price: number, tier: string): { rate: number; fee: number; feeDisplay: string } {
  if (tier !== 'starter') return { rate: 0, fee: 0, feeDisplay: '$0' };

  let rate: number;
  if (price < 25000) rate = 0.075;
  else if (price <= 75000) rate = 0.055;
  else rate = 0.045;

  const fee = Math.round(price * rate);
  const feeDisplay = `$${fee.toLocaleString()}`;
  return { rate, fee, feeDisplay };
}

export async function addCar(ownerId: string, make: string, model: string, year: number, price: number, mileage: number, description: string): Promise<{ success: boolean; error?: string }> {
  // Check listing cap
  const userRows = await teamDb(`SELECT * FROM users WHERE id = '${ownerId}'`);
  if (userRows.length === 0) return { success: false, error: 'User not found' };
  const user = userRows[0] as User;
  const cap = getListingCap(user.tier);
  const currentCount = user.listing_count || 0;
  if (currentCount >= cap) {
    return { success: false, error: `Listing cap reached. Your ${user.tier} tier allows ${cap === Infinity ? 'unlimited' : cap} listings. Upgrade to list more.` };
  }

  const { randomUUID } = await import("node:crypto");
  const id = randomUUID();
  await teamDb(`INSERT INTO cars (id, owner_id, make, model, year, price, mileage, description, status) VALUES ('${id}', '${ownerId}', '${make}', '${model}', ${year}, ${price}, ${mileage}, '${description.replace(/'/g, "''")}', 'available')`);
  
  // Increment listing count
  await teamDb(`UPDATE users SET listing_count = listing_count + 1 WHERE id = '${ownerId}'`);

  // Check if this user was referred and this is their first car
  const userCars = await getUserCars(ownerId);
  if (userCars.length === 1) {
    const user = await teamDb(`SELECT email FROM users WHERE id = '${ownerId}'`);
    if (user.length > 0) {
      const email = user[0].email;
      const referrals = await teamDb(`SELECT * FROM referrals WHERE referred_email = '${email}' AND status = 'pending'`);
      if (referrals.length > 0) {
        for (const ref of referrals) {
          await teamDb(`UPDATE referrals SET referred_user_id = '${ownerId}', status = 'completed', reward_type = 'valuation' WHERE id = '${ref.id}'`);
          // Reward the referrer: decrement their valuation count to give them one more free
          await teamDb(`UPDATE users SET valuation_count = valuation_count - 1 WHERE id = '${ref.referrer_id}'`);
          // Also reward the referred user
          await teamDb(`UPDATE users SET valuation_count = valuation_count - 1 WHERE id = '${ownerId}'`);
        }
      }
    }
  }

  return { success: true };
}
