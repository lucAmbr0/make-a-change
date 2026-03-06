/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: make_a_change
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `approval_requests`
--

DROP TABLE IF EXISTS `approval_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_requests` (
  `user_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `requested_at` datetime NOT NULL,
  PRIMARY KEY (`user_id`,`organization_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `app_req_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `app_req_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_requests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `approval_requests` WRITE;
/*!40000 ALTER TABLE `approval_requests` DISABLE KEYS */;
INSERT INTO `approval_requests` VALUES
(8,2,'2026-03-03 14:00:00'),
(9,2,'2026-03-03 14:05:00'),
(10,2,'2026-03-03 14:10:00');
/*!40000 ALTER TABLE `approval_requests` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `blacklist`
--

DROP TABLE IF EXISTS `blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `blacklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(64) NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blacklist`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `blacklist` WRITE;
/*!40000 ALTER TABLE `blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `blacklist` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) DEFAULT NULL,
  `creator_id` int(11) NOT NULL,
  `title` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `cover_path` varchar(64) DEFAULT NULL,
  `signature_goal` int(11) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `comments_active` tinyint(1) NOT NULL DEFAULT 1,
  `comments_require_approval` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `campaign_creator_fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `campaign_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES
(1,1,1,'Clean Park','A campaign to clean and maintain the local park','2026-03-03 12:00:00',NULL,5,1,1,0),
(2,1,1,'Community Garden','Create a community garden in the neighborhood','2026-03-03 12:30:00',NULL,4,1,1,0),
(3,2,2,'Safe Crosswalks','Add crosswalks and signage near schools','2026-03-03 13:00:00',NULL,6,1,1,0),
(4,2,2,'Local Library Support','Support funding for the local library','2026-03-03 13:30:00',NULL,5,1,1,0);
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `comment_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `comment_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`campaign_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `fav_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `fav_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES
(1,1),
(3,1),
(5,1),
(8,1),
(1,2),
(4,2),
(6,2),
(2,3),
(3,3),
(5,3),
(8,3),
(3,4),
(7,4);
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `invite_codes`
--

DROP TABLE IF EXISTS `invite_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `invite_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `code` varchar(8) NOT NULL,
  `uses` int(11) NOT NULL DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `invite_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invite_codes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `invite_codes` WRITE;
/*!40000 ALTER TABLE `invite_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `invite_codes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `organization_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_moderator` tinyint(1) NOT NULL DEFAULT 0,
  `is_owner` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`organization_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `member_org_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `member_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES
(1,1,0,1),
(1,3,0,0),
(1,4,0,0),
(1,5,0,0),
(1,6,0,0),
(2,2,0,1),
(2,3,0,0),
(2,4,0,0),
(2,5,0,0),
(2,7,0,0);
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_target_id` int(11) DEFAULT NULL,
  `campaign_target_id` int(11) DEFAULT NULL,
  `user_target_id` int(11) DEFAULT NULL,
  `title` varchar(32) NOT NULL,
  `text` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `organization_target_id` (`organization_target_id`),
  KEY `campaign_target_id` (`campaign_target_id`),
  KEY `user_target_id` (`user_target_id`),
  CONSTRAINT `notif_campaign_fk` FOREIGN KEY (`campaign_target_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `notif_org_fk` FOREIGN KEY (`organization_target_id`) REFERENCES `organizations` (`id`),
  CONSTRAINT `notif_user_fk` FOREIGN KEY (`user_target_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `cover_path` varchar(64) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  CONSTRAINT `org_creator_fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES
(1,1,'Community Action A','Organization A focused on local improvements','2026-03-03 11:00:00',NULL,1,0),
(2,2,'Neighborhood Initiative B','Neighborhood improvements and safety','2026-03-03 11:05:00',NULL,1,0);
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `signatures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `checksum` varchar(64) NOT NULL,
  `signer_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `checksum` (`checksum`),
  KEY `signer_id` (`signer_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `signature_campaign_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  CONSTRAINT `signature_user_fk` FOREIGN KEY (`signer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signatures`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `signatures` WRITE;
/*!40000 ALTER TABLE `signatures` DISABLE KEYS */;
INSERT INTO `signatures` VALUES
(1,'d0bd571dc19c083d82f023c9666c5574',1,1),
(2,'1eea22a4b9013094c41c1f587be16ab1',3,1),
(3,'f4a9b4147a8bb6f3b4c39a664553d3a8',4,1),
(4,'dc676a1405114d4fecda3f21a08b17b5',5,2),
(5,'af8e8e7e1230b2422a0d14ca607e4d30',6,2),
(6,'617abeba7b98ba3ddb992d1cfea91617',3,2),
(7,'02eaa2934adcabdcd2d34d09d9bddd8c',2,3),
(8,'a0a13454876e79298ee14724ac26a2dd',3,3),
(9,'35c934de8e15f05a2004a5e82a5c847a',4,3),
(10,'3fe311693ab3b0693c57f8666eafe690',5,3),
(11,'8f999ddc20b34ecdea22b572b6c2605f',7,4),
(12,'196f2739157a9ea63183a49d928b9a35',3,4),
(13,'5439f3cf0dd8983d96c3e93a1dc8aa02',5,4),
(14,'chk-1772649987861',1,1),
(15,'chk-1772650690033',1,1);
/*!40000 ALTER TABLE `signatures` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Alice','Smith','alice1@example.com','$2b$10$J48m9lo51qexMzyAcCmGqOGvXsTttmqgczLihCVmmYyoz9fWc38hW','2026-03-03 10:00:00',NULL,'1990-01-01',1,0),
(2,'Bob','Jones','bob2@example.com','$2b$10$o3uQkGf2UYo4MwEdX5b5B.0qyhO.tmH2absvQdF.UtVhHpX8lHaaW','2026-03-03 10:05:00',NULL,'1991-02-02',1,0),
(3,'Carol','Taylor','carol3@example.com','$2b$10$4wwX6me9Ncmr99MUKY99Pu17dgZ8MONu6M4ewfhCrL8ER5DWvgubG','2026-03-03 10:10:00',NULL,'1992-03-03',1,0),
(4,'Dave','Brown','dave4@example.com','$2b$10$pGlrvcJHUru4am37G6rTR.gjNTmBGaNyiskRcmeu26Cp0j7Q6q7ry','2026-03-03 10:15:00',NULL,'1993-04-04',1,0),
(5,'Eve','Davis','eve5@example.com','$2b$10$FbCwN9r3Ey0Cu5EnS7PRXu6m6ZUqxpcAWzkoh92R842mJdAw0.eSa','2026-03-03 10:20:00',NULL,'1994-05-05',1,0),
(6,'Frank','Wilson','frank6@example.com','$2b$10$aXFX2qTMSE.nYMLAiqlukOFZK4QmYQhiXtNsJk2I8160aLLRbAq6.','2026-03-03 10:25:00',NULL,'1995-06-06',1,0),
(7,'Grace','Lee','grace7@example.com','$2b$10$SeKrR6WolGPN2MK1aqfKQOuhjvcxsiaH5D167T3q419KS8WSQvQES','2026-03-03 10:30:00',NULL,'1996-07-07',1,0),
(8,'Heidi','King','heidi8@example.com','$2b$10$ENoKJoi66re9OqbDYSo8g.zI5SnX/4ZCZFQXav2Q1V90fm1EVV8Aq','2026-03-03 10:35:00',NULL,'1997-08-08',1,0),
(9,'Ivan','Young','ivan9@example.com','$2b$10$ce8OuD7XaxJfFaMpPh/18.zP7vyy.bOAHjKXwbfInvcOG.sX1yGK2','2026-03-03 10:40:00',NULL,'1998-09-09',1,0),
(10,'Judy','Hall','judy10@example.com','$2b$10$8sOEOZD9nfGYXLpZ84Py6.CJhWOlN7oKx3Ebeol1Gl1El5zC4.vO2','2026-03-03 10:45:00',NULL,'1999-10-10',1,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'make_a_change'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-03-06 15:13:29
