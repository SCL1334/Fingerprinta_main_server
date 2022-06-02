-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: fingerprinta.cg3mzhfsibey.ap-northeast-1.rds.amazonaws.com    Database: fingerprinta_demo
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar` (
  `date` datetime NOT NULL,
  `need_punch` tinyint NOT NULL,
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
INSERT INTO `calendar` VALUES ('2022-01-01 00:00:00',0),('2022-01-02 00:00:00',0),('2022-01-03 00:00:00',1),('2022-01-04 00:00:00',1),('2022-01-05 00:00:00',1),('2022-01-06 00:00:00',1),('2022-01-07 00:00:00',1),('2022-01-08 00:00:00',0),('2022-01-09 00:00:00',0),('2022-01-10 00:00:00',1),('2022-01-11 00:00:00',1),('2022-01-12 00:00:00',1),('2022-01-13 00:00:00',1),('2022-01-14 00:00:00',1),('2022-01-15 00:00:00',0),('2022-01-16 00:00:00',0),('2022-01-17 00:00:00',1),('2022-01-18 00:00:00',1),('2022-01-19 00:00:00',1),('2022-01-20 00:00:00',1),('2022-01-21 00:00:00',1),('2022-01-22 00:00:00',1),('2022-01-23 00:00:00',0),('2022-01-24 00:00:00',1),('2022-01-25 00:00:00',1),('2022-01-26 00:00:00',1),('2022-01-27 00:00:00',1),('2022-01-28 00:00:00',1),('2022-01-29 00:00:00',0),('2022-01-30 00:00:00',0),('2022-01-31 00:00:00',0),('2022-02-01 00:00:00',0),('2022-02-02 00:00:00',0),('2022-02-03 00:00:00',0),('2022-02-04 00:00:00',0),('2022-02-05 00:00:00',0),('2022-02-06 00:00:00',0),('2022-02-07 00:00:00',1),('2022-02-08 00:00:00',1),('2022-02-09 00:00:00',1),('2022-02-10 00:00:00',1),('2022-02-11 00:00:00',1),('2022-02-12 00:00:00',0),('2022-02-13 00:00:00',0),('2022-02-14 00:00:00',1),('2022-02-15 00:00:00',1),('2022-02-16 00:00:00',1),('2022-02-17 00:00:00',1),('2022-02-18 00:00:00',1),('2022-02-19 00:00:00',0),('2022-02-20 00:00:00',0),('2022-02-21 00:00:00',1),('2022-02-22 00:00:00',1),('2022-02-23 00:00:00',1),('2022-02-24 00:00:00',1),('2022-02-25 00:00:00',1),('2022-02-26 00:00:00',0),('2022-02-27 00:00:00',0),('2022-02-28 00:00:00',0),('2022-03-01 00:00:00',1),('2022-03-02 00:00:00',1),('2022-03-03 00:00:00',1),('2022-03-04 00:00:00',1),('2022-03-05 00:00:00',0),('2022-03-06 00:00:00',0),('2022-03-07 00:00:00',1),('2022-03-08 00:00:00',1),('2022-03-09 00:00:00',1),('2022-03-10 00:00:00',1),('2022-03-11 00:00:00',1),('2022-03-12 00:00:00',0),('2022-03-13 00:00:00',0),('2022-03-14 00:00:00',1),('2022-03-15 00:00:00',1),('2022-03-16 00:00:00',1),('2022-03-17 00:00:00',1),('2022-03-18 00:00:00',1),('2022-03-19 00:00:00',0),('2022-03-20 00:00:00',0),('2022-03-21 00:00:00',1),('2022-03-22 00:00:00',1),('2022-03-23 00:00:00',1),('2022-03-24 00:00:00',1),('2022-03-25 00:00:00',1),('2022-03-26 00:00:00',0),('2022-03-27 00:00:00',0),('2022-03-28 00:00:00',1),('2022-03-29 00:00:00',1),('2022-03-30 00:00:00',1),('2022-03-31 00:00:00',1),('2022-04-01 00:00:00',1),('2022-04-02 00:00:00',0),('2022-04-03 00:00:00',0),('2022-04-04 00:00:00',0),('2022-04-05 00:00:00',0),('2022-04-06 00:00:00',1),('2022-04-07 00:00:00',1),('2022-04-08 00:00:00',1),('2022-04-09 00:00:00',0),('2022-04-10 00:00:00',0),('2022-04-11 00:00:00',1),('2022-04-12 00:00:00',1),('2022-04-13 00:00:00',1),('2022-04-14 00:00:00',1),('2022-04-15 00:00:00',1),('2022-04-16 00:00:00',0),('2022-04-17 00:00:00',0),('2022-04-18 00:00:00',1),('2022-04-19 00:00:00',1),('2022-04-20 00:00:00',1),('2022-04-21 00:00:00',1),('2022-04-22 00:00:00',1),('2022-04-23 00:00:00',0),('2022-04-24 00:00:00',0),('2022-04-25 00:00:00',1),('2022-04-26 00:00:00',1),('2022-04-27 00:00:00',1),('2022-04-28 00:00:00',1),('2022-04-29 00:00:00',1),('2022-04-30 00:00:00',0),('2022-05-01 00:00:00',0),('2022-05-02 00:00:00',0),('2022-05-03 00:00:00',1),('2022-05-04 00:00:00',1),('2022-05-05 00:00:00',1),('2022-05-06 00:00:00',1),('2022-05-07 00:00:00',0),('2022-05-08 00:00:00',0),('2022-05-09 00:00:00',1),('2022-05-10 00:00:00',1),('2022-05-11 00:00:00',1),('2022-05-12 00:00:00',1),('2022-05-13 00:00:00',1),('2022-05-14 00:00:00',0),('2022-05-15 00:00:00',0),('2022-05-16 00:00:00',1),('2022-05-17 00:00:00',1),('2022-05-18 00:00:00',1),('2022-05-19 00:00:00',1),('2022-05-20 00:00:00',1),('2022-05-21 00:00:00',0),('2022-05-22 00:00:00',0),('2022-05-23 00:00:00',1),('2022-05-24 00:00:00',1),('2022-05-25 00:00:00',1),('2022-05-26 00:00:00',1),('2022-05-27 00:00:00',1),('2022-05-28 00:00:00',0),('2022-05-29 00:00:00',0),('2022-05-30 00:00:00',1),('2022-05-31 00:00:00',0),('2022-06-01 00:00:00',1),('2022-06-02 00:00:00',1),('2022-06-03 00:00:00',0),('2022-06-04 00:00:00',0),('2022-06-05 00:00:00',0),('2022-06-06 00:00:00',1),('2022-06-07 00:00:00',1),('2022-06-08 00:00:00',1),('2022-06-09 00:00:00',1),('2022-06-10 00:00:00',1),('2022-06-11 00:00:00',0),('2022-06-12 00:00:00',0),('2022-06-13 00:00:00',1),('2022-06-14 00:00:00',1),('2022-06-15 00:00:00',1),('2022-06-16 00:00:00',1),('2022-06-17 00:00:00',1),('2022-06-18 00:00:00',0),('2022-06-19 00:00:00',0),('2022-06-20 00:00:00',1),('2022-06-21 00:00:00',1),('2022-06-22 00:00:00',1),('2022-06-23 00:00:00',1),('2022-06-24 00:00:00',1),('2022-06-25 00:00:00',0),('2022-06-26 00:00:00',0),('2022-06-27 00:00:00',1),('2022-06-28 00:00:00',1),('2022-06-29 00:00:00',1),('2022-06-30 00:00:00',1),('2022-07-01 00:00:00',1),('2022-07-02 00:00:00',0),('2022-07-03 00:00:00',0),('2022-07-04 00:00:00',1),('2022-07-05 00:00:00',1),('2022-07-06 00:00:00',1),('2022-07-07 00:00:00',1),('2022-07-08 00:00:00',1),('2022-07-09 00:00:00',0),('2022-07-10 00:00:00',0),('2022-07-11 00:00:00',1),('2022-07-12 00:00:00',1),('2022-07-13 00:00:00',1),('2022-07-14 00:00:00',1),('2022-07-15 00:00:00',1),('2022-07-16 00:00:00',0),('2022-07-17 00:00:00',0),('2022-07-18 00:00:00',1),('2022-07-19 00:00:00',1),('2022-07-20 00:00:00',1),('2022-07-21 00:00:00',1),('2022-07-22 00:00:00',1),('2022-07-23 00:00:00',0),('2022-07-24 00:00:00',0),('2022-07-25 00:00:00',1),('2022-07-26 00:00:00',1),('2022-07-27 00:00:00',1),('2022-07-28 00:00:00',1),('2022-07-29 00:00:00',1),('2022-07-30 00:00:00',0),('2022-07-31 00:00:00',0),('2022-08-01 00:00:00',1),('2022-08-02 00:00:00',1),('2022-08-03 00:00:00',1),('2022-08-04 00:00:00',1),('2022-08-05 00:00:00',1),('2022-08-06 00:00:00',0),('2022-08-07 00:00:00',0),('2022-08-08 00:00:00',1),('2022-08-09 00:00:00',1),('2022-08-10 00:00:00',1),('2022-08-11 00:00:00',1),('2022-08-12 00:00:00',1),('2022-08-13 00:00:00',0),('2022-08-14 00:00:00',0),('2022-08-15 00:00:00',1),('2022-08-16 00:00:00',1),('2022-08-17 00:00:00',1),('2022-08-18 00:00:00',1),('2022-08-19 00:00:00',1),('2022-08-20 00:00:00',0),('2022-08-21 00:00:00',0),('2022-08-22 00:00:00',1),('2022-08-23 00:00:00',1),('2022-08-24 00:00:00',1),('2022-08-25 00:00:00',1),('2022-08-26 00:00:00',1),('2022-08-27 00:00:00',0),('2022-08-28 00:00:00',0),('2022-08-29 00:00:00',1),('2022-08-30 00:00:00',1),('2022-08-31 00:00:00',1),('2022-09-01 00:00:00',1),('2022-09-02 00:00:00',1),('2022-09-03 00:00:00',0),('2022-09-04 00:00:00',0),('2022-09-05 00:00:00',1),('2022-09-06 00:00:00',1),('2022-09-07 00:00:00',1),('2022-09-08 00:00:00',1),('2022-09-09 00:00:00',0),('2022-09-10 00:00:00',0),('2022-09-11 00:00:00',0),('2022-09-12 00:00:00',1),('2022-09-13 00:00:00',1),('2022-09-14 00:00:00',1),('2022-09-15 00:00:00',1),('2022-09-16 00:00:00',1),('2022-09-17 00:00:00',0),('2022-09-18 00:00:00',0),('2022-09-19 00:00:00',1),('2022-09-20 00:00:00',1),('2022-09-21 00:00:00',1),('2022-09-22 00:00:00',1),('2022-09-23 00:00:00',1),('2022-09-24 00:00:00',0),('2022-09-25 00:00:00',0),('2022-09-26 00:00:00',1),('2022-09-27 00:00:00',1),('2022-09-28 00:00:00',1),('2022-09-29 00:00:00',1),('2022-09-30 00:00:00',1),('2022-10-01 00:00:00',0),('2022-10-02 00:00:00',0),('2022-10-03 00:00:00',1),('2022-10-04 00:00:00',1),('2022-10-05 00:00:00',1),('2022-10-06 00:00:00',1),('2022-10-07 00:00:00',1),('2022-10-08 00:00:00',0),('2022-10-09 00:00:00',0),('2022-10-10 00:00:00',0),('2022-10-11 00:00:00',1),('2022-10-12 00:00:00',1),('2022-10-13 00:00:00',1),('2022-10-14 00:00:00',1),('2022-10-15 00:00:00',0),('2022-10-16 00:00:00',0),('2022-10-17 00:00:00',1),('2022-10-18 00:00:00',1),('2022-10-19 00:00:00',1),('2022-10-20 00:00:00',1),('2022-10-21 00:00:00',1),('2022-10-22 00:00:00',0),('2022-10-23 00:00:00',0),('2022-10-24 00:00:00',1),('2022-10-25 00:00:00',1),('2022-10-26 00:00:00',1),('2022-10-27 00:00:00',1),('2022-10-28 00:00:00',1),('2022-10-29 00:00:00',0),('2022-10-30 00:00:00',0),('2022-10-31 00:00:00',1),('2022-11-01 00:00:00',1),('2022-11-02 00:00:00',1),('2022-11-03 00:00:00',1),('2022-11-04 00:00:00',1),('2022-11-05 00:00:00',0),('2022-11-06 00:00:00',0),('2022-11-07 00:00:00',1),('2022-11-08 00:00:00',1),('2022-11-09 00:00:00',1),('2022-11-10 00:00:00',1),('2022-11-11 00:00:00',1),('2022-11-12 00:00:00',0),('2022-11-13 00:00:00',0),('2022-11-14 00:00:00',1),('2022-11-15 00:00:00',1),('2022-11-16 00:00:00',1),('2022-11-17 00:00:00',1),('2022-11-18 00:00:00',1),('2022-11-19 00:00:00',0),('2022-11-20 00:00:00',0),('2022-11-21 00:00:00',1),('2022-11-22 00:00:00',1),('2022-11-23 00:00:00',1),('2022-11-24 00:00:00',1),('2022-11-25 00:00:00',1),('2022-11-26 00:00:00',0),('2022-11-27 00:00:00',0),('2022-11-28 00:00:00',1),('2022-11-29 00:00:00',1),('2022-11-30 00:00:00',1),('2022-12-01 00:00:00',1),('2022-12-02 00:00:00',1),('2022-12-03 00:00:00',0),('2022-12-04 00:00:00',0),('2022-12-05 00:00:00',1),('2022-12-06 00:00:00',1),('2022-12-07 00:00:00',1),('2022-12-08 00:00:00',1),('2022-12-09 00:00:00',1),('2022-12-10 00:00:00',0),('2022-12-11 00:00:00',0),('2022-12-12 00:00:00',1),('2022-12-13 00:00:00',1),('2022-12-14 00:00:00',1),('2022-12-15 00:00:00',1),('2022-12-16 00:00:00',1),('2022-12-17 00:00:00',0),('2022-12-18 00:00:00',0),('2022-12-19 00:00:00',1),('2022-12-20 00:00:00',1),('2022-12-21 00:00:00',1),('2022-12-22 00:00:00',1),('2022-12-23 00:00:00',1),('2022-12-24 00:00:00',0),('2022-12-25 00:00:00',0),('2022-12-26 00:00:00',1),('2022-12-27 00:00:00',1),('2022-12-28 00:00:00',1),('2022-12-29 00:00:00',1),('2022-12-30 00:00:00',1),('2022-12-31 00:00:00',0);
/*!40000 ALTER TABLE `calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `class_type_id` tinyint unsigned NOT NULL,
  `batch` smallint unsigned NOT NULL,
  `class_group_id` tinyint unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `class_type_id_idx` (`class_type_id`),
  KEY `class_group_id_idx` (`class_group_id`),
  CONSTRAINT `class_group_id` FOREIGN KEY (`class_group_id`) REFERENCES `class_group` (`id`),
  CONSTRAINT `class_type_id` FOREIGN KEY (`class_type_id`) REFERENCES `class_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class`
