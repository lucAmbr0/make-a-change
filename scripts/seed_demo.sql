-- Seed demo data for Make A Change
-- Plaintext passwords inserted temporarily for demo/testing as requested
-- Run after creating schema (dump-make_a_change-202603032148.sql)

SET @@FOREIGN_KEY_CHECKS=0;

-- Users (10)
INSERT INTO `users` (id, first_name, last_name, email, password_hashed, registered_at, phone, birth_date, is_active, is_admin) VALUES
(1,'Alice','Smith','alice1@example.com','password1','2026-03-03 10:00:00',NULL,'1990-01-01',1,0),
(2,'Bob','Jones','bob2@example.com','password2','2026-03-03 10:05:00',NULL,'1991-02-02',1,0),
(3,'Carol','Taylor','carol3@example.com','password3','2026-03-03 10:10:00',NULL,'1992-03-03',1,0),
(4,'Dave','Brown','dave4@example.com','password4','2026-03-03 10:15:00',NULL,'1993-04-04',1,0),
(5,'Eve','Davis','eve5@example.com','password5','2026-03-03 10:20:00',NULL,'1994-05-05',1,0),
(6,'Frank','Wilson','frank6@example.com','password6','2026-03-03 10:25:00',NULL,'1995-06-06',1,0),
(7,'Grace','Lee','grace7@example.com','password7','2026-03-03 10:30:00',NULL,'1996-07-07',1,0),
(8,'Heidi','King','heidi8@example.com','password8','2026-03-03 10:35:00',NULL,'1997-08-08',1,0),
(9,'Ivan','Young','ivan9@example.com','password9','2026-03-03 10:40:00',NULL,'1998-09-09',1,0),
(10,'Judy','Hall','judy10@example.com','password10','2026-03-03 10:45:00',NULL,'1999-10-10',1,0);

-- Organizations (2) - creators are user 1 and user 2
INSERT INTO `organizations` (id, creator_id, name, description, created_at, cover_path, is_public, requires_approval) VALUES
(1,1,'Community Action A','Organization A focused on local improvements','2026-03-03 11:00:00',NULL,1,0),
(2,2,'Neighborhood Initiative B','Neighborhood improvements and safety','2026-03-03 11:05:00',NULL,1,0);

-- Members: each org has 5 members including owner
-- Org 1 members: 1,3,4,5,6
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(1,1,0,1),
(1,3,0,0),
(1,4,0,0),
(1,5,0,0),
(1,6,0,0);

-- Org 2 members: 2,3,4,5,7
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(2,2,0,1),
(2,3,0,0),
(2,4,0,0),
(2,5,0,0),
(2,7,0,0);

-- Campaigns: two per organization (4 campaigns)
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval) VALUES
(1,1,1,'Clean Park','A campaign to clean and maintain the local park','2026-03-03 12:00:00',NULL,5,1,1,0),
(2,1,1,'Community Garden','Create a community garden in the neighborhood','2026-03-03 12:30:00',NULL,4,1,1,0),
(3,2,2,'Safe Crosswalks','Add crosswalks and signage near schools','2026-03-03 13:00:00',NULL,6,1,1,0),
(4,2,2,'Local Library Support','Support funding for the local library','2026-03-03 13:30:00',NULL,5,1,1,0);

-- Signatures: ensure each campaign has between 3 and 7 signatures
-- Use MD5 checksum of signer_id and campaign_id for checksum field
INSERT INTO `signatures` (id, checksum, signer_id, campaign_id) VALUES
(1, MD5(CONCAT('1',':','1')), 1, 1),
(2, MD5(CONCAT('3',':','1')), 3, 1),
(3, MD5(CONCAT('4',':','1')), 4, 1),
(4, MD5(CONCAT('5',':','2')), 5, 2),
(5, MD5(CONCAT('6',':','2')), 6, 2),
(6, MD5(CONCAT('3',':','2')), 3, 2),
(7, MD5(CONCAT('2',':','3')), 2, 3),
(8, MD5(CONCAT('3',':','3')), 3, 3),
(9, MD5(CONCAT('4',':','3')), 4, 3),
(10, MD5(CONCAT('5',':','3')), 5, 3),
(11, MD5(CONCAT('7',':','4')), 7, 4),
(12, MD5(CONCAT('3',':','4')), 3, 4),
(13, MD5(CONCAT('5',':','4')), 5, 4);

-- Favorites: 8 users have between 1 and 3 favorite campaigns
INSERT INTO `favorites` (user_id, campaign_id) VALUES
(1,1),(1,2),
(2,3),
(3,1),(3,3),(3,4),
(4,2),
(5,1),(5,3),
(6,2),
(7,4),
(8,1),(8,3);

-- Approval requests: 3 users have pending requests on organization 2
INSERT INTO `approval_requests` (user_id, organization_id, requested_at) VALUES
(8,2,'2026-03-03 14:00:00'),
(9,2,'2026-03-03 14:05:00'),
(10,2,'2026-03-03 14:10:00');

SET @@FOREIGN_KEY_CHECKS=1;

-- Plaintext passwords (for reference):
-- alice1@example.com / password1
-- bob2@example.com   / password2
-- carol3@example.com / password3
-- dave4@example.com  / password4
-- eve5@example.com   / password5
-- frank6@example.com / password6
-- grace7@example.com / password7
-- heidi8@example.com / password8
-- ivan9@example.com  / password9
-- judy10@example.com / password10
