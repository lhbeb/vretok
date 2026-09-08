"use client";

import AdminLayout from '@/components/AdminLayout';

export default function MailProjectPage() {
    if (!process.env.NEXT_PUBLIC_MAIL_PROJECT_URL) return <AdminLayout title="Vretok Mail"><p>Configure NEXT_PUBLIC_MAIL_PROJECT_URL to connect this brand’s email dashboard.</p></AdminLayout>;
    return (
        <AdminLayout title="Mail Project">
            {/* Full-bleed iframe — negative margins cancel AdminLayout's padding */}
            <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mb-8" style={{ height: 'calc(100vh - 120px)' }}>
                <iframe
                    src={process.env.NEXT_PUBLIC_MAIL_PROJECT_URL}
                    title="Mail Project"
                    className="w-full h-full border-0"
                    allow="clipboard-read; clipboard-write"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                />
            </div>
        </AdminLayout>
    );
}
