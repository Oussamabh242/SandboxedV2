/*
  Warnings:

  - You are about to drop the column `execTime` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `timeout` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCases" TEXT NOT NULL,
    "timeout" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "functionName" TEXT NOT NULL,
    "argType" TEXT NOT NULL
);
INSERT INTO "new_Problem" ("argType", "functionName", "id", "order", "testCases") SELECT "argType", "functionName", "id", "order", "testCases" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
