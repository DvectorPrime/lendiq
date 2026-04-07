import "dotenv/config";
import {
  ApplicationDecision,
  EducationLevel,
  EmploymentType,
  HousingType,
  MaritalStatus,
  PrismaClient,
  UserRole,
} from "../generated/prisma/client.ts";

const prisma = new PrismaClient();
const nodeProcess = globalThis as typeof globalThis & {
  process: {
    env: Record<string, string | undefined>;
    exitCode?: number;
  };
};

type SeedUser = {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

function getAdminUser(): SeedUser {
  const fullName =
    nodeProcess.process.env.SEED_ADMIN_FULL_NAME?.trim() || "LendIQ Admin User";
  const email =
    nodeProcess.process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
    "admin@lendiq.local";
  const passwordHash =
    nodeProcess.process.env.SEED_ADMIN_PASSWORD_HASH?.trim() ||
    "$2b$10$zfjf39lP8FMfX4E2nqWpQe7QTYI6F8wNQTa7YfVhzm6DnWf5gWRie";

  return {
    fullName,
    email,
    passwordHash,
    role: UserRole.ADMIN,
  };
}

async function main() {
  const pingResult = (await prisma.$runCommandRaw({ ping: 1 })) as {
    ok?: number;
  };

  if (pingResult?.ok !== 1) {
    throw new Error(`MongoDB ping failed: ${JSON.stringify(pingResult)}`);
  }

  const admin = getAdminUser();

  const seedUsers: SeedUser[] = [
    admin,
    {
      fullName: "Amina Yusuf",
      email: "amina.yusuf@lendiq.local",
      passwordHash:
        "$2b$10$5BM7h1AQjbhwR3WIlJkWQOn9fSxH8v.zP5zLdIh1GtxKOdq8Q0fV.",
      role: UserRole.LOAN_OFFICER,
    },
    {
      fullName: "David Okoro",
      email: "david.okoro@lendiq.local",
      passwordHash:
        "$2b$10$QQ9DQlM8ozhoQSGelPGBOepN.aAe6h7wFBQ8b26dQdSvyS7wo/WDW",
      role: UserRole.LOAN_OFFICER,
    },
  ];

  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await Promise.all(
    seedUsers.map((user) =>
      prisma.user.create({
        data: user,
      })
    )
  );

  const adminUser = createdUsers.find((user) => user.role === UserRole.ADMIN);
  const loanOfficers = createdUsers.filter(
    (user) => user.role === UserRole.LOAN_OFFICER
  );

  if (!adminUser || loanOfficers.length < 2) {
    throw new Error("Failed to create required seed users.");
  }

  const applications = [
    {
      submittedById: loanOfficers[0].id,
      applicantName: "Chinedu Eze",
      dateOfBirth: new Date("1992-04-12T00:00:00.000Z"),
      maritalStatus: MaritalStatus.MARRIED,
      numChildren: 2,
      employmentType: EmploymentType.EMPLOYED,
      employmentDurationYears: 6.5,
      educationLevel: EducationLevel.HIGHER,
      annualIncome: 3200000,
      ownsVehicle: true,
      ownsRealEstate: false,
      housingType: HousingType.RENTS,
      numFamilyMembers: 4,
      loanAmount: 900000,
      loanTermMonths: 24,
      riskScore: 28.4,
      decision: ApplicationDecision.APPROVED,
      shapValues: [
        { feature: "annualIncome", value: 3200000, shap_value: -0.42 },
        {
          feature: "employmentDurationYears",
          value: 6.5,
          shap_value: -0.26,
        },
        { feature: "loanAmount", value: 900000, shap_value: 0.17 },
      ],
    },
    {
      submittedById: loanOfficers[0].id,
      applicantName: "Grace Bello",
      dateOfBirth: new Date("1988-09-03T00:00:00.000Z"),
      maritalStatus: MaritalStatus.SINGLE,
      numChildren: 0,
      employmentType: EmploymentType.SELF_EMPLOYED,
      employmentDurationYears: 3.2,
      educationLevel: EducationLevel.SECONDARY,
      annualIncome: 1800000,
      ownsVehicle: false,
      ownsRealEstate: false,
      housingType: HousingType.WITH_FAMILY,
      numFamilyMembers: 2,
      loanAmount: 1500000,
      loanTermMonths: 18,
      riskScore: 51.8,
      decision: ApplicationDecision.REVIEW,
      shapValues: [
        { feature: "loanAmount", value: 1500000, shap_value: 0.49 },
        { feature: "annualIncome", value: 1800000, shap_value: 0.23 },
        { feature: "housingType", value: "with_family", shap_value: 0.14 },
      ],
    },
    {
      submittedById: loanOfficers[1].id,
      applicantName: "Ibrahim Musa",
      dateOfBirth: new Date("1996-01-19T00:00:00.000Z"),
      maritalStatus: MaritalStatus.SEPARATED,
      numChildren: 1,
      employmentType: EmploymentType.UNEMPLOYED,
      employmentDurationYears: 0,
      educationLevel: EducationLevel.PRIMARY,
      annualIncome: 720000,
      ownsVehicle: false,
      ownsRealEstate: false,
      housingType: HousingType.SOCIAL_HOUSING,
      numFamilyMembers: 3,
      loanAmount: 1200000,
      loanTermMonths: 36,
      riskScore: 77.1,
      decision: ApplicationDecision.REJECTED,
      shapValues: [
        { feature: "employmentType", value: "unemployed", shap_value: 0.56 },
        { feature: "annualIncome", value: 720000, shap_value: 0.41 },
        { feature: "loanAmount", value: 1200000, shap_value: 0.33 },
      ],
    },
    {
      submittedById: loanOfficers[1].id,
      applicantName: "Ngozi Anya",
      dateOfBirth: new Date("1990-11-28T00:00:00.000Z"),
      maritalStatus: MaritalStatus.WIDOWED,
      numChildren: 3,
      employmentType: EmploymentType.GOVERNMENT,
      employmentDurationYears: 9.1,
      educationLevel: EducationLevel.POSTGRADUATE,
      annualIncome: 4500000,
      ownsVehicle: true,
      ownsRealEstate: true,
      housingType: HousingType.OWNS,
      numFamilyMembers: 5,
      loanAmount: 2000000,
      loanTermMonths: 30,
      riskScore: 63.2,
      decision: ApplicationDecision.APPROVED,
      adminOverride: true,
      overriddenById: adminUser.id,
      overriddenAt: new Date(),
      shapValues: [
        { feature: "employmentDurationYears", value: 9.1, shap_value: -0.38 },
        { feature: "ownsRealEstate", value: true, shap_value: -0.24 },
        { feature: "loanAmount", value: 2000000, shap_value: 0.29 },
      ],
    },
    {
      submittedById: loanOfficers[0].id,
      applicantName: "Samuel Ade",
      dateOfBirth: new Date("1999-06-07T00:00:00.000Z"),
      maritalStatus: MaritalStatus.SINGLE,
      numChildren: 0,
      employmentType: EmploymentType.STUDENT,
      employmentDurationYears: 0.4,
      educationLevel: EducationLevel.HIGHER,
      annualIncome: 600000,
      ownsVehicle: false,
      ownsRealEstate: false,
      housingType: HousingType.RENTS,
      numFamilyMembers: 1,
      loanAmount: 350000,
      loanTermMonths: 12,
      riskScore: null,
      decision: ApplicationDecision.PENDING_REVIEW,
      shapValues: [],
    },
  ];

  await prisma.application.createMany({
    data: applications,
  });

  const [userCount, applicationCount] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
  ]);

  console.log("Database revamp seed completed successfully.");
  console.log(`Users seeded: ${userCount}`);
  console.log(`Applications seeded: ${applicationCount}`);
  console.log(`Admin email: ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error("Prisma database revamp seed failed.");
    if (error?.code === "P2031") {
      console.error(
        "MongoDB is reachable, but Prisma write operations require MongoDB replica set mode."
      );
      console.error(
        "Use MongoDB Atlas or start local mongod with --replSet and initialize it."
      );
    }
    console.error(error);
    nodeProcess.process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
