import { LegalPage } from "@/components/shared/LegalPage"
export default function TermsPage() {
    return <LegalPage title="Terms of Service" updated="June 2026" sections={[
        { h: "1. Overview", p: "DroneHub is a marketplace that connects customers seeking drone services with independent drone operators. We provide the platform; the contract for any work is between the customer and the operator." },
        { h: "2. Accounts", p: "You must provide accurate information and keep your credentials secure. Operators must be approved and keep their licences and insurance current. You are responsible for activity under your account." },
        { h: "3. Jobs and proposals", p: "Customers post jobs and award proposals at their discretion. Operators are responsible for assessing each job, quoting fairly, and complying with all applicable aviation and privacy laws." },
        { h: "4. Conduct", p: "You agree not to misuse the platform, post unlawful content, circumvent fees, or harass other users. We may suspend accounts that breach these terms." },
        { h: "5. Payments", p: "Until in-platform payments launch, customers and operators arrange payment between themselves. When payments launch, additional terms and service fees will apply." },
        { h: "6. Liability", p: "The platform is provided as is. To the extent permitted by law, DroneHub is not liable for the performance, safety, or legality of any operator's work." },
        { h: "7. Changes", p: "We may update these terms. Continued use after changes means you accept the updated terms." },
    ]} />
}
