'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const branchSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email("Invalid email").max(100).optional().or(z.literal('')),
  hours: z.string().max(200).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  hasAtm: z.boolean().optional(),
  hasDriveThru: z.boolean().optional(),
  hasNotary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function createBranch(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }
const rawData = {
  name: formData.get("name") as string,
  address: formData.get("address") as string,
  city: formData.get("city") as string,
  phone: formData.get("phone") as string,
  email: formData.get("email") as string,
  hours: formData.get("hours") as string,
  lat: formData.get("lat") as string,
  lng: formData.get("lng") as string,
  hasAtm: formData.get("hasAtm") === "on",
  hasDriveThru: formData.get("hasDriveThru") === "on",
  hasNotary: formData.get("hasNotary") === "on",
};

const validated = branchSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  name: rawName, address: rawAddr, city: rawCity, phone, email, hours,
  lat, lng, hasAtm, hasDriveThru, hasNotary
} = validated.data;

const name = sanitize(rawName);
const address = sanitize(rawAddr);
const city = sanitize(rawCity);
const safePhone = phone ?? "";

    try {
        await db.branch.create({
            data: { name, address, city, phone: safePhone, email, hours, lat, lng, hasAtm, hasDriveThru, hasNotary, isActive: true }
        });

        await logAdminAction(
            "CREATE_BRANCH",
            "NEW_BRANCH",
            {
                name,
                city,
                action: "Created Branch Location",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch added successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create branch" };
    }
}

export async function updateBranch(id: string, formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

const rawData = {
  name: formData.get("name") as string,
  address: formData.get("address") as string,
  city: formData.get("city") as string,
  phone: formData.get("phone") as string,
  email: formData.get("email") as string,
  hours: formData.get("hours") as string,
  lat: formData.get("lat") as string,
  lng: formData.get("lng") as string,
  hasAtm: formData.get("hasAtm") === "on",
  hasDriveThru: formData.get("hasDriveThru") === "on",
  hasNotary: formData.get("hasNotary") === "on",
  isActive: formData.get("isActive") === "on",
};

const validated = branchSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  name: rawName, address: rawAddr, city: rawCity, phone, email, hours,
  lat, lng, hasAtm, hasDriveThru, hasNotary, isActive
} = validated.data;

const name = sanitize(rawName);
const address = sanitize(rawAddr);
const city = sanitize(rawCity);

    try {
        await db.branch.update({
            where: { id },
            data: { name, address, city, phone, email, hours, lat, lng, isActive, hasAtm, hasDriveThru, hasNotary }
        });

        await logAdminAction(
            "UPDATE_BRANCH",
            id,
            {
                name,
                action: "Updated Branch Details",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update branch" };
    }
}

export async function deleteBranch(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        const branch = await db.branch.findUnique({ where: { id } });

        await db.branch.delete({ where: { id } });

        await logAdminAction(
            "DELETE_BRANCH",
            id,
            {
                name: branch?.name || "Unknown",
                action: "Deleted Branch Location",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete branch" };
    }
}

export async function toggleBranchStatus(id: string, currentStatus: boolean) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.branch.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        await logAdminAction(
            "TOGGLE_BRANCH_STATUS",
            id,
            {
                action: "Toggled Branch Status",
                newStatus: !currentStatus ? "Active" : "Inactive",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Status updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update branch status" };
    }
}

export async function getGeocodeAction(address: string) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'ModernBankAdmin/1.0 (contact@yourdomain.com)'
                },
                // next: { revalidate: 86400 }
            }
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                success: true,
                lat: data[0].lat,
                lng: data[0].lon
            };
        }

        return { success: false, message: "No coordinates found for this address." };
    } catch (error) {
        console.error('Geocoding Error:', error);
        return { success: false, message: "Failed to connect to geocoding service." };
    }
}