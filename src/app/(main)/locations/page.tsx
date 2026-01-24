import { getBranches } from "@/lib/get-branches";
import LocationsClient from "@/components/main/locations/LocationsClient";

export default async function LocationsPage() {
    const branches = await getBranches();

    return <LocationsClient initialBranches={branches} />;
}