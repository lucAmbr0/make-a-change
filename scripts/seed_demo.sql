-- Seed demo data for Make A Change
-- Comprehensive test data covering all features
-- Run after creating schema (dump-structure.sql)

SET @@FOREIGN_KEY_CHECKS=0;

-- Users (10) - Kept from original seed
INSERT INTO `users` (id, first_name, last_name, email, password_hashed, registered_at, phone, birth_date, is_active, is_admin) VALUES
(1,'Alice','Smith','alice1@example.com','Password1','2026-03-03 10:00:00',NULL,'1990-01-01',1,0),
(2,'Bob','Jones','bob2@example.com','Password2','2026-03-03 10:05:00',NULL,'1991-02-02',1,0),
(3,'Carol','Taylor','carol3@example.com','Password3','2026-03-03 10:10:00',NULL,'1992-03-03',1,0),
(4,'Dave','Brown','dave4@example.com','Password4','2026-03-03 10:15:00',NULL,'1993-04-04',1,0),
(5,'Eve','Davis','eve5@example.com','Password5','2026-03-03 10:20:00',NULL,'1994-05-05',1,0),
(6,'Frank','Wilson','frank6@example.com','Password6','2026-03-03 10:25:00',NULL,'1995-06-06',1,0),
(7,'Grace','Lee','grace7@example.com','Password7','2026-03-03 10:30:00',NULL,'1996-07-07',1,0),
(8,'Heidi','King','heidi8@example.com','Password8','2026-03-03 10:35:00',NULL,'1997-08-08',1,0),
(9,'Ivan','Young','ivan9@example.com','Password9','2026-03-03 10:40:00',NULL,'1998-09-09',1,0),
(10,'Judy','Hall','judy10@example.com','Password10','2026-03-03 10:45:00',NULL,'1999-10-10',1,0);

