import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage({ searchParams }) {
    const token = searchParams?.token ?? "";

    return <VerifyEmailClient token={token} />;
}
