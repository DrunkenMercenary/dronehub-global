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
                    plan: "PRO",
                    planSince: new Date(),
                    services: "videography,surveying,inspection",
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
                    services: "surveying,inspection",
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
                    services: "photography",
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
            category: "inspection",
            location: "Phoenix, AZ",
            clientId: client2.clientProfile!.id,
            status: "OPEN"
        }
    })

    const job2 = await prisma.jobRequest.create({
        data: {
            title: "Hollywood Hills Luxury Promo",
            description: "FPV Flythrough and cinematic exteriors for a $15M listing.",
            category: "videography",
            location: "Los Angeles, CA",
            clientId: client1.clientProfile!.id,
            status: "COMPLETED"
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

    // 6. Reviews (demo)
    await prisma.review.upsert({
        where: { jobId: job2.id },
        update: {},
        create: {
            jobId: job2.id,
            operatorId: op2.operatorProfile!.id,
            clientId: client1.clientProfile!.id,
            rating: 5,
            comment: "Outstanding cinematic work and a fast turnaround. Highly recommended.",
        }
    })
    console.log("✅ Reviews Seeded")


    // 7. Regulations (demo knowledge base)
    await prisma.regulation.deleteMany({})
    await prisma.regulation.createMany({ data: [
  { country:"Singapore", category:"Licensing", title:"Operator permit & pilot licence", summary:"Drones above 1.5kg, or any drone flown for non-recreational purposes, generally require an Operator Permit, and the remote pilot may need a UA Pilot Licence. Register your drone with CAAS before flying.", authority:"CAAS", sourceUrl:"https://www.caas.gov.sg" },
  { country:"Singapore", category:"Airspace", title:"Altitude limits & no-fly zones", summary:"Keep below 60m above mean sea level and avoid protected, restricted and danger areas. Flying within 5km of an aerodrome requires a permit.", authority:"CAAS", sourceUrl:"https://www.caas.gov.sg" },
  { country:"Australia", category:"Licensing", title:"Accreditation & remote pilot licence", summary:"Commercial drone work generally requires CASA accreditation; larger or more complex operations need a Remote Pilot Licence (RePL) and a Remote Operator's Certificate (ReOC).", authority:"CASA", sourceUrl:"https://www.casa.gov.au" },
  { country:"Australia", category:"Operations", title:"Standard operating conditions", summary:"Fly in daylight, within visual line of sight, below 120m AGL, at least 30m from people, one drone at a time, and not near aerodromes or emergency operations.", authority:"CASA", sourceUrl:"https://www.casa.gov.au" },
  { country:"Hong Kong", category:"Licensing", title:"SUA registration & pilot ratings", summary:"Under the Small Unmanned Aircraft Order, register small unmanned aircraft over 250g. Remote pilots need ratings that depend on the weight category and type of operation.", authority:"CAD", sourceUrl:"https://www.cad.gov.hk" },
  { country:"Hong Kong", category:"Airspace", title:"Height limits & restricted areas", summary:"Observe height limits (typically up to 90m for standard operations) and keep well clear of Hong Kong International Airport and designated restricted areas.", authority:"CAD", sourceUrl:"https://www.cad.gov.hk" },
  { country:"Malaysia", category:"Licensing", title:"Permits for commercial & heavy drones", summary:"Drones above 20kg require CAAM approval. Commercial operations need the appropriate permits and may require an operator certificate.", authority:"CAAM", sourceUrl:"https://www.caam.gov.my" },
  { country:"Malaysia", category:"Operations", title:"Distance & altitude limits", summary:"Stay below 400ft, keep clear of airports (typically a 5km radius) and avoid flying over crowds or built-up areas without approval.", authority:"CAAM", sourceUrl:"https://www.caam.gov.my" },
  { country:"Japan", category:"Licensing", title:"Registration & pilot categories", summary:"Drones weighing 100g and above must be registered. Licensing categories apply for certain operations such as beyond-visual-line-of-sight or flights over populated areas.", authority:"JCAB / MLIT", sourceUrl:"https://www.mlit.go.jp" },
  { country:"Japan", category:"Airspace", title:"DID zones, airports & altitude", summary:"Permission is required to fly over densely inhabited districts (DID), near airports, or above 150m. Check local restrictions before each flight.", authority:"JCAB / MLIT", sourceUrl:"https://www.mlit.go.jp" }
] })
    console.log("✅ Regulations Seeded")


    // 8. Service packages (demo)
    await prisma.servicePackage.deleteMany({})
    await prisma.servicePackage.create({ data: { operatorId: op1.operatorProfile!.id, title: "Property photo & video package", description: "20 edited aerial photos plus a 60-second cinematic clip, delivered in 3 days.", category: "photography", price: 600, deliveryDays: 3 } })
    await prisma.servicePackage.create({ data: { operatorId: op1.operatorProfile!.id, title: "Roof & structure inspection", description: "Full thermal and visual roof inspection with a written report.", category: "inspection", price: 450, deliveryDays: 5 } })
    await prisma.servicePackage.create({ data: { operatorId: op2.operatorProfile!.id, title: "Site survey & 3D map", description: "Drone survey with orthomosaic map and 3D model export.", category: "surveying", price: 1200, deliveryDays: 7 } })
    console.log("✅ Service Packages Seeded")

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