-- Organizations (5)
-- Org 1: Public, no approval required, has campaigns
-- Org 2: Public, requires approval, has campaigns
-- Org 3: Private, no approval required, has campaigns
-- Org 4: Public, no approval required, no campaigns (for testing)
-- Org 5: Public, requires approval, no campaigns (for testing)
INSERT INTO `organizations` (id, creator_id, name, description, created_at, cover_path, is_public, requires_approval, category) VALUES
(1, 1, 'Azione Comunitaria Centrale', 'Organizzazione dedicata al miglioramento del parco centrale della città. Focalizziamo i nostri sforzi sulla pulizia, la manutenzione e lo sviluppo di spazi verdi pubblici per tutta la comunità. Lavoriamo per creare uno spazio inclusivo dove cittadini di tutte le età possono godere della natura e dello stare insieme. Il nostro obiettivo è trasformare il parco in un luogo sicuro, accessibile e attraente che rifletta i valori della nostra comunità. Crediamo che gli spazi verdi pubblici sono fondamentali per il benessere psicofisico dei residenti e per la sostenibilità ambientale della città.', '2026-03-01 09:00:00', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9OWvdPJjepLQmJ-rkeG6d1aycG4QCJGXBpQ&s', 1, 0, 'Ambiente'),
(2, 2, 'Iniziativa Sicurezza Stradale', 'Lavoriamo per aumentare la sicurezza stradale nel nostro quartiere attraverso campagne di sensibilizzazione e proposte di miglioramento infrastrutturale per pedoni e ciclisti. La nostra missione è ridurre gli incidenti stradali e creare un ambiente urbano dove tutti possono muoversi in sicurezza. Conduciamo studi sulla viabilità, organizziamo workshops educativi e collaboriamo con le autorità locali per implementare soluzioni concrete. Riteniamo che la sicurezza stradale sia un diritto fondamentale di ogni cittadino e che un quartiere sicuro sia un quartiere più vivibile per tutti.', '2026-03-02 10:00:00', 'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_1026,h_684/https://sasicurezza.it/wp-content/uploads/2024/07/Segnali-stradali-guida-completa-per-la-sicurezza-stradale.jpg', 1, 1, 'Sicurezza'),
(3, 3, 'Circolo Culturale Chiuso', 'Organizzazione privata dedicata agli eventi culturali e alle discussioni riservate ai membri. Accesso limitato mediante invito per preservare l''intimità e la qualità dei dibattiti. Il nostro circolo promuove la letteratura, le arti visive, la filosofia e il cinema d''autore. Organizziamo regolarmente conferenze, proiezioni, mostre e cene tematiche dove i membri possono condividere passioni culturali in un ambiente raffinato e stimolante. Crediamo che la cultura sia un bene prezioso che merita spazi dedicati e comunità consapevoli di lettori, artisti e pensatori.', '2026-03-03 11:00:00', 'https://img.freepik.com/vettori-gratuito/pila-di-libri-di-design-piatto-disegnato-a-mano_23-2149341898.jpg?semt=ais_hybrid&w=740&q=80', 0, 0, 'Cultura'),
(4, 4, 'Associazione Beneficenza Locale', 'Promuoviamo iniziative di beneficenza e sostegno alle famiglie in difficoltà della comunità locale con vari programmi di aiuto. La nostra associazione si dedica a fornire assistenza materiale, supporto psicologico e opportunità educative a persone e famiglie che affrontano situazioni di vulnerabilità socioeconomica. Lavoriamo con partnership locali per massimizzare l''impatto dei nostri interventi. Il nostro impegno è quello di costruire una comunità più equa dove nessuno rimane indietro e dove tutti hanno accesso alle risorse necessarie per una vita dignitosa.', '2026-03-04 12:00:00', 'https://lamenteemeravigliosa.it/wp-content/uploads/2023/06/dona-beneficenza-1024x642-1-e1686725811247.jpg', 1, 0, 'Sociale'),
(5, 5, 'Gruppo Sviluppo Sostenibile', 'Organizzazione focalizzata sulla sostenibilità ambientale e lo sviluppo ecologico della nostra città con progetti innovativi. Promuoviamo la transizione verso un modello di sviluppo che rispetta i limiti del pianeta mantenendo il benessere della comunità. I nostri progetti includono efficienza energetica, mobilità sostenibile, gestione dei rifiuti e agricoltura urbana. Collaboriamo con esperti scientifici, istituzioni e cittadini per implementare soluzioni concrete che riducono l''impronta ecologica della nostra città. Crediamo che lo sviluppo sostenibile sia l''unica strada possibile per garantire un futuro prospero alle generazioni a venire.', '2026-03-05 13:00:00', 'https://www.eunews.it/wp-content/uploads/2016/05/ambiente.jpg', 1, 1, 'Ambiente');

-- Members setup for organizations
-- Org 1: users 1, 3, 4, 5, 6 (user 1 is owner)
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(1, 1, 0, 1),
(1, 3, 0, 0),
(1, 4, 1, 0),
(1, 5, 0, 0),
(1, 6, 0, 0);

-- Org 2: users 2, 3, 4, 7, 8 (user 2 is owner)
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(2, 2, 0, 1),
(2, 3, 0, 0),
(2, 4, 0, 0),
(2, 7, 1, 0),
(2, 8, 0, 0);

-- Org 3: users 3, 5, 9 (user 3 is owner) - private org with limited members
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(3, 3, 0, 1),
(3, 5, 1, 0),
(3, 9, 0, 0);

-- Org 4: users 4, 6 (user 4 is owner)
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(4, 4, 0, 1),
(4, 6, 0, 0);

-- Org 5: user 5 (owner)
INSERT INTO `members` (organization_id, user_id, is_moderator, is_owner) VALUES
(5, 5, 0, 1);

-- Approval requests (for organization requiring approval)
-- Org 2 (requires approval) has pending requests from users 6, 9, 10
INSERT INTO `approval_requests` (user_id, organization_id, requested_at) VALUES
(6, 2, '2026-03-10 14:00:00'),
(9, 2, '2026-03-11 14:30:00'),
(10, 2, '2026-03-12 15:00:00');

-- Org 5 (requires approval) has pending request from user 1
INSERT INTO `approval_requests` (user_id, organization_id, requested_at) VALUES
(1, 5, '2026-03-13 16:00:00');

-- CAMPAIGNS (10 total: 5 in organizations, 5 without organization)
-- CAMPAIGNS IN ORGANIZATIONS (5 campaigns)
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (1, 1, 1, 'Pulizia Parco Centro Città', 'Campagna per la pulizia completa e il ripristino del parco centrale della città. Vogliamo raccogliere firme per organizzare una giornata ecologica con volontari della comunità e professionisti del settore. Il progetto include la rimozione di rifiuti accumulati, la potatura degli alberi secondo standard di cura forestale, il ripristino delle aree gioco per i bambini con attrezzature sicure e conformi alle normative europee, e il miglioramento della segnaletica. Sarà un''occasione straordinaria per unire la comunità attorno a un obiettivo comune e creare un legame più profondo con lo spazio pubblico che condividiamo.', '2026-03-06 08:00:00', 'https://www.fassa.com/imports/foto-servizi/parco-giochi-comunale-vigo-35ae742a-710e-5d1b-a3f0-d9f14ed96ba7/36741/image-thumb__36741__fullscreenHeader/content-dam-org-3-images-full-rights-baby-park-parco-giochi-comunale-vigo-parco-giochi-comunale-vigo-archivio-apt-val-di-fassa-mrizzi-1.jpg', 10, 1, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (2, 1, 1, 'Illuminazione Notturna Sentieri Parco', 'Progetto per l''installazione di illuminazione LED eco-sostenibile nei sentieri del parco per garantire maggiore sicurezza ai visitatori durante le ore serali e notturne. La tecnologia LED proposta ridurrà i consumi energetici del 60% rispetto ai sistemi tradizionali ad alogenuri metallici e permetterà una regolazione intelligente dell''intensità luminosa. Vogliamo raccogliere il supporto della comunità per presentare il progetto al comune e ai finanziatori regionali. Questo intervento aumenterà la fruibilità del parco in orari serali e avrà un impatto positivo sulla sicurezza percepita dei cittadini.', '2026-03-07 09:30:00', 'https://www.luceweb.eu/wp-content/uploads/2024/11/tecnologia-Switchable-White-di-Cariboni-Group-prodotto-Levante-2.0-Cariboni-Group-citta-di-Schwarzenbach-an-der-Saale-Germania_-%C2%A9Delsana-Lighting-Group-.jpg', 8, 1, 1, 1, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (3, 2, 2, 'Attraversamenti Pedonali Scuole Primarie', 'Iniziativa per aumentare la sicurezza dei bambini con l''installazione di attraversamenti pedonali segnalati, illuminati e con semafori intelligenti presso le tre scuole primarie del quartiere. Abbiamo già effettuato studi approfonditi sulla viabilità e identificato i punti critici dove si concentrano gli incidenti. Chiediamo il supporto dei residenti, dei genitori e delle istituzioni scolastiche per questo importante progetto di sicurezza stradale. I dati dimostrano che attraversamenti ben realizzati riducono gli incidenti del 70% nelle zone scolastiche.', '2026-03-08 10:15:00', 'https://i2.res.24o.it/images2010/Editrice/ILSOLE24ORE/QUOTIDIANI_VERTICALI/2021/02/09/Quotidiani%20Verticali/ImmaginiWeb/Ritagli/Strisce-pedonali-rischi-per-chi-non-si-ferma-800x400-k0sD--1440x752@Quotidiani_Verticali-Web.jpg', 12, 1, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (4, 2, 2, 'Riduzione Velocità Limiti Residenziali', 'Campagna riservata ai membri dell''organizzazione per discutere la proposta di riduzione dei limiti di velocità nelle zone residenziali da 50 a 30 km/h. Questa misura comporterebbe una riduzione stimata del 40% degli incidenti stradali secondo i dati internazionali e migliorerebbe significativamente la qualità della vita nei nostri quartieri. Solo i membri potranno sottoscrivere questa petizione e partecipare ai workshop di approfondimento. La riduzione di velocità avrà anche effetti positivi sulla qualità dell''aria e sulla riduzione dell''inquinamento acustico.', '2026-03-09 11:45:00', 'https://storage.ecodibergamo.it/media/photologue/2026/2/28/photos/zone-30-piu-estese-in-sei-quartieri-coinvolte-115-strade_60205e50-141a-11f1-ac96-3a4055d0ffbf_1920_1080.jpg', 15, 0, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (5, 3, 3, 'Convegno Culturale Primavera 2026', 'Convegno esclusivo su temi di letteratura contemporanea e arti visive con focus su autori europei e movimenti artistici emergenti. Riservato ai soli membri del circolo per mantenere l''qualità del dibattito e l''intimità delle discussioni. Ospiteremo tre speaker internazionali di rilievo e quattro mostre d''arte locale curate da critici professionisti. L''evento si terrà per tre giorni consecutivi con workshop pomeridiani specializzati, cene di gala serali e sessioni di networking tra i partecipanti. Questo evento rappresenta il culmine della stagione culturale del nostro circolo.', '2026-03-10 13:00:00', 'https://www.agenziacult.it/wp-content/uploads/Whaps.jpg', 5, 0, 1, 0, 0);

-- CAMPAIGNS WITHOUT ORGANIZATION (5 campaigns)
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (6, NULL, 1, 'Supporto Biblioteca Comunale Ampliamento', 'Campagna pubblica per raccogliere firme a supporto del progetto di ampliamento della biblioteca comunale. La biblioteca attualmente può ospitare solo 50 persone contemporaneamente, mentre la comunità che la utiliza è cresciuta a 200 persone mensili, evidenziando una chiara necessità di espansione. L''espansione prevista aggiungerà una sezione ragazzi con oltre 5000 libri per diverse fasce di età, una sala lettura tranquilla dedicata a ricerca e studio, nuovi computer per l''accesso pubblico a internet e laboratori per corsi di informatica e alfabetizzazione digitale. Questo investimento supporterà l''inclusione digitale e rafforzerà il ruolo della biblioteca come centro culturale della comunità.', '2026-03-11 14:20:00', 'https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmlibGlvdGVjYSUyMHNjb2xhc3RpY2F8ZW58MHx8MHx8fDA%3D', 20, 1, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (7, NULL, 3, 'Istituzione Riserva Naturale Locale', 'Campagna privata per raccogliere firme sulla proposta di istituire una riserva naturale protetta nell''area collinare della periferia, un ecosistema di grande valore biologico e scientifico. Solo i firmatari autorizzati e gli esperti potranno visualizzare questa campagna sensibile. L''area è attualmente minacciata da sviluppo immobiliare speculativo e vogliamo preservarla come zona protetta per la biodiversità locale e la ricerca scientifica. Studi biologici hanno identificato 50 specie a rischio di estinzione che nidificano o vivono in questa area. La riserva potrebbe diventare un centro di ricerca e educazione ambientale.', '2026-03-12 15:30:00', 'https://static.ohga.it/wp-content/uploads/sites/24/2018/10/riserve-naturali.jpg', 25, 0, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (8, NULL, 4, 'Piantumazione Alberi Viale Principale', 'Campagna per l''aggiunta di 100 alberi autoctoni nel viale principale della città come parte del progetto di aumento del verde urbano e della mitigazione dei cambiamenti climatici. Ogni albero contribuirà a ridurre il calore urbano di circa 2 gradi in un raggio di 10 metri grazie all''ombreggiatura naturale e all''evapotraspirazione. Vogliamo raccogliere il supporto popolare per questa iniziativa di sostenibilità ambientale che avrà benefici nella qualità dell''aria, nella salute mentale dei cittadini e nella biodiversità urbana. Gli alberi saranno monitorati scientificamente per documentare i benefici ambientali.', '2026-03-13 16:45:00', 'https://economiacircolare.com/wp-content/uploads/2024/09/Alberi-RETE-CLIMA-Roma-Eon-foresta-italia-scaled-e1726040067358.jpg', 18, 1, 0, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (9, NULL, 5, 'Raccolta Fondi Progetto Educativo Speciale', 'Campagna riservata per raccogliere adesioni e supporto finanziario al progetto educativo speciale destinato a bambini con esigenze educative specifiche e difficoltà di apprendimento. La campagna è limitata ai genitori, educatori e professionisti della rete locale per garantire discrezione e comprensione del contesto. Il progetto prevede corsi specializzati con insegnanti certificati, materiali didattici personalizzati adattati ai diversi stili di apprendimento, e consulenza psicopedagogica continuativa per sei mesi. Il supporto finanziario permetterà a famiglie con risorse limitate di accedere a questi servizi.', '2026-03-14 17:15:00', 'https://thekingscollege.co.za/wp-content/uploads/2023/05/P1072653-scaled.jpg', 8, 0, 1, 0, 0);
INSERT INTO `campaigns` (id, organization_id, creator_id, title, description, created_at, cover_path, signature_goal, is_public, comments_active, comments_require_approval, is_archived) VALUES (10, NULL, 6, 'Percorso Ciclopedonale Centro-Stazione', 'Progetto per la creazione di un percorso ciclopedonale sicuro e ben illuminato che colleghi il centro città con la stazione ferroviaria principale, eliminando l''attuale situazione di pericolo e disagio. Il percorso di 3 km sarà parzialmente sotterraneo dove il traffico automobilistico è elevato per garantire massima sicurezza, e completamente aereo nelle zone residenziali per mantenere l''contatto con il territorio. Questo progetto potrebbe ridurre l''utilizzo di auto private del 15% nel nostro comune e aumentare significativamente l''utilizzo del trasporto pubblico ferroviario. Lo studio preliminare indica benefici enormi per la congestione stradale e la qualità dell''aria.', '2026-03-15 18:00:00', 'https://pisanews.net/wp-content/uploads/2024/03/pista-ciclabile-cep-870x600.jpeg', 22, 1, 1, 0, 0);

-- SIGNATURES (3-7 per campaign)
-- Campaign 1 (Pulizia Parco): 5 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '1')), 1, 1),
(MD5(CONCAT('3', ':', '1')), 3, 1),
(MD5(CONCAT('4', ':', '1')), 4, 1),
(MD5(CONCAT('5', ':', '1')), 5, 1),
(MD5(CONCAT('6', ':', '1')), 6, 1);

-- Campaign 2 (Illuminazione Notturna): 4 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '2')), 1, 2),
(MD5(CONCAT('3', ':', '2')), 3, 2),
(MD5(CONCAT('4', ':', '2')), 4, 2),
(MD5(CONCAT('5', ':', '2')), 5, 2);

-- Campaign 3 (Attraversamenti Pedonali): 6 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('2', ':', '3')), 2, 3),
(MD5(CONCAT('3', ':', '3')), 3, 3),
(MD5(CONCAT('4', ':', '3')), 4, 3),
(MD5(CONCAT('7', ':', '3')), 7, 3),
(MD5(CONCAT('8', ':', '3')), 8, 3),
(MD5(CONCAT('1', ':', '3')), 1, 3);

