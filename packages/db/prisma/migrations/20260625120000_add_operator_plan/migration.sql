-- AlterTable
ALTER TABLE "OperatorProfile" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planSince" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- Grandfather existing operators. Before tiers, every APPROVED operator showed a
-- verified badge. The badge is now gated on PRO, so without this step every
-- currently-verified operator would silently lose their badge on deploy. Put
-- already-approved operators on PRO so nobody loses status at launch. New
-- operators still default to FREE via the column default above.
UPDATE "OperatorProfile" SET "plan" = 'PRO', "planSince" = now() WHERE "status" = 'APPROVED';