--

LOCK TABLES `class` WRITE;
/*!40000 ALTER TABLE `class` DISABLE KEYS */;
INSERT INTO `class` VALUES (4,4,15,4,'2022-02-09','2022-06-17');
/*!40000 ALTER TABLE `class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_group`
--

DROP TABLE IF EXISTS `class_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_group` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_group`
--

LOCK TABLES `class_group` WRITE;
/*!40000 ALTER TABLE `class_group` DISABLE KEYS */;
INSERT INTO `class_group` VALUES (4,'Back-End'),(5,'iOS');
/*!40000 ALTER TABLE `class_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_routine`
--

DROP TABLE IF EXISTS `class_routine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_routine` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `class_type_id` tinyint unsigned NOT NULL,
  `weekday` tinyint unsigned NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`class_type_id`,`weekday`),
  CONSTRAINT `class_routine_ibfk_1` FOREIGN KEY (`class_type_id`) REFERENCES `class_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_routine`
--

LOCK TABLES `class_routine` WRITE;
/*!40000 ALTER TABLE `class_routine` DISABLE KEYS */;
INSERT INTO `class_routine` VALUES (49,4,2,'09:00:00','18:00:00'),(50,4,3,'09:00:00','18:00:00'),(51,4,4,'09:00:00','18:00:00'),(52,4,5,'09:00:00','18:00:00'),(54,4,1,'09:00:00','18:30:00');
/*!40000 ALTER TABLE `class_routine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_type`
--

DROP TABLE IF EXISTS `class_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_type` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_type`
--

LOCK TABLES `class_type` WRITE;
/*!40000 ALTER TABLE `class_type` DISABLE KEYS */;
INSERT INTO `class_type` VALUES (4,'Bootcamp'),(5,'Campus');
/*!40000 ALTER TABLE `class_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fingerprint`
--

DROP TABLE IF EXISTS `fingerprint`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fingerprint` (
  `id` tinyint unsigned NOT NULL,
  `student_id` smallint DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fingerprint`
--

LOCK TABLES `fingerprint` WRITE;
/*!40000 ALTER TABLE `fingerprint` DISABLE KEYS */;
INSERT INTO `fingerprint` VALUES (0,20,1),(1,19,1),(2,NULL,0),(3,NULL,0),(4,NULL,0),(5,NULL,0),(6,NULL,0),(7,NULL,0),(8,NULL,0),(9,NULL,0),(10,NULL,0),(11,NULL,0),(12,NULL,0),(13,NULL,0),(14,NULL,0),(15,NULL,0),(16,NULL,0),(17,NULL,0),(18,NULL,0),(19,NULL,0),(20,NULL,0),(21,NULL,0),(22,NULL,0),(23,NULL,0),(24,NULL,0),(25,NULL,0),(26,NULL,0),(27,NULL,0),(28,NULL,0),(29,NULL,0),(30,NULL,0),(31,NULL,0),(32,NULL,0),(33,NULL,0),(34,NULL,0),(35,NULL,0),(36,NULL,0),(37,NULL,0),(38,NULL,0),(39,NULL,0),(40,NULL,0),(41,NULL,0),(42,NULL,0),(43,NULL,0),(44,NULL,0),(45,NULL,0),(46,NULL,0),(47,NULL,0),(48,NULL,0),(49,NULL,0),(50,NULL,0),(51,NULL,0),(52,NULL,0),(53,NULL,0),(54,NULL,0),(55,NULL,0),(56,NULL,0),(57,NULL,0),(58,NULL,0),(59,NULL,0),(60,NULL,0),(61,NULL,0),(62,NULL,0),(63,NULL,0),(64,NULL,0),(65,NULL,0),(66,NULL,0),(67,NULL,0),(68,NULL,0),(69,NULL,0),(70,NULL,0),(71,NULL,0),(72,NULL,0),(73,NULL,0),(74,NULL,0),(75,NULL,0),(76,NULL,0),(77,NULL,0),(78,NULL,0),(79,NULL,0),(80,NULL,0),(81,NULL,0),(82,NULL,0),(83,NULL,0),(84,NULL,0),(85,NULL,0),(86,NULL,0),(87,NULL,0),(88,NULL,0),(89,NULL,0),(90,NULL,0),(91,NULL,0),(92,NULL,0),(93,NULL,0),(94,NULL,0),(95,NULL,0),(96,NULL,0),(97,NULL,0),(98,NULL,0),(99,NULL,0),(100,NULL,0),(101,NULL,0),(102,NULL,0),(103,NULL,0),(104,NULL,0),(105,NULL,0),(106,NULL,0),(107,NULL,0),(108,NULL,0),(109,NULL,0),(110,NULL,0),(111,NULL,0),(112,NULL,0),(113,NULL,0),(114,NULL,0),(115,NULL,0),(116,NULL,0),(117,NULL,0),(118,NULL,0),(119,NULL,0),(120,NULL,0),(121,NULL,0),(122,NULL,0),(123,NULL,0),(124,NULL,0),(125,NULL,0),(126,NULL,0),(127,NULL,0),(128,NULL,0),(129,NULL,0),(130,NULL,0),(131,NULL,0),(132,NULL,0),(133,NULL,0),(134,NULL,0),(135,NULL,0),(136,NULL,0),(137,NULL,0),(138,NULL,0),(139,NULL,0),(140,NULL,0),(141,NULL,0),(142,NULL,0),(143,NULL,0),(144,NULL,0),(145,NULL,0),(146,NULL,0),(147,NULL,0),(148,NULL,0),(149,NULL,0),(150,NULL,0),(151,NULL,0),(152,NULL,0),(153,NULL,0),(154,NULL,0),(155,NULL,0),(156,NULL,0),(157,NULL,0),(158,NULL,0),(159,NULL,0),(160,NULL,0),(161,NULL,0),(162,NULL,0),(163,NULL,0),(164,NULL,0),(165,NULL,0),(166,NULL,0),(167,NULL,0),(168,NULL,0),(169,NULL,0),(170,NULL,0),(171,NULL,0),(172,NULL,0),(173,NULL,0),(174,NULL,0),(175,NULL,0),(176,NULL,0),(177,NULL,0),(178,NULL,0),(179,NULL,0),(180,NULL,0),(181,NULL,0),(182,NULL,0),(183,NULL,0),(184,NULL,0),(185,NULL,0),(186,NULL,0),(187,NULL,0),(188,NULL,0),(189,NULL,0),(190,NULL,0),(191,NULL,0),(192,NULL,0),(193,NULL,0),(194,NULL,0),(195,NULL,0),(196,NULL,0),(197,NULL,0),(198,NULL,0),(199,NULL,0);
/*!40000 ALTER TABLE `fingerprint` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_type`
--

DROP TABLE IF EXISTS `leave_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_type` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `need_calculate` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_type`
--

LOCK TABLES `leave_type` WRITE;
/*!40000 ALTER TABLE `leave_type` DISABLE KEYS */;
INSERT INTO `leave_type` VALUES (10,'病假',1),(11,'事假',1),(12,'補出席',1),(13,'喪假',0),(14,'防疫假',0);
/*!40000 ALTER TABLE `leave_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `punch_exception`
--

DROP TABLE IF EXISTS `punch_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `punch_exception` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `class_type_id` tinyint unsigned NOT NULL,
  `batch` tinyint unsigned NOT NULL,
  `date` date NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`class_type_id`,`batch`,`date`),
  KEY `date_index` (`date`),
  CONSTRAINT `punch_exception_ibfk_1` FOREIGN KEY (`class_type_id`) REFERENCES `class_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `punch_exception`
--

LOCK TABLES `punch_exception` WRITE;
/*!40000 ALTER TABLE `punch_exception` DISABLE KEYS */;
INSERT INTO `punch_exception` VALUES (30,4,15,'2022-05-25','09:00:00','15:00:00'),(31,4,15,'2022-05-30','10:00:00','12:00:00');
/*!40000 ALTER TABLE `punch_exception` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` char(95) NOT NULL,
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update` datetime DEFAULT NULL,
  `last_signin` datetime DEFAULT NULL,
  `password_default` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (5,'admin','cde@staff.com','$argon2i$v=19$m=4096,t=3,p=1$yaj37l0sVqQdyE2yV2A8ZA$JFI3BgQGv4CY5asa8SNH1Z6HFmJI44eme/77sW752zw','2022-05-30 03:16:12',NULL,NULL,1),(6,'Blue','blue@staff.com','$argon2i$v=19$m=4096,t=3,p=1$9/o2yonfbzk/LdF+oat91A$zTv/i5uihy/ppSsgmGigmVIIsFVcdrkcxqd3nQzHapk','2022-05-30 05:04:59',NULL,NULL,1);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` char(95) NOT NULL,
  `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_signin` datetime DEFAULT NULL,
  `password_default` tinyint NOT NULL DEFAULT '1',
  `class_id` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_UNIQUE` (`email`),
  KEY `class_id_idx` (`class_id`),
  CONSTRAINT `class_id` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (15,'鄭恆慈','zhenghengci@teleworm.tw','$argon2i$v=19$m=4096,t=3,p=1$bpcBB4Rxn5cCQUGslEZCSQ$FnNMsiwW3Hcb5Fh6T/C1i7S+oUA1lp6YDGrkRL/BWcE','2022-05-30 03:26:20','2022-05-30 03:26:20',NULL,1,4),(16,'毛琬婷','maowanting@teleworm.tw','$argon2i$v=19$m=4096,t=3,p=1$8dlv9ScCrklUMNf0d1vGBw$P3sr12nN7L0WoLF6KyPTHvFZB0Kgv8umbXwx39RPzBU','2022-05-30 03:26:20','2022-05-30 03:26:20',NULL,1,4),(17,'陸于禎','liuxuzheng0204@dayrep.com','$argon2i$v=19$m=4096,t=3,p=1$ZOpEy8OfFe39ym/SWJHEkg$+mQq7off7oQcl5FxFdFrStIwlHgS/+gSMB/FggX/Kuo','2022-05-30 03:26:20','2022-05-30 03:26:20',NULL,1,4),(18,'江依珊','jiangyishan@teleworm.us','$argon2i$v=19$m=4096,t=3,p=1$SjgfnwOnHPj4kaGGbeT+Ow$q66WuKIQQI2kHYRLJUTOsDSBbvMXS4Hqg0HbXB8H5V0','2022-05-30 03:26:20','2022-05-30 03:26:20',NULL,1,4),(19,'邱彥燈','qiuyandeng@rhyta.com','$argon2i$v=19$m=4096,t=3,p=1$2JvIb8kCVdYIdAuGYT8zug$aKMjsfBzo2Ra84KoCtL8oE/eKmvPMOyga1dfUqbrPCU','2022-05-30 03:26:20','2022-05-30 03:26:20',NULL,1,4),(20,'葛國安','geguoan@armyspy.com','$argon2i$v=19$m=4096,t=3,p=1$EEWI6WmjyDkaYTkpYXg96Q$LtoqgdFD6Jy29B04AHI6lZBzKYRjM7i/SozGlzI8fRk','2022-05-30 03:27:09','2022-05-30 03:27:09',NULL,1,4);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leave`
--

DROP TABLE IF EXISTS `student_leave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_leave` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `student_id` smallint unsigned NOT NULL,
  `leave_type_id` tinyint unsigned NOT NULL,
  `date` date NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  `approval` tinyint NOT NULL DEFAULT '0',
  `hours` tinyint unsigned NOT NULL,
  `create_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_update` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reason` varchar(50) DEFAULT NULL,
  `note` varchar(50) DEFAULT NULL,
  `certificate_url` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_type_id_idx` (`leave_type_id`),
  KEY `student_id_idx` (`student_id`),
  KEY `date_index` (`date`),
  CONSTRAINT `leave_type_id` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type` (`id`),
  CONSTRAINT `student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leave`
--

LOCK TABLES `student_leave` WRITE;
/*!40000 ALTER TABLE `student_leave` DISABLE KEYS */;
INSERT INTO `student_leave` VALUES (1,18,11,'2022-05-01','10:00:00','16:00:00',0,5,'2022-05-30 03:30:10','2022-05-30 03:32:18','考試','',NULL),(2,17,10,'2022-05-06','13:00:00','14:00:00',0,1,'2022-05-30 03:30:10','2022-05-30 03:32:26','看醫生','',NULL),(3,17,11,'2022-05-11','10:00:00','18:00:00',0,7,'2022-05-30 03:30:10','2022-05-30 03:32:44','寵物看醫生','',NULL),(4,18,10,'2022-05-17','10:00:00','16:00:00',0,5,'2022-05-30 03:30:10','2022-05-30 03:33:06','身體不適','',NULL),(5,16,11,'2022-05-19','11:00:00','18:00:00',0,6,'2022-05-30 03:30:10','2022-05-30 03:33:56','處理租屋相關','',NULL),(9,18,11,'2022-05-28','10:00:00','15:00:00',0,4,'2022-05-30 03:30:10','2022-05-30 03:31:37','家裡有事','',NULL),(10,16,14,'2022-05-30','09:00:00','18:00:00',1,8,'2022-05-30 03:30:10','2022-06-01 21:15:20','自主健康管理','',NULL),(11,19,14,'2022-05-30','12:00:00','16:00:00',0,3,'2022-05-30 03:30:10','2022-05-30 03:31:10','自主健康管理','',NULL),(12,20,10,'2022-05-02','13:00:00','16:00:00',0,3,'2022-05-30 03:35:15','2022-05-30 03:35:15','看牙醫',NULL,'');
/*!40000 ALTER TABLE `student_leave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_punch`
--

DROP TABLE IF EXISTS `student_punch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_punch` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `student_id` smallint unsigned NOT NULL,
  `punch_date` date DEFAULT NULL,
  `punch_in` time DEFAULT NULL,
  `punch_out` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id_idx` (`student_id`),
  KEY `date_index` (`punch_date`),
  CONSTRAINT `student_id` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_punch`
--

LOCK TABLES `student_punch` WRITE;
/*!40000 ALTER TABLE `student_punch` DISABLE KEYS */;
INSERT INTO `student_punch` VALUES (1,15,'2022-05-01','09:05:00','17:45:00'),(2,16,'2022-05-01','09:07:00','17:54:00'),(3,17,'2022-05-01',NULL,NULL),(4,18,'2022-05-01','09:21:00',NULL),(5,19,'2022-05-01','09:01:00','18:18:00'),(6,20,'2022-05-01','08:47:00','18:11:00'),(7,15,'2022-05-02','08:37:00','17:48:00'),(8,16,'2022-05-02','08:30:00','17:37:00'),(9,17,'2022-05-02','08:32:00','18:27:00'),(10,18,'2022-05-02','09:10:00','17:39:00'),(11,19,'2022-05-02','09:24:00','17:32:00'),(12,20,'2022-05-02','09:27:00','17:45:00'),(13,15,'2022-05-03','09:04:00','17:49:00'),(14,16,'2022-05-03','08:55:00','18:12:00'),(15,17,'2022-05-03','08:55:00','17:51:00'),(16,18,'2022-05-03','09:12:00','17:57:00'),(17,19,'2022-05-03','08:30:00','17:46:00'),(18,20,'2022-05-03',NULL,NULL),(19,15,'2022-05-04','08:44:00','18:23:00'),(20,16,'2022-05-04','09:00:00','17:42:00'),(21,17,'2022-05-04',NULL,NULL),(22,18,'2022-05-04','08:36:00','18:23:00'),(23,19,'2022-05-04',NULL,NULL),(24,20,'2022-05-04','08:40:00','17:30:00'),(25,15,'2022-05-05','09:26:00','17:35:00'),(26,16,'2022-05-05','09:20:00',NULL),(27,17,'2022-05-05','08:38:00',NULL),(28,18,'2022-05-05','09:19:00','17:30:00'),(29,19,'2022-05-05','09:21:00','18:17:00'),(30,20,'2022-05-05',NULL,NULL),(31,15,'2022-05-06','08:54:00',NULL),(32,16,'2022-05-06','08:54:00','18:21:00'),(33,17,'2022-05-06','09:19:00','18:07:00'),(34,18,'2022-05-06','09:13:00','17:59:00'),(35,19,'2022-05-06','09:11:00','18:06:00'),(36,20,'2022-05-06','08:56:00','18:08:00'),(37,15,'2022-05-07','08:43:00',NULL),(38,16,'2022-05-07','09:04:00',NULL),(39,17,'2022-05-07','08:33:00',NULL),(40,18,'2022-05-07','08:43:00','17:43:00'),(41,19,'2022-05-07','09:04:00','18:22:00'),(42,20,'2022-05-07','09:08:00','18:04:00'),(43,15,'2022-05-08','08:40:00','17:32:00'),(44,16,'2022-05-08','08:30:00',NULL),(45,17,'2022-05-08','08:40:00','17:55:00'),(46,18,'2022-05-08','09:02:00','18:03:00'),(47,19,'2022-05-08','08:54:00','18:15:00'),(48,20,'2022-05-08','09:15:00','18:04:00'),(49,15,'2022-05-09','08:34:00','18:28:00'),(50,16,'2022-05-09','09:27:00','17:45:00'),(51,17,'2022-05-09','08:45:00','18:21:00'),(52,18,'2022-05-09','09:23:00','17:35:00'),(53,19,'2022-05-09','08:56:00','17:54:00'),(54,20,'2022-05-09','09:18:00','17:46:00'),(55,15,'2022-05-10','08:53:00','17:37:00'),(56,16,'2022-05-10','09:17:00','18:07:00'),(57,17,'2022-05-10','08:37:00','17:57:00'),(58,18,'2022-05-10','09:18:00',NULL),(59,19,'2022-05-10','09:11:00','18:24:00'),(60,20,'2022-05-10','09:27:00','18:19:00'),(61,15,'2022-05-11','09:21:00','17:46:00'),(62,16,'2022-05-11','09:21:00','17:55:00'),(63,17,'2022-05-11','09:10:00','17:33:00'),(64,18,'2022-05-11','09:15:00','17:56:00'),(65,19,'2022-05-11','09:17:00','17:48:00'),(66,20,'2022-05-11','09:19:00','18:02:00'),(67,15,'2022-05-12','09:21:00','18:00:00'),(68,16,'2022-05-12','09:04:00','18:05:00'),(69,17,'2022-05-12','09:09:00','18:29:00'),(70,18,'2022-05-12','08:56:00','17:42:00'),(71,19,'2022-05-12','09:19:00',NULL),(72,20,'2022-05-12','08:52:00','17:45:00'),(73,15,'2022-05-13','09:01:00','18:07:00'),(74,16,'2022-05-13','08:31:00','17:41:00'),(75,17,'2022-05-13','08:42:00','17:46:00'),(76,18,'2022-05-13','08:37:00','18:04:00'),(77,19,'2022-05-13','09:04:00','18:00:00'),(78,20,'2022-05-13',NULL,NULL),(79,15,'2022-05-14','09:23:00','17:42:00'),(80,16,'2022-05-14','08:39:00','18:13:00'),(81,17,'2022-05-14','09:18:00','17:33:00'),(82,18,'2022-05-14','09:12:00','17:57:00'),(83,19,'2022-05-14','08:52:00','18:13:00'),(84,20,'2022-05-14','09:26:00','17:47:00'),(85,15,'2022-05-15','08:49:00','18:10:00'),(86,16,'2022-05-15','08:55:00',NULL),(87,17,'2022-05-15','08:35:00','18:15:00'),(88,18,'2022-05-15','09:09:00','18:06:00'),(89,19,'2022-05-15','08:34:00','18:25:00'),(90,20,'2022-05-15','08:58:00','18:06:00'),(91,15,'2022-05-16','09:02:00',NULL),(92,16,'2022-05-16','08:34:00','18:20:00'),(93,17,'2022-05-16','09:03:00','17:32:00'),(94,18,'2022-05-16','08:35:00','18:29:00'),(95,19,'2022-05-16','08:33:00','17:52:00'),(96,20,'2022-05-16','09:05:00',NULL),(97,15,'2022-05-17','08:44:00','17:34:00'),(98,16,'2022-05-17','09:09:00',NULL),(99,17,'2022-05-17','08:43:00','17:57:00'),(100,18,'2022-05-17','08:32:00','17:48:00'),(101,19,'2022-05-17','09:17:00','17:46:00'),(102,20,'2022-05-17','09:17:00','17:38:00'),(103,15,'2022-05-18','08:52:00',NULL),(104,16,'2022-05-18','09:28:00','18:23:00'),(105,17,'2022-05-18','09:05:00','17:44:00'),(106,18,'2022-05-18','09:18:00','17:36:00'),(107,19,'2022-05-18','09:02:00','17:33:00'),(108,20,'2022-05-18','08:36:00','17:34:00'),(109,15,'2022-05-19','08:30:00','18:15:00'),(110,16,'2022-05-19','09:27:00','18:05:00'),(111,17,'2022-05-19','09:23:00','18:15:00'),(112,18,'2022-05-19','08:59:00',NULL),(113,19,'2022-05-19','09:03:00',NULL),(114,20,'2022-05-19','08:33:00','17:54:00'),(115,15,'2022-05-20',NULL,NULL),(116,16,'2022-05-20','09:17:00','18:12:00'),(117,17,'2022-05-20','08:50:00','18:24:00'),(118,18,'2022-05-20','08:42:00','18:02:00'),(119,19,'2022-05-20','09:13:00','17:53:00'),(120,20,'2022-05-20','09:25:00','17:47:00'),(121,15,'2022-05-21','08:59:00',NULL),(122,16,'2022-05-21','08:41:00','17:52:00'),(123,17,'2022-05-21','08:37:00','18:24:00'),(124,18,'2022-05-21',NULL,NULL),(125,19,'2022-05-21','09:14:00','18:20:00'),(126,20,'2022-05-21','08:58:00',NULL),(127,15,'2022-05-22','09:04:00','17:55:00'),(128,16,'2022-05-22','08:36:00','18:10:00'),(129,17,'2022-05-22','08:49:00','17:51:00'),(130,18,'2022-05-22','08:53:00','17:45:00'),(131,19,'2022-05-22','08:43:00','18:27:00'),(132,20,'2022-05-22','08:33:00','18:05:00'),(133,15,'2022-05-23','09:27:00','18:09:00'),(134,16,'2022-05-23','09:14:00',NULL),(135,17,'2022-05-23','08:59:00','17:30:00'),(136,18,'2022-05-23','08:38:00','18:26:00'),(137,19,'2022-05-23','08:44:00','18:27:00'),(138,20,'2022-05-23','09:28:00','18:26:00'),(139,15,'2022-05-24',NULL,NULL),(140,16,'2022-05-24','09:17:00','18:01:00'),(141,17,'2022-05-24','08:48:00',NULL),(142,18,'2022-05-24','08:45:00',NULL),(143,19,'2022-05-24','09:28:00','17:48:00'),(144,20,'2022-05-24','08:49:00','17:52:00'),(145,15,'2022-05-25','08:50:00','18:15:00'),(146,16,'2022-05-25','09:04:00','18:20:00'),(147,17,'2022-05-25','09:28:00','17:44:00'),(148,18,'2022-05-25','09:13:00','17:56:00'),(149,19,'2022-05-25','09:18:00',NULL),(150,20,'2022-05-25','08:55:00','17:41:00'),(151,15,'2022-05-26','09:04:00','18:12:00'),(152,16,'2022-05-26','09:15:00','18:02:00'),(153,17,'2022-05-26','08:41:00','18:12:00'),(154,18,'2022-05-26','08:39:00','18:08:00'),(155,19,'2022-05-26','08:52:00','17:39:00'),(156,20,'2022-05-26','08:48:00','17:55:00'),(157,15,'2022-05-27','08:37:00',NULL),(158,16,'2022-05-27','09:23:00',NULL),(159,17,'2022-05-27','09:06:00',NULL),(160,18,'2022-05-27','08:39:00','17:51:00'),(161,19,'2022-05-27','08:50:00','17:45:00'),(162,20,'2022-05-27','09:01:00',NULL),(163,15,'2022-05-28','09:09:00','17:53:00'),(164,16,'2022-05-28','09:04:00','18:19:00'),(165,17,'2022-05-28','08:55:00','18:04:00'),(166,18,'2022-05-28','08:52:00','17:57:00'),(167,19,'2022-05-28','08:42:00','18:06:00'),(168,20,'2022-05-28','08:56:00','17:50:00'),(169,15,'2022-05-29','09:22:00',NULL),(170,16,'2022-05-29','08:40:00','18:26:00'),(171,17,'2022-05-29','09:29:00','17:56:00'),(172,18,'2022-05-29','08:47:00','17:33:00'),(173,19,'2022-05-29','09:12:00','18:27:00'),(174,20,'2022-05-29','09:09:00','17:58:00'),(175,15,'2022-05-30','08:45:00','17:35:00'),(176,16,'2022-05-30','08:53:00',NULL),(177,17,'2022-05-30','08:55:00','18:16:00'),(178,18,'2022-05-30','08:38:00','17:59:00'),(179,19,'2022-05-30','09:04:00','18:16:00'),(180,20,'2022-05-30','09:24:00','18:10:00'),(181,20,'2022-06-01','08:49:27','21:07:57'),(182,19,'2022-06-01','21:07:22','21:07:24'),(183,20,'2022-06-01','21:08:37',NULL);
/*!40000 ALTER TABLE `student_punch` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-06-02 16:34:22