-- Campaign 4 (Private campaign in Org 2): 5 signatures - only org members
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('2', ':', '4')), 2, 4),
(MD5(CONCAT('3', ':', '4')), 3, 4),
(MD5(CONCAT('4', ':', '4')), 4, 4),
(MD5(CONCAT('7', ':', '4')), 7, 4),
(MD5(CONCAT('8', ':', '4')), 8, 4);

-- Campaign 5 (Private org campaign): 3 signatures - only org members
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('3', ':', '5')), 3, 5),
(MD5(CONCAT('5', ':', '5')), 5, 5),
(MD5(CONCAT('9', ':', '5')), 9, 5);

-- Campaign 6 (Biblioteca pubblica): 7 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '6')), 1, 6),
(MD5(CONCAT('2', ':', '6')), 2, 6),
(MD5(CONCAT('3', ':', '6')), 3, 6),
(MD5(CONCAT('4', ':', '6')), 4, 6),
(MD5(CONCAT('5', ':', '6')), 5, 6),
(MD5(CONCAT('6', ':', '6')), 6, 6),
(MD5(CONCAT('7', ':', '6')), 7, 6);

-- Campaign 7 (Private campaign - Riserva): 4 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('3', ':', '7')), 3, 7),
(MD5(CONCAT('5', ':', '7')), 5, 7),
(MD5(CONCAT('9', ':', '7')), 9, 7),
(MD5(CONCAT('10', ':', '7')), 10, 7);

