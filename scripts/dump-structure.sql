-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versione server:              12.2.2-MariaDB - MariaDB Server
-- S.O. server:                  Win64
-- HeidiSQL Versione:            12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dump della struttura del database make_a_change
DROP DATABASE IF EXISTS `make_a_change`;
CREATE DATABASE IF NOT EXISTS `make_a_change` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `make_a_change`;

-- Dump della struttura di tabella make_a_change.approval_requests
DROP TABLE IF EXISTS `approval_requests`;
CREATE TABLE IF NOT EXISTS `approval_requests` (
  `user_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `requested_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`,`organization_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `app_req_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `app_req_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.blacklist
DROP TABLE IF EXISTS `blacklist`;
CREATE TABLE IF NOT EXISTS `blacklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(64) NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.campaigns
DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `title` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `cover_path` varchar(2048) DEFAULT NULL,
  `signature_goal` int(11) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `comments_active` tinyint(1) NOT NULL DEFAULT 1,
  `comments_require_approval` tinyint(1) NOT NULL DEFAULT 0,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `campaign_creator_fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `campaign_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.comments
DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime NOT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `comment_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.favorites
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`campaign_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `fav_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fav_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.invite_codes
DROP TABLE IF EXISTS `invite_codes`;
CREATE TABLE IF NOT EXISTS `invite_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `code` varchar(8) NOT NULL,
  `uses` int(11) NOT NULL DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `invite_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.members
DROP TABLE IF EXISTS `members`;
CREATE TABLE IF NOT EXISTS `members` (
  `organization_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_moderator` tinyint(1) DEFAULT 0,
  `is_owner` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`organization_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `member_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `member_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `target_user_id` int(11) NOT NULL,
  `title` varchar(32) NOT NULL,
  `text` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `user_target_id` (`target_user_id`) USING BTREE,
  CONSTRAINT `notif_user_fk` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.organizations
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `cover_path` varchar(2048) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 0,
  `category` varchar(64) DEFAULT 'Altre iniziative',
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `org_creator_fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.signatures
DROP TABLE IF EXISTS `signatures`;
CREATE TABLE IF NOT EXISTS `signatures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `checksum` varchar(64) NOT NULL,
  `signer_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `checksum` (`checksum`),
  KEY `signer_id` (`signer_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `signature_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `signature_user_fk` FOREIGN KEY (`signer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella make_a_change.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(32) NOT NULL,
  `last_name` varchar(32) NOT NULL,
  `email` varchar(256) NOT NULL,
  `password_hashed` varchar(64) NOT NULL,
  `registered_at` datetime NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `birth_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_admin` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- L’esportazione dei dati non era selezionata.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
