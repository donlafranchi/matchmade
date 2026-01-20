-- CreateTable
CREATE TABLE "ProfileNew" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coreValues" JSONB NOT NULL DEFAULT '[]',
    "beliefs" JSONB NOT NULL DEFAULT '{}',
    "interactionStyle" JSONB NOT NULL DEFAULT '{}',
    "lifestyle" JSONB NOT NULL DEFAULT '{}',
    "constraints" JSONB NOT NULL DEFAULT '[]',
    "location" TEXT,
    "ageRange" TEXT,
    "name" TEXT,
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "missing" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileNew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextType" "RelationshipContextType" NOT NULL,
    "relationshipTimeline" TEXT,
    "exclusivityExpectation" TEXT,
    "familyIntentions" TEXT,
    "attractionImportance" TEXT,
    "friendshipDepth" TEXT,
    "groupActivityPreference" TEXT,
    "emotionalSupportExpectation" TEXT,
    "partnershipType" TEXT,
    "commitmentHorizon" TEXT,
    "complementarySkills" JSONB,
    "equityOrRevShare" TEXT,
    "creativeType" TEXT,
    "roleNeeded" TEXT,
    "processStyle" TEXT,
    "egoBalance" TEXT,
    "compensationExpectation" TEXT,
    "serviceType" TEXT,
    "budgetRange" TEXT,
    "timelineNeeded" TEXT,
    "credentialsRequired" TEXT,
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "missing" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileNew_userId_key" ON "ProfileNew"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContextIntent_userId_contextType_key" ON "ContextIntent"("userId", "contextType");

-- AddForeignKey
ALTER TABLE "ProfileNew" ADD CONSTRAINT "ProfileNew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextIntent" ADD CONSTRAINT "ContextIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
