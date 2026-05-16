import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting System Seed...")

    const password = await bcrypt.hash("demo123", 10)
    const adminPassword = await bcrypt.hash("admin123", 10)

    // 1. Admin
    const adminUser = await prisma.user.upsert({
        where: { email: "commander@dronehub.global" },
        update: {},
        create: {
            email: "commander@dronehub.global",
            password: adminPassword,
            role: "ADMIN",
        }
    })
    console.log("✅ Admin Created")

    // 2. Clients
    const client1 = await prisma.user.upsert({
        where: { email: "realestate@example.com" },
        update: {},
        create: {
            email: "realestate@example.com",
            password,
            role: "CLIENT",
            clientProfile: {
                create: { name: "Empire Realty" }
            }
        },
        include: { clientProfile: true }
    })

    const client2 = await prisma.user.upsert({
        where: { email: "solar@example.com" },
        update: {},
        create: {
            email: "solar@example.com",
            password,
            role: "CLIENT",
            clientProfile: {
                create: { name: "SunGrid Solar" }
            }
        },
        include: { clientProfile: true }
    })
    console.log("✅ Clients Created")

    // 3. Operators
    const op1 = await prisma.user.upsert({
        where: { email: "pilot@dronehub.global" },
        update: {},
        create: {
            email: "pilot@dronehub.global",
            password,
            role: "OPERATOR",
            operatorProfile: {
                create: {
                    name: "Alpha Flight",
                    description: "High-end cinematic and structural specialists.",
                    status: "APPROVED",
                    services: "Cinematography,Mapping,Inspection",
                    radius: 100,
                    lat: 40.7128,
                    lng: -74.0060
                }
            }
        },
        include: { operatorProfile: true }
    })

    const op2 = await prisma.user.upsert({
        where: { email: "mapping_guru@example.com" },
        update: {},
        create: {
            email: "mapping_guru@example.com",
            password,
            role: "OPERATOR",
            operatorProfile: {
                create: {
                    name: "GeoPulse Aerial",
                    description: "Precision mapping and LiDAR surveys.",
                    status: "APPROVED",
                    services: "Mapping,Surveying",
                    radius: 250,
                    lat: 34.0522,
                    lng: -118.2437
                }
            }
        },
        include: { operatorProfile: true }
    })

    const op3 = await prisma.user.upsert({
        where: { email: "newbie@example.com" },
        update: {},
        create: {
            email: "newbie@example.com",
            password,
            role: "OPERATOR",
            operatorProfile: {
                create: {
                    name: "Fresh Skies",
                    description: "Entry-level pilot looking for real estate experience.",
                    status: "PENDING",
                    services: "Real Estate",
                    radius: 50,
                    lat: 25.7617,
                    lng: -80.1918
                }
            }
        },
        include: { operatorProfile: true }
    })
    console.log("✅ Operators Created (Approved & Pending)")

    // 4. Jobs
    const job1 = await prisma.jobRequest.create({
        data: {
            title: "Solar Farm Inspection",
            description: "Thermal scan of 500 panels to identify hotspots and micro-cracks.",
            category: "Inspection",
            location: "Phoenix, AZ",
            clientId: client2.clientProfile!.id,
            status: "OPEN"
        }
    })

    const job2 = await prisma.jobRequest.create({
        data: {
            title: "Hollywood Hills Luxury Promo",
            description: "FPV Flythrough and cinematic exteriors for a $15M listing.",
            category: "Cinematography",
            location: "Los Angeles, CA",
            clientId: client1.clientProfile!.id,
            status: "AWARDED"
        }
    })
    console.log("✅ Jobs Created")

    // 5. Proposals
    await prisma.proposal.create({
        data: {
            jobId: job1.id,
            operatorId: op1.operatorProfile!.id,
            price: 1200,
            message: "I have the new Matrice 300 RTK with thermal payload. Can deliver within 24hrs.",
            status: "PENDING"
        }
    })

    await prisma.proposal.create({
        data: {
            jobId: job2.id,
            operatorId: op2.operatorProfile!.id,
            price: 2500,
            message: "Specialized in high-end real estate. 4K Pro Res 422 delivery.",
            status: "ACCEPTED"
        }
    })
    console.log("✅ Proposals Seeding Complete")

    console.log("🔋 System Primed. Demo Environment Ready.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
