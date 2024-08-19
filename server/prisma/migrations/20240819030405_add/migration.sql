-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCases" TEXT NOT NULL,
    "execTime" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "functionName" TEXT NOT NULL,
    "argType" TEXT NOT NULL
);
