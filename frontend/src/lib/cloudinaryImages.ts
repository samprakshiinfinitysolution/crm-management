/**
 * Cloudinary Application Assets Registry
 *
 * Centralized, CDN-accelerated image URLs hosted on Cloudinary.
 * Used across the application UI (e.g. landing page hero, workspace showcases, pipeline previews).
 */

export const CLOUDINARY_IMAGES = {
  heroImage: "https://res.cloudinary.com/atr5osne/image/upload/v1791803283/crm-assets/hero-image.png",
  crmHeroDashboard: "https://res.cloudinary.com/atr5osne/image/upload/v1791803441/crm-assets/crm-hero-dashboard.jpg",
  heroPresentationLead: "https://res.cloudinary.com/atr5osne/image/upload/v1791803285/crm-assets/hero-presentation-lead.jpg",
  heroTeamStrategy: "https://res.cloudinary.com/atr5osne/image/upload/v1791803287/crm-assets/hero-team-strategy.jpg",
  pipelineFlowMockup: "https://res.cloudinary.com/atr5osne/image/upload/v1791803289/crm-assets/pipeline-flow-mockup.jpg",
  salesExecutiveWorkspace: "https://res.cloudinary.com/atr5osne/image/upload/v1791803291/crm-assets/sales-executive-workspace.jpg",
  teamLeaderWorkspace: "https://res.cloudinary.com/atr5osne/image/upload/v1791803294/crm-assets/team-leader-workspace.jpg",
  teamPipelineReview: "https://res.cloudinary.com/atr5osne/image/upload/v1791803296/crm-assets/team-pipeline-review.jpg",
  signIn: "/sign-in.png",
} as const;

export type CloudinaryImageKey = keyof typeof CLOUDINARY_IMAGES;