-- Campaign 8 (Piantumazione Alberi): 6 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '8')), 1, 8),
(MD5(CONCAT('2', ':', '8')), 2, 8),
(MD5(CONCAT('4', ':', '8')), 4, 8),
(MD5(CONCAT('6', ':', '8')), 6, 8),
(MD5(CONCAT('8', ':', '8')), 8, 8),
(MD5(CONCAT('10', ':', '8')), 10, 8);

-- Campaign 9 (Private campaign - Raccolta Fondi): 3 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '9')), 1, 9),
(MD5(CONCAT('2', ':', '9')), 2, 9),
(MD5(CONCAT('5', ':', '9')), 5, 9);

-- Campaign 10 (Percorso Ciclopedonale): 5 signatures
INSERT INTO `signatures` (checksum, signer_id, campaign_id) VALUES
(MD5(CONCAT('1', ':', '10')), 1, 10),
(MD5(CONCAT('2', ':', '10')), 2, 10),
(MD5(CONCAT('3', ':', '10')), 3, 10),
(MD5(CONCAT('4', ':', '10')), 4, 10),
(MD5(CONCAT('6', ':', '10')), 6, 10);

-- COMMENTS (3-6 per campaign)
-- Campaign 1 (Public, comments active, no approval needed)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(1, 1, 'Bellissima iniziativa! Ho già parlato ai miei vicini e molti sono interessati a partecipare alla giornata ecologica.', '2026-03-06 09:00:00', 1),
(3, 1, 'Supporto totale! È importante prendersi cura degli spazi pubblici. Vorrei suggerire di aggiungere anche panchine nuove.', '2026-03-06 10:30:00', 1),
(5, 1, 'Fantastico progetto. Personalmente mi offro come volontario per la giornata ecologica.', '2026-03-06 11:15:00', 1),
(4, 1, 'Domanda: saranno forniti i guanti e gli attrezzi? Comunque supporto l''idea.', '2026-03-06 12:00:00', 1),
(6, 1, 'Dovremmo anche coinvolgere le scuole del territorio in questa iniziativa.', '2026-03-06 14:45:00', 1);

