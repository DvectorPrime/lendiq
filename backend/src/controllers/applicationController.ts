import { Request, Response } from "express";
import { prisma } from "../services/prisma.js";
import { ApplicationDecision, MaritalStatus, EmploymentType, EducationLevel, HousingType } from "../../generated/prisma/enums.js";
import { getPrediction, MLServiceError } from "../services/mlService.js";

// Matches authMiddleware's AuthenticatedRequest
type AuthenticatedRequest = Request & {
    user?: { id: string; email: string; role: string; [key: string]: any };
    token?: string;
};

export async function createApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const payload = req.body;
        
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        // 1. Get prediction from mlService
        const { riskScore, shapValues } = await getPrediction(payload);

        // 2. Determine Decision Threshold (e.g. > 50 is REJECTED)
        const decision = riskScore > 50 ? ApplicationDecision.REJECTED : ApplicationDecision.APPROVED;

        // 3. Save to database
        const application = await prisma.application.create({
            data: {
                submittedById: req.user.id,
                applicantName: payload.applicantName || "Unknown Applicant",
                dateOfBirth: new Date(payload.dateOfBirth),
                maritalStatus: payload.maritalStatus ? payload.maritalStatus.toUpperCase().replace(/\s+/g, '_') as MaritalStatus : undefined,
                numChildren: parseInt(payload.numChildren, 10),
                employmentType: payload.employmentType ? payload.employmentType.toUpperCase().replace(/\s+/g, '_') as EmploymentType : undefined,
                employmentDurationYears: parseFloat(payload.employmentDurationYears || 0),
                educationLevel: payload.educationLevel ? payload.educationLevel.toUpperCase().replace(/\s+/g, '_') as EducationLevel : undefined,
                annualIncome: parseFloat(payload.annualIncome),
                ownsVehicle: Boolean(payload.ownsVehicle),
                ownsRealEstate: Boolean(payload.ownsRealEstate),
                housingType: payload.housingType ? payload.housingType.toUpperCase().replace(/\s+/g, '_') as HousingType : undefined,
                numFamilyMembers: parseFloat(payload.numFamilyMembers),
                loanAmount: parseFloat(payload.loanAmount),
                loanTermMonths: parseFloat(payload.loanTermMonths || 12),
                riskScore: riskScore,
                decision: decision,
                shapValues: shapValues,
            }
        });

        res.status(201).json({ success: true, data: application });
    } catch (error: any) {
        if (error instanceof MLServiceError) {
            res.status(error.statusCode).json({ 
                success: false, 
                message: error.message, 
                errors: error.errors 
            });
            return;
        }

        // Catch Prisma validation errors explicitly
        if (error.code === 'P2009' || (error.message && error.message.includes('Invalid value for argument'))) {
            res.status(400).json({ 
                success: false, 
                message: "Invalid field value provided.", 
                errors: ["One or more fields contain invalid values that do not match the expected format."] 
            });
            return;
        }

        console.error("[ApplicationController][createApplication] Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const applications = await prisma.application.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                overriddenBy: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        const total = await prisma.application.count();

        res.status(200).json({ 
            success: true, 
            data: applications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("[ApplicationController][getApplications] Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                overriddenBy: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        if (!application) {
            res.status(404).json({ success: false, message: "Application not found" });
            return;
        }

        res.status(200).json({ success: true, data: application });
    } catch (error: any) {
        console.error("[ApplicationController][getApplicationById] Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function overrideApplicationDecision(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { decision } = req.body;

        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!Object.values(ApplicationDecision).includes(decision)) {
            res.status(400).json({ success: false, message: "Invalid decision value" });
            return;
        }

        const application = await prisma.application.update({
            where: { id },
            data: {
                decision: decision as ApplicationDecision,
                adminOverride: true,
                overriddenById: req.user.id,
                overriddenAt: new Date()
            }
        });

        res.status(200).json({ success: true, data: application });
    } catch (error: any) {
        console.error("[ApplicationController][overrideApplicationDecision] Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}