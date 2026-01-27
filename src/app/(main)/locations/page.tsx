import { getBranches } from "@/lib/content/get-branches";
import { getSiteSettings } from "@/lib/content/get-settings";
import LocationsClient from "@/components/main/locations/LocationsClient";

export default async function LocationsPage() {
    const [branches, settings] = await Promise.all([
        getBranches(),
        getSiteSettings()
    ]);

    return (
        <LocationsClient
            initialBranches={branches}
            settings={settings}
        />
    );
}