-- Campaign 2 (Public, comments require approval)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(1, 2, 'L''illuminazione LED è una scelta ecologica eccellente. I consumi ridotti aiuteranno l''ambiente.', '2026-03-07 10:00:00', 1),
(3, 2, 'Mi preoccupa il costo iniziale, anche se a lungo termine si recupera con i risparmi energetici.', '2026-03-07 11:20:00', 1),
(4, 2, 'Questo migliorerà significativamente la sicurezza di chi frequenta il parco la sera.', '2026-03-07 13:30:00', 1),
(5, 2, 'Supporto pieno per questo progetto sostenibile e moderno.', '2026-03-07 15:00:00', 1),
(6, 2, 'Quando potremmo aspettarci l''installazione se la campagna ha successo?', '2026-03-07 16:30:00', 1);

-- Campaign 3 (Public, comments active, no approval needed)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(2, 3, 'Sono un genitore e mi preoccupa molto la sicurezza dei bambini. Questo progetto è essenziale.', '2026-03-08 11:00:00', 1),
(3, 3, 'Gli studi sulla viabilità sono importanti. Sono curioso di vederli prima di firmare.', '2026-03-08 12:30:00', 1),
(7, 3, 'Conosco perfettamente il punto critico vicino alla scuola primaria di via Roma. Supporto totale.', '2026-03-08 14:00:00', 1),
(8, 3, 'Finalmente un''iniziativa seria sulla sicurezza. Distribuiranno anche materiale informativo alle scuole?', '2026-03-08 15:30:00', 1);

