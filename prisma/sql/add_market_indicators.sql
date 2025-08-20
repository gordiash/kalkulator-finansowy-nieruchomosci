-- MySQL DDL for market indicators time-series (compatible with Prisma models)
-- Tables: MarketSeries, Observation
-- Usage: run this against the database from your DATABASE_URL before using /api/market/* endpoints

-- 1) MarketSeries
CREATE TABLE IF NOT EXISTS `MarketSeries` (
  `id`           VARCHAR(191)  NOT NULL,
  `key`          VARCHAR(191)  NOT NULL,
  `name`         VARCHAR(191)  NOT NULL,
  `unit`         VARCHAR(50)   NOT NULL,
  `frequency`    VARCHAR(50)   NOT NULL,
  `source`       VARCHAR(50)   NOT NULL,
  `created_at`   DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at`   DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  CONSTRAINT `MarketSeries_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `MarketSeries_key_key` UNIQUE (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Observation
CREATE TABLE IF NOT EXISTS `Observation` (
  `id`         VARCHAR(191)  NOT NULL,
  `seriesId`   VARCHAR(191)  NOT NULL,
  `date`       DATE          NOT NULL,
  `value`      DECIMAL(14,6) NOT NULL,
  `created_at` DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  CONSTRAINT `Observation_pkey` PRIMARY KEY (`id`),
  CONSTRAINT `Observation_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `MarketSeries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Observation_seriesId_date_key` UNIQUE (`seriesId`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional helpful indexes (unique already indexes (seriesId,date))
CREATE INDEX `Observation_seriesId_idx` ON `Observation` (`seriesId`);

-- Done
