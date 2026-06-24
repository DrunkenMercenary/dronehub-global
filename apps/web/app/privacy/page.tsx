import { LegalPage } from "@/components/shared/LegalPage"
export default function PrivacyPage() {
    return <LegalPage title="Privacy Policy" updated="June 2026" sections={[
        { h: "1. What we collect", p: "Account details (name, email), profile information you provide, documents you upload for verification, job and message content, and basic usage data." },
        { h: "2. How we use it", p: "To operate the marketplace: matching jobs to operators, enabling messaging, verifying operators, displaying public profiles and reviews, and improving the service." },
        { h: "3. Sharing", p: "Public profile information and reviews are visible to other users. We do not sell your personal data. We use service providers (hosting, storage) under appropriate safeguards." },
        { h: "4. Documents", p: "Verification documents are used to review operators and are accessible to our admin team. Store only what is necessary for verification." },
        { h: "5. Your choices", p: "You can update your profile, request a copy of your data, or ask us to delete your account, subject to legal retention requirements." },
        { h: "6. Contact", p: "For privacy questions, contact us through the contact page. We will respond within a reasonable time." },
    ]} />
}
