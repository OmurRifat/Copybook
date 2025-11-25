"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            router.push('/feed');
        } else {
            router.push('/login');
        }
    }, [session]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8">Welcome to Copybook</h1>
                <div className="space-x-4">
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-block"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
}
