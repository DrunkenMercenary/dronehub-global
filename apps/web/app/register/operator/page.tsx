
import { OnboardingForm } from "@/components/operator/OnboardingForm"

export default function OperatorRegisterPage() {
    return (
        <div className="container max-w-2xl py-10">
            <div className="mb-8 space-y-2 text-center">
                <h1 className="text-3xl font-bold">Join as a Pilot</h1>
                <p className="text-muted-foreground">
                    Create your profile to start receiving job opportunities.
                </p>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <OnboardingForm />
            </div>
        </div>
    )
}