-- Campaign 4 (Private campaign in org - only org members can comment)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(2, 4, 'Ho visto dati internazionali che confermano la riduzione del 40%. Supporto questa proposta.', '2026-03-09 12:00:00', 1),
(3, 4, 'Qualche residente si opporrà perché vuole andare più veloce, ma il beneficio complessivo è evidente.', '2026-03-09 13:15:00', 1),
(4, 4, 'Dovremmo anche proporre zone a 20 km/h vicino alle scuole per maggiore sicurezza.', '2026-03-09 14:45:00', 1),
(7, 4, 'Propongo di coordinare questa campagna con il comune prima della presentazione ufficiale.', '2026-03-09 16:00:00', 1),
(8, 4, 'Ho analizzato i dati del nostro quartiere: 12 incidenti negli ultimi 2 anni, principalmente per eccesso di velocità.', '2026-03-09 17:30:00', 1);

-- Campaign 5 (Private org, comments do not require approval)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(3, 5, 'Sono entusiasta per gli speaker internazionali. Avete già confermato le loro partecipazioni?', '2026-03-10 14:00:00', 1),
(5, 5, 'Le mostre di arte locale sono sempre un punto forte dei nostri eventi. Non vedo l''ora.', '2026-03-10 15:30:00', 1),
(9, 5, 'Prenoterei già i miei posti per tutti i tre giorni. Sarà un evento imperdibile.', '2026-03-10 17:00:00', 1);

