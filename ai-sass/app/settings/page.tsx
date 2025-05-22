"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const router = useRouter();

  return (
    <div className="px-4 lg:px-8 py-6">
      <Heading
        title="Settings"
        description="Manage your account and preferences"
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-200"
      />

      <div className="mt-8 space-y-6">
        {/* === Pro Section === */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Pro Features</h2>
          <p className="text-sm text-gray-600 mt-1">
            Unlock premium features including AI music generation and more.
          </p>
          <Button className="mt-4" onClick={() => router.push("/upgrade")}>
            Upgrade to Pro
          </Button>
        </section>

        {/* === Profile Section Placeholder === */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
          <p className="text-sm text-gray-600 mt-1">
            Coming soon: Manage your profile information here.
          </p>
        </section>

        {/* === Theme / Appearance Placeholder === */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Coming soon: Customize the look and feel of your app.
          </p>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;