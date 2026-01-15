import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage({ searchParams }) {
    const token = searchParams?.token ?? "";

    return <VerifyEmailClient token={token} />;
}