-- Campaign 6 (Public, no org, comments active)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(1, 6, 'La biblioteca è un servizio essenziale. Completamente d''accordo con l''ampliamento.', '2026-03-11 15:00:00', 1),
(2, 6, 'Ho notato il sovraffollamento nelle ore pomeridiane. Una sezione ragazzi sarebbe fantástica.', '2026-03-11 16:15:00', 1),
(5, 6, 'I nuovi computer aiuteranno chi non ha accesso a internet a casa. Importante iniziativa di inclusione digitale.', '2026-03-11 17:45:00', 1),
(6, 6, 'Sono una insegnante e porto spesso i miei studenti in biblioteca. Supporto al 100%.', '2026-03-11 18:30:00', 1),
(7, 6, 'Che tempi di realizzazione dopo l''approvazione? Voglio monitorare il progetto.', '2026-03-12 09:00:00', 1);

-- Campaign 7 (Private campaign - visible only to signers and specific users)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(3, 7, 'Questa riserva naturale è l''ultima speranza per preservare l''ecosistema locale prima che sia troppo tardi.', '2026-03-12 16:00:00', 1),
(5, 7, 'Ho studiato la flora della zona: 34 specie di piante rare che si trovano solo qui nella regione.', '2026-03-12 17:30:00', 1),
(9, 7, 'Sono ornitologi e abbiamo documentato 12 specie di uccelli nidificanti nell''area. Questo la rende ancor più importante.', '2026-03-13 10:00:00', 1),
(10, 7, 'Conosco personalmente gli investitori immobiliari interessati al terreno. Dobbiamo agire in fretta.', '2026-03-13 11:30:00', 1);

-- Campaign 8 (Public, comments NOT active - intentionally has 0 comments to test disabled comments feature)
-- No comments inserted for campaign 8

-- Campaign 9 (Private campaign, comments active)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(1, 9, 'Mio figlio ha esigenze educative specifiche e questa iniziativa è proprio quello che cercavo.', '2026-03-14 18:00:00', 1),
(2, 9, 'La consulenza psicopedagogica continuativa è fondamentale per il progresso dei bambini.', '2026-03-14 19:15:00', 1),
(5, 9, 'Sono un insegnante specializzato e apprezzo molto questo approccio personalizzato e integrato.', '2026-03-14 20:30:00', 1);

-- Campaign 10 (Public, comments active and require approval)
INSERT INTO `comments` (user_id, campaign_id, text, created_at, visible) VALUES
(1, 10, 'Il percorso ciclopedonale potrebbe trasformare il mio modo di muovermi in città. Fantastico!', '2026-03-15 18:30:00', 1),
(2, 10, 'Ridurre l''utilizzo di auto private del 15% avrebbe un impatto positivo enorme sulla qualità dell''aria.', '2026-03-15 19:45:00', 1),
(3, 10, 'Sono ciclista e ne approfitterò molto. La sezione sotterranea è una soluzione intelligente.', '2026-03-16 09:00:00', 1),
(4, 10, 'Mi chiedo quanti posti di lavoro verrebbero creati durante la costruzione di questo progetto.', '2026-03-16 10:30:00', 1),
(6, 10, 'Meraviglioso per i pendolari come me! Finalmente una alternativa sicura alle auto.', '2026-03-16 11:45:00', 1),
(10, 10, 'Ho calcolato che potrei risparmiare €3000 all''anno in carburante e parcheggio. Supporto pieno.', '2026-03-16 13:15:00', 1);

-- FAVORITES (varied distribution across users)
INSERT INTO `favorites` (user_id, campaign_id) VALUES
-- User 1 favorites: campaigns 1, 6, 10
(1, 1), (1, 6), (1, 10),
-- User 2 favorites: campaigns 3, 6, 8
(2, 3), (2, 6), (2, 8),
-- User 3 favorites: campaigns 1, 2, 3, 5, 7
(3, 1), (3, 2), (3, 3), (3, 5), (3, 7),
-- User 4 favorites: campaigns 1, 3, 8, 10
(4, 1), (4, 3), (4, 8), (4, 10),
-- User 5 favorites: campaigns 1, 2, 6, 9
(5, 1), (5, 2), (5, 6), (5, 9),
-- User 6 favorites: campaigns 1, 6
(6, 1), (6, 6),
-- User 7 favorites: campaigns 3, 6, 10
(7, 3), (7, 6), (7, 10),
-- User 8 favorites: campaigns 3, 8
(8, 3), (8, 8),
-- User 9 favorites: campaigns 5, 7
(9, 5), (9, 7),
-- User 10 favorites: campaign 6
(10, 6);

SET @@FOREIGN_KEY_CHECKS=1;

-- Reference passwords for testing:
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
