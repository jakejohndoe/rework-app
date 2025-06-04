// src/app/api/resumes/[id]/job-description/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for job description data
const jobDescriptionSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  jobUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params // ✅ Fixed: await params
    const resumeId = id
    const body = await request.json()

    // Validate the request body
    const validatedData = jobDescriptionSchema.parse(body)

    // Verify the user owns this resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    // Check if a job application already exists for this resume
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        resumeId: resumeId,
        userId: session.user.id,
      },
    })

    let jobApplication

    if (existingApplication) {
      // Update existing job application
      jobApplication = await prisma.jobApplication.update({
        where: { id: existingApplication.id },
        data: {
          jobTitle: validatedData.jobTitle,
          company: validatedData.company,
          jobDescription: validatedData.jobDescription,
          jobUrl: validatedData.jobUrl || null,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new job application
      jobApplication = await prisma.jobApplication.create({
        data: {
          userId: session.user.id,
          resumeId: resumeId,
          jobTitle: validatedData.jobTitle,
          company: validatedData.company,
          jobDescription: validatedData.jobDescription,
          jobUrl: validatedData.jobUrl || null,
          status: 'DRAFT',
        },
      })
    }

    return NextResponse.json({
      success: true,
      jobApplication: {
        id: jobApplication.id,
        jobTitle: jobApplication.jobTitle,
        company: jobApplication.company,
        jobDescription: jobApplication.jobDescription,
        jobUrl: jobApplication.jobUrl,
        status: jobApplication.status,
      },
    })

  } catch (error) {
    console.error('Error saving job description:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to retrieve existing job description
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params // ✅ Fixed: await params
    const resumeId = id

    // Find existing job application for this resume
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        resumeId: resumeId,
        userId: session.user.id,
      },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        jobDescription: true,
        jobUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!jobApplication) {
      return NextResponse.json({ jobApplication: null })
    }

    return NextResponse.json({ jobApplication })

  } catch (error) {
    console.error('Error fetching job description:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